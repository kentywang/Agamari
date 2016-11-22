import { combineReducers } from 'redux';
import auth from './auth';
import gameState from './gameState';

export default combineReducers({
  auth,
  gameState
});
