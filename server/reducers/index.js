const { combineReducers } = require('redux');
const rooms = require('./rooms').reducer;
const players = require('./players').reducer;
const food = require('./food').reducer;
const environment = require('./environment').reducer;

module.exports = combineReducers({
  rooms,
  players,
  food,
  environment
});
