import listeners from './game/listeners';
import store from './store';
import { whoami } from './reducers/user';
// const socket = io('/');

export const initializeSocket = () => {
  const socket = io('/');
  socket.on('connect', () => {
    console.log('socket', socket);
    // store.dispatch(whoami(socket.id));
    listeners(socket);
  });
  return socket;
};

// export default socket;
