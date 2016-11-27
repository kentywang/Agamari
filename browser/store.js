import { createStore, applyMiddleware } from 'redux';
import createLogger from 'redux-logger';
import thunk from 'redux-thunk';
import { initializeSocket } from './socket';
import reducer from './reducers';


const store = createStore(reducer, applyMiddleware(thunk));
window.store = store;
initializeSocket();

export default store;
