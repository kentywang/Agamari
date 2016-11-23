import { createStore, applyMiddleware } from 'redux';
import createLogger from 'redux-logger';
import thunk from 'redux-thunk';
import reducer from './reducers';


const store = createStore(reducer, applyMiddleware(thunk));
window.store = store;


import listeners from './game/sockets';
const socket = io('/');
socket.on('connect', () => { listeners(socket); });
export { socket };

export default store;
