const { createServer } = require('http');
const express = require('express');
const graphQlExpress = require('express-graphql');
// const schema = require('./schema');
const { schema, runUpdates } = require('./subSchema');
const { SubscriptionServer } = require('subscriptions-transport-ws');
const { execute, subscribe } = require('graphql');

const app = express();

app.use('/graphql', graphQlExpress({
    schema: schema,
    graphiql: true,
    subscriptionsEndpoint: "ws://localhost:3001/graphqls"
}));

const websocketServer = createServer(app);

new SubscriptionServer(
    {
        schema,
        execute,
        subscribe,
    },
    {
        server: websocketServer,
        path: 'ws://localhost:3001/graphqls',
    }
);

websocketServer.listen(3001);

runUpdates();

console.log('running');
