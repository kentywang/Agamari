import { combineReducers } from 'redux';
import auth from './auth';
import players from './players';
import food from './food';
import environment from './environment';

export default combineReducers({
  auth,
  players,
  food,
  environment
});
