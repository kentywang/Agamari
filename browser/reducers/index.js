import { combineReducers } from 'redux';
import auth from './auth';
import controlPanel from './controlPanel';
import players from './players';
import food from './food';
import gameStatus from './gameStatus';
import abilities from './abilities';

export default combineReducers({
  auth,
  controlPanel,
  players,
  food,
  gameStatus,
  abilities
});
