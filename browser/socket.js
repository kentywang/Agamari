import listeners from './game/listeners';
const socket = io('/');

export const initializeSocket = () => {
  socket.on('connect', () => { listeners(socket); });
};

export default socket;
