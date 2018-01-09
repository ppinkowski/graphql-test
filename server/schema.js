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
