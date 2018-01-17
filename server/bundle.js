'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var http = require('http');
var express = _interopDefault(require('../node_modules/express/index.js'));
var graphQlExpress = _interopDefault(require('../node_modules/express-graphql/dist/index.js'));
var index_js = require('../node_modules/graphql-server-express/dist/index.js');
var index_js$1 = require('../node_modules/graphql-tools/dist/index.js');
var joinMonsterAdapt = _interopDefault(require('../node_modules/join-monster-graphql-tools-adapter/src/index.js'));
var joinMonster = _interopDefault(require('../node_modules/join-monster/dist/index.js'));
var index_js$2 = require('../node_modules/pg/lib/index.js');
var nodeCleanup = _interopDefault(require('../node_modules/node-cleanup/node-cleanup.js'));
var fs = _interopDefault(require('fs'));
var index_js$3 = require('../node_modules/graphql-subscriptions/dist/index.js');
var index_js$4 = require('../node_modules/subscriptions-transport-ws/dist/index.js');
var index_js$5 = require('../node_modules/graphql/index.js');

let pgClient;

nodeCleanup(() => {
    if (pgClient) {
        pgClient.end();
    }
});

const getPgClient = async () => {
    if (!pgClient) {
        pgClient = new index_js$2.Client({ connectionString: 'postgres://postgres:password@192.168.99.100:32791/postgres' });
        await pgClient.connect();
    }
    return pgClient;
};

const executeQuery = async (sql) => {
    console.log(sql);
    const client = await getPgClient();
    const result = await client.query(sql);
    return result;
};

const typeDefs = fs.readFileSync(require.resolve('./schema.gql')).toString();

const pubsub = new index_js$3.PubSub();

const resolvers = {
    Query: {
        cities(root, args, context, info) {
            return joinMonster(info, context, executeQuery, { dialect: 'pg' })
        },
        countries(root, args, context, info) {
            return joinMonster(info, context, executeQuery, { dialect: 'pg' })
        }
    },
    Subscription: {
        populationUpdated: {
            subscribe: index_js$3.withFilter(
                () => pubsub.asyncIterator('popchanged'),
                (payload, variables) => payload.populationUpdated && payload.populationUpdated.code === variables.code
            )
        }
    },
    Mutation: {
        async updatePopulation(root, args, context) {
            const sql = `
                UPDATE country
                SET population = country.population ${(args.input.type === 'Add') ? '+' : '-'} ${args.input.value}
                WHERE code = '${args.input.code}'
                RETURNING code, population
            `;
            const result = await executeQuery(sql);
            if (result.rowCount > 0) {
                const [ update ] = result.rows;
                pubsub.publish('popchanged', { populationUpdated: update });
                return update;
            }
        }
    }
};

const schema = index_js$1.makeExecutableSchema({
    typeDefs,
    resolvers
});

const getGroupExpressions = (rollup) => {
    let fields = rollup 
        ? `min(entrydate) as "date", sum(gdp) as "value"`
        : `entrydate as "date", gdp as "value"`;
    let groupExpr = '';
    switch (rollup) {
        case 'Day':
            fields += `, to_char(entrydate, 'DDD') as "day",
                extract(year from entrydate) as "year"`;
            groupExpr = `GROUP BY "day", "year"`;
            break;
        case 'Week':
            fields += `, to_char(entrydate, 'WW') as "week",
                extract(year from entrydate) as "year"`;
            groupExpr = `GROUP BY "week", "year"`;
            break;
        case 'Month':
            fields += `, to_char(entrydate, 'Mon') as "month",
                extract(year from entrydate) as "year"`;
            groupExpr = `GROUP BY "month", "year"`;
            break;
        case 'Year':
            fields += `, extract(year from entrydate) as "year"`;
            groupExpr = `GROUP BY "year"`;
            break;
        default:
            break;
    }
    return { fields, groupExpr };
};

joinMonsterAdapt(schema, {
    Query: {
        fields: {
            cities: {
                where(table, args) {
                    if (args.search) {
                        return `${table}.name ilike '%${args.search}%'`;
                    }
                }
            },
            countries: {
                where(table, args) {
                    if (args.search) {
                        return `${table}.name ilike '%${args.search}%'`;
                    }
                }
            }
        }
    },
    City: {
        sqlTable: 'city',
        uniqueKey: 'id',
        fields: {
            country: {
                sqlJoin: (cityTable, countryTable) => `${cityTable}.countrycode = ${countryTable}.code`
            }
        }
    },
    Country: {
        sqlTable: 'country',
        uniqueKey: 'code',
        fields: {
            continent: {
                sqlColumn: 'continent',
                resolve: (country) => country.continent.replace(' ', '_')
            },
            surfaceArea: {
                sqlColumn: 'surfacearea'
            },
            indepYear: {
                sqlColumn: 'indepyear'
            },
            lifeExpectancy: {
                sqlColumn: 'lifeexpectancy'
            },
            cities: {
                sqlBatch: {
                    thisKey: 'countrycode',
                    parentKey: 'code'
                }
            },
            capital: {
                sqlBatch: {
                    thisKey: 'id',
                    parentKey: 'capital'
                }
            },
            languages: {
                sqlBatch: {
                    thisKey: 'countrycode',
                    parentKey: 'code'
                }
            },
            gdpValues: {
                sqlExpr: (table, args) => {
                    let condition = '';
                    if (args.period) {
                        const query = [];
                        if (args.period.start) {
                            query.push(`entrydate >= '${args.period.start}'::date`);
                        }
                        if (args.period.end) {
                            query.push(`entrydate <= '${args.period.end}'::date`);
                        }
                        condition = ' AND ' + query.join(' AND ');
                    }
                    const { fields, groupExpr } = getGroupExpressions(args.rollup);
                    return `(SELECT json_agg("gdps")
                            FROM (SELECT ${fields}
                                FROM countrygdp
                                WHERE countrycode=${table}.code${condition}
                                ${groupExpr}
                                ORDER BY date ASC) "gdps")`;
                }
            }
        }
    },
    Language: {
        sqlTable: 'countrylanguage',
        uniqueKey: ['countrycode', 'language'],
        fields: {
            name: {
                sqlColumn: 'language'
            },
            isOfficial: {
                sqlColumn: 'isofficial'
            },
            country: {
                sqlBatch: {
                    thisKey: 'countrycode',
                    parentKey: 'code'
                }
            }
        }
    },
    GdpValue: {
        uniqueKey: ['countrycode', 'entrydate'],
        fields: {
            value: {
                sqlColumn: 'gdp'
            },
            date: {
                sqlColumn: 'entrydate'
            },
            country: {
                sqlBatch: {
                    thisKey: 'code',
                    parentKey: 'countrycode'
                }
            }
        }
    }
});

const app = express();

app.use('/graphql', graphQlExpress({
    schema: schema
}));

app.use('/graphiql', index_js.graphiqlExpress({
    endpointURL: "http://localhost:3001/graphql",
    subscriptionsEndpoint: "ws://localhost:3001/graphqls"
}));

const websocketServer = http.createServer(app);

new index_js$4.SubscriptionServer({
        schema,
        execute: index_js$5.execute,
        subscribe: index_js$5.subscribe,
    }, {
        server: websocketServer,
        path: '/graphqls',
    }
);

websocketServer.listen(3001);

console.log('running');
