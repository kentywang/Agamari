import { combineReducers } from 'redux';
import auth from './auth';
import currentRoom from './currentRoom';
import gameState from './gameState';
import socket from './socket';

export default combineReducers({
  auth,
  currentRoom,
  gameState,
  socket
});
