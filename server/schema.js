const { graphql, buildSchema } = require('graphql');
const { makeExecutableSchema } = require('graphql-tools');
const joinMonsterAdapt = require('join-monster-graphql-tools-adapter');
const joinMonster = require('join-monster').default;
const { Client } = require('pg');
var nodeCleanup = require('node-cleanup');
let pgClient;

nodeCleanup(() => {
    if (pgClient) {
        pgClient.end();
    }
});

const typeDefs = `
    type Query {
        cities: [City]!
        countries: [Country]!
    }

    type City {
        id: Int!
        name: String
        district: String
        population: Int
        country: Country
    }

    type Country {
        code: String!
        name: String
        continent: Continent
        region: String
        surfaceArea: Float
        indepYear: Int
        population: Int
        lifeExpectancy: Float
        gnp: Float
        cities: [City]
        capital: City
        languages: [Language]
    }

    type Language {
        name: String!
        isOfficial: String
        percentage: Float,
        country: Country!
    }

    enum Continent {
        Asia
        Europe
        North_America
        Africa
        Oceania
        Antarctica
        South_America
    }

    schema {
        query: Query
    }
`;

const getPgClient = async () => {
    if (!pgClient) {
        pgClient = new Client({ connectionString: 'postgres://postgres:password@192.168.99.100:32768/postgres' });
        await pgClient.connect();
    }
    return pgClient;
}

const executeQuery = async (sql) => {
    console.log(sql);
    const client = await getPgClient();
    const result = await pgClient.query(sql);
    return result;
}

const resolvers = {
    Query: {
        cities(root, args, context, info) {
            return joinMonster(info, context, executeQuery, { dialect: 'pg' })
        },
        countries(root, args, context, info) {
            return joinMonster(info, context, executeQuery, { dialect: 'pg' })
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

joinMonsterAdapt(schema, {
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
    }
});

module.exports = schema;
