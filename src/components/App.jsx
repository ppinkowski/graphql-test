import React, { Component } from 'react';
import { ApolloClient } from 'apollo-client';
import { split } from 'apollo-link';
import { HttpLink } from 'apollo-link-http';
import { WebSocketLink } from 'apollo-link-ws';
import { getMainDefinition } from 'apollo-utilities';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloProvider } from 'react-apollo';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Search from './Search';
import Analytics from './Analytics';
import store from '../store/store';

export const dataIdFromObject = (o) => {
  return `${o.__typename}:${o.code || o.id}`;
}

const httpLink = new HttpLink({
  uri: '/graphql'
});
const wsLink = new WebSocketLink({
  uri: 'ws://localhost:3001/graphqls',
  options: { reconnect: true }
});
const link = split(({query}) => {
    const { kind, operation } = getMainDefinition(query);
    return kind === 'OperationDefinition' && operation === 'subscription';
}, wsLink, httpLink);

const apolloClient = new ApolloClient({
  link,
  cache: new InMemoryCache({
    dataIdFromObject
  })
});

class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <ApolloProvider client={apolloClient}>
          <Router>
            <Switch>
              <Route path="/analytics" component={Analytics}/>          
              <Route path="/" component={Search}/>
            </Switch>
          </Router>
        </ApolloProvider>
      </Provider>
    );
  }
}

export default App;
