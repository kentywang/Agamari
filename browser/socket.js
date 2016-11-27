import listeners from './game/listeners';
import store from './store';
import { whoami } from './reducers/auth';
const socket = io('/');

export const initializeSocket = () => {
  socket.on('connect', () => {
    console.log('socket', socket);
    store.dispatch(whoami(socket.id));
    listeners(socket);
  });
};

export default socket;
