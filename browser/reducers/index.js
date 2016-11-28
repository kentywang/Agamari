import { combineReducers } from 'redux';
import auth from './auth';
import controlPanel from './controlPanel';
import players from './players';
import food from './food';
import environment from './environment';
import gamestate from './gamestate';

export default combineReducers({
  auth,
  controlPanel,
  players,
  food,
  environment,
  gamestate,
});
