
const { pickBy, size } = require('lodash');
const { receiveFood, removeMultipleFood } = require('../reducers/food');
const { removeRoom } = require('../reducers/rooms');
const store = require('../store');

let types = ['box', 'sphere'];
let elapsedTime = {},
    id = 1;

const spawnFood = (io, currentRoom) => {
  if (!elapsedTime[currentRoom] || Date.now() - elapsedTime[currentRoom] > 33){
    //console.log('spawning food');
    elapsedTime[currentRoom] = Date.now();
    let { food, players } = store.getState();
    //console.log('rooms', rooms);
    //  console.log('currentRoom', currentRoom);
      let roomPlayers = pickBy(players, ({ room }) => room === currentRoom);
      let roomFood = pickBy(food, ({ room }) => room === currentRoom );
      if (size(roomPlayers)) {
      //  console.log('generating food');
        if (size(roomFood) < 300) {
          let x = (Math.random() * 1000) - 500,
              y = (Math.random() * 1000) - 500,
              z = (Math.random() * 1000) - 500,
              type = types[~~(Math.random() * types.length)],
              foodSize = [];

          switch (type){
            case 'box':
              foodSize = [
                2 + (Math.random() * 8),
                2 + (Math.random() * 4),
                2 + (Math.random() * 3),
              ];
              break;
            case 'sphere':
            default:
              foodSize = [
                3 + (Math.random() * 2)
              ];
              break;
          }

          // scale food to random player
          let randomPlayerId = Object.keys(roomPlayers)[~~(Math.random() * Object.keys(roomPlayers).length)];
          let playerToFeed = roomPlayers[randomPlayerId];
          let parms = foodSize.map(e => ~~(e * playerToFeed.scale));
          //console.log(parms)

          let data = { x, y, z, type, parms, room: currentRoom };
          store.dispatch(receiveFood(id, data));
          io.sockets.in(currentRoom).emit('add_food', id, data);
          id++;
        }
      } else {
        store.dispatch(removeMultipleFood(roomFood));
        store.dispatch(removeRoom(currentRoom));
      }
  }
};

const broadcastState = (io) => {
  setInterval(() => {
    // On set interval, emit all player positions to all players in each room
    let { players, rooms } = store.getState();
    for (let currentRoom of rooms) {
      let roomPlayers = pickBy(players, ({ room }) => room === currentRoom);
      io.sockets.in(currentRoom).emit('player_data', roomPlayers);
      spawnFood(io, store, currentRoom);
    }
  }, (1000 / 30));
};

// function respawn(io, store, socket, room){
//   console.log("in respawn")
//     io.sockets.in(room).emit('remove_player', socket.id);
//     store.dispatch(updatePlayer(socket.id, initPos, room));
//     io.sockets.in(room).emit('add_player', socket.id, initPos, true);
//     socket.emit('you_lose', 'You died!');
// }

module.exports = { broadcastState, spawnFood };
