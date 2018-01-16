import { createServer } from 'http';
import express from 'express';
import graphQlExpress from 'express-graphql';
import { graphiqlExpress } from 'graphql-server-express';
import { schema } from './schema';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import { execute, subscribe } from 'graphql';

const app = express();

app.use('/graphql', graphQlExpress({
    schema: schema
}));

app.use('/graphiql', graphiqlExpress({
    endpointURL: "http://localhost:3001/graphql",
    subscriptionsEndpoint: "ws://localhost:3001/graphqls"
}));

const websocketServer = createServer(app);

new SubscriptionServer({
        schema,
        execute,
        subscribe,
    }, {
        server: websocketServer,
        path: '/graphqls',
    }
);

websocketServer.listen(3001);

console.log('running');
