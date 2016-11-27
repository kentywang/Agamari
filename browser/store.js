import { createStore, applyMiddleware } from 'redux';
import createLogger from 'redux-logger';
import thunk from 'redux-thunk';
import { whoami } from './reducers/auth';

import reducer from './reducers';


const store = createStore(reducer, applyMiddleware(thunk));
window.store = store;


export default store;

store.dispatch(whoami());
