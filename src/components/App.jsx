import React, { Component } from 'react';
import { ApolloClient } from 'apollo-client';
import { HttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloProvider } from 'react-apollo';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Search from './Search';
import Analytics from './Analytics';
import store from '../store/store';

const apolloClient = new ApolloClient({
  link: new HttpLink({ uri: '/graphql' }),
  cache: new InMemoryCache()
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
