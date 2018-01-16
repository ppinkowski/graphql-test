const { graphql, buildSchema } = require('graphql');
const { makeExecutableSchema } = require('graphql-tools');
const fs = require('fs');
const typeDefs = fs.readFileSync(require.resolve('./schema.gql')).toString();
const { PubSub } = require('graphql-subscriptions');

const pubsub = new PubSub();

const london = {
    id: 1,
    name: 'London',
    district: 'South',
    population: 1000000
};

const uk = {
    code: 'UK',
    name: 'United Kingdom',
    continent: 'Europe',
    region: 'Europe',
    surfaceArea: 123,
    indepYear: 1066,
    population: 64000000,
    lifeExpectancy: 82,
    gnp: 123456,
    cities: [london],
    capital: london,
    languages: [{
        name: 'English',
        isOfficial: 'Y',
        percentage: 100
    }]
}

london.country = uk;
uk.languages[0].country = uk;

const resolvers = {
    Query: {
        cities(root, args, context, info) {
            return [london];
        },
        countries(root, args, context, info) {
            return [uk];
        }
    },
    Subscription: {
        populationUpdated: {
            subscribe: () => pubsub.asyncIterator('popchanged')
        }
    }
};

const schema = makeExecutableSchema({
    typeDefs,
    resolvers
});

const runUpdates = () => {
    uk.population += 1;
    pubsub.publish('popchanged', { populationUpdated: { population: uk.population } });
    setTimeout(runUpdates, 1000);
}

module.exports = { schema, runUpdates };

