import { combineReducers } from 'redux';
import auth from './auth';
import controlPanel from './controlPanel';
import players from './players';
import food from './food';
import gameStatus from './gameStatus';
import abilities from './abilities';
import gameState from './gameState';
import record from './record';

export default combineReducers({
  auth,
  controlPanel,
  players,
  food,
  gameStatus,
  abilities,
  gameState,
  record
});
