const express = require('express');
const graphQlExpress = require('express-graphql');
const schema = require('./schema');

const app = express();

app.use('/graphql', graphQlExpress({
    schema: schema,
    graphiql: true
})).listen(3001);

console.log('running');
