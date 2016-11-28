const { forOwn, pickBy, size, difference, random } = require('lodash');
const roomNames = require('../room-names');
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
const { addRoom } = require('../reducers/rooms');

const addRandomRoom = () => {
  let { rooms } = store.getState();
  let availableNames = difference(roomNames, rooms);
  let name = availableNames[random(availableNames.length - 1)];
  store.dispatch(addRoom(name));
  return name;
};

module.exports.startGame = (io, socket) => {
  let { rooms, players, food } = store.getState();
  let room = undefined;
  for (let i = 0; i < rooms.length && !room; i++) {
    let playerCount = size(pickBy(players, player => player.room === rooms[i]));
    if (playerCount < 2) room = rooms[i];
  }
    if (!room) room = addRandomRoom();
    console.log(chalk.green('the room', room));
  let { id, email, nickname, guest } = socket.request.user;
  let player = Object.assign({}, {id, email, nickname, guest, room}, initPos);

  // Log player out of all current rooms (async, stored in array of promises)
  let leavePromises = [];
  forOwn(socket.rooms, currentRoom => {
    leavePromises.push(socket.leaveAsync(currentRoom));
  });
  console.log(chalk.magenta('addingplayer', JSON.stringify(player)));
  // Add player to server game state
  store.dispatch(receivePlayer(player.id.toString(), player));

  // Tell all players in room to create object for new player
  io.sockets.in(room).emit('add_player', player.id.toString(), player);

  Promise.all(leavePromises)
    .then(() => {
      // Find all players in room and tell new player to add to game state
      let roomPlayers = pickBy(players, (currentPlayer) => currentPlayer.room === room);
      roomPlayers[player.id] = player;
      // here we pass the entire players store (incl. diet arrays)
      console.log(chalk.blue('roomPlayers', JSON.stringify(roomPlayers)));
      socket.emitAsync('player_data', roomPlayers);
    })
    .then(() => {
      // Find all food in room and tell new player to add to game state
      let roomFood = pickBy(food, (currentFood) => currentFood.room === room);
      // let roomFood = food.filter(({ room }) => room === room);
      socket.emitAsync('food_data', roomFood);
    })
    .then(() => socket.joinAsync(room)) // Join room
    .then(() => socket.emit('start_game')); // Tell player to initialize game
};
