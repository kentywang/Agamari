import { combineReducers } from 'redux';
import auth from './auth';
import controlPanel from './controlPanel';
import players from './players';
import food from './food';
import abilities from './abilities';
import gameState from './gameState';
import messages from './messages';
import casualty from './casualty';

export default combineReducers({
  auth,
  controlPanel,
  players,
  food,
  abilities,
  gameState,
  messages,
  casualty
});
