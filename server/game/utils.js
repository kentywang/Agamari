const { forOwn, pickBy } = require('lodash');
const chalk = require('chalk');
let Promise = require('bluebird');

const initPos = {
  x: 0,
  y: 50,
  z: 0,
  qx: 0,
  qy: 0,
  qz: 0,
  qw: 1,
  scale: 1,
  volume: 4200 // this would change depending on what we choose for starting ball size
};

const store = require('../store');
const { receivePlayer } = require('../reducers/players');

module.exports.startGame = (io, socket) => {
  let { id, email, nickname, guest } = socket.request.user;
  let player = Object.assign({}, {id, email, nickname, guest, room: 'room1'}, initPos);

  // Log player out of all current rooms (async, stored in array of promises)
  let leavePromises = [];
  forOwn(socket.rooms, room => {
    leavePromises.push(socket.leaveAsync(room));
  });

  // Add player to server game state
  store.dispatch(receivePlayer(player.id, player));

  // Tell all players in room to create object for new player
  io.sockets.in('room1').emit('add_player', player.id, player);

     let { players, food } = store.getState();
  Promise.all(leavePromises)
    .then(() => {
      // Find all players in room and tell new player to add to game state
      let roomPlayers = pickBy(players, (player) => {
        return player.room === 'room1';
      });
      // here we pass the entire players store (incl. diet arrays)
      socket.emitAsync('player_data', roomPlayers);
    })
    .then(() => {
      // Find all food in room and tell new player to add to game state
      let roomFood = pickBy(food, ({ room }) => room === 'room1');
      // let roomFood = food.filter(({ room }) => room === 'room1');
      socket.emitAsync('food_data', roomFood);
    })
    .then(() => socket.joinAsync('room1')) // Join room
    .then(() => socket.emit('start_game')); // Tell player to initialize game
};
