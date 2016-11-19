const { combineReducers } = require('redux');
const users = require('./users').reducer; 
const gameState = require('./gameState').reducer;

module.exports = combineReducers({
  users,
  gameState
});
