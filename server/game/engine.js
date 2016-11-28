
const { pickBy, size } = require('lodash');
const { receiveFood, removeMultipleFood } = require('../reducers/food');
const { removeRoom } = require('../reducers/rooms');
const store = require('../store');

let types = ['box', 'sphere'];
let elapsedTime = Date.now(),
    id = 1;

const spawnFood = io => {
  if (Date.now() - elapsedTime > 100){
    //console.log('spawning food');
    elapsedTime = Date.now();
    let { rooms, food, players } = store.getState();
    //console.log('rooms', rooms);
      for (let currentRoom of rooms) {
      //  console.log('currentRoom', currentRoom);
        let roomPlayers = pickBy(players, ({ room }) => room === currentRoom);
        let roomFood = pickBy(food, ({ room }) => room === currentRoom );
        if (size(roomPlayers)) {
        //  console.log('generating food');
          if (size(pickBy(food, ({ room }) => room === currentRoom)) < 300) {
            let x = (Math.random() * 400) - 200,
                z = (Math.random() * 400) - 200,
                type = types[~~(Math.random() * types.length)],
                foodSize = [];
            switch (type){
              case 'box':
                foodSize = [
                  1 + (Math.random() * 9),
                  1 + (Math.random() * 5),
                  1 + (Math.random() * 3),
                ];
                break;
              case 'sphere':
              default:
                foodSize = [
                  1 + (Math.random() * 3)
                ];
                break;
            }

            // scale food to random player
            let randomPlayerId = Object.keys(roomPlayers)[~~(Math.random() * Object.keys(roomPlayers).length)];
            let playerToFeed = roomPlayers[randomPlayerId];
            let parms = foodSize.map(e => -~(e * playerToFeed.scale));
            //console.log(parms)

            let data = { x, z, type, parms, room: currentRoom };
            store.dispatch(receiveFood(id, data));
            io.sockets.in(currentRoom).emit('add_food', id, data);
            id++;
          }
        } else {
          store.dispatch(removeMultipleFood(roomFood));
          store.dispatch(removeRoom(currentRoom));
        }
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
    }
    spawnFood(io, store);
  }, (1000 / 60));
};

// function respawn(io, store, socket, room){
//   console.log("in respawn")
//     io.sockets.in(room).emit('remove_player', socket.id);
//     store.dispatch(updatePlayer(socket.id, initPos, room));
//     io.sockets.in(room).emit('add_player', socket.id, initPos, true);
//     socket.emit('you_lose', 'You died!');
// }

module.exports = { broadcastState, spawnFood };
