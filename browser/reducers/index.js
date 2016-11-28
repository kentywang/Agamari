import { combineReducers } from 'redux';
import user from './user';
import controlPanel from './controlPanel';
import players from './players';
import food from './food';
import environment from './environment';

export default combineReducers({
  user,
  controlPanel,
  players,
  food,
  environment
});
