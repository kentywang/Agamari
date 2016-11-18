import { combineReducers } from 'redux';
import auth from './auth';
import currentRoom from './currentRoom';
import gameState from './gameState';
import socket from './socket';
import scene from './scene';
import camera from './camera';
import renderer from './renderer';

export default combineReducers({
  auth,
  currentRoom,
  gameState,
  socket,
  scene,
  camera,
  renderer
});
