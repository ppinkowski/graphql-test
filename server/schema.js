const { graphql, buildSchema } = require('graphql');
const { makeExecutableSchema } = require('graphql-tools');
const joinMonsterAdapt = require('join-monster-graphql-tools-adapter');
const joinMonster = require('join-monster').default;
const runQuery = require('./db');
const fs = require('fs');
const typeDefs = fs.readFileSync(require.resolve('./schema.gql')).toString();

const resolvers = {
    Query: {
        cities(root, args, context, info) {
            return joinMonster(info, context, runQuery, { dialect: 'pg' })
        },
        countries(root, args, context, info) {
            return joinMonster(info, context, runQuery, { dialect: 'pg' })
        }
    },
    City: {
    },
    Country: {
    },
    Language: {
    }
};

const schema = makeExecutableSchema({
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
}

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

module.exports = schema;
