import { applyMiddleware, createStore, compose } from 'redux';
import thunk from 'redux-thunk';
import logger from 'redux-logger';
import rootReducer from './reducers';

let middlewares;
let composeEnhancers = compose;
if (process.env.NODE_ENV === 'development') {
    middlewares = [thunk, logger];
    if (window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) {
        composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__;
    }
} else {
    middlewares = [thunk];
}
const store = createStore(rootReducer, composeEnhancers(applyMiddleware(...middlewares)));

export default store;
