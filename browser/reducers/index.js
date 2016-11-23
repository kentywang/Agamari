import { combineReducers } from 'redux';
import auth from './auth';
import controlPanel from './controlPanel';
import players from './players';
import food from './food';
import environment from './environment';

export default combineReducers({
  auth,
  controlPanel,
  players,
  food,
  environment
});
