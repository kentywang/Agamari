import { combineReducers } from 'redux';
import auth from './auth';
import controlPanel from './controlPanel';
import players from './players';
import prevPlayers from './prevPlayers';
import food from './food';
import gameStatus from './gameStatus';
import abilities from './abilities';
import gameState from './gameState';
import record from './record';
import messages from './messages';
import casualty from './casualty';

export default combineReducers({
  auth,
  controlPanel,
  players,
  prevPlayers,
  food,
  gameStatus,
  abilities,
  gameState,
  record,
  messages,
  casualty
});
