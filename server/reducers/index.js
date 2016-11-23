const { combineReducers } = require('redux');
const users = require('./users').reducer;
const players = require('./players').reducer;
const food = require('./food').reducer;
const environment = require('./environment').reducer;

module.exports = combineReducers({
  users,
  players,
  food,
  environment
});
