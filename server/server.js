const express = require('express');
const graphQlExpress = require('express-graphql');
const schema = require('./schema');

const app = express();

app.use('/graphql', graphQlExpress({
    schema: schema,
    graphiql: true
})).listen(3001);

// app.use(postgraphql('postgres://postgres:password@192.168.99.100:32768/postgres', 'public', { graphiql: true }))
//     .listen(3001);

console.log('running');