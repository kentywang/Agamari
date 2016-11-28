
const { pickBy } = require('lodash');
const { receiveFood } = require('../reducers/food');
const store = require('../store');

let types = ['box', 'sphere'];
let elapsedTime = Date.now(),
    id = 1;

const spawnFood = io => {
  if (Date.now() - elapsedTime > 50){
    //console.log('spawning food');
    elapsedTime = Date.now();
    let { rooms, food, players } = store.getState();
    //console.log('rooms', rooms);
      for (let currentRoom of rooms) {
      //  console.log('currentRoom', currentRoom);
        let roomPlayers = pickBy(players, ({ room }) => room === currentRoom);
        if (Object.keys(roomPlayers).length) {
        //  console.log('generating food');
          if (Object.keys(food).length < 800) {
            let x = (Math.random() * 2400) - 1200,
                y = (Math.random() * 2400) - 1200,
                z = (Math.random() * 2400) - 1200,
                type = types[~~(Math.random() * types.length)],
                foodSize = [];
            switch (type){
              case 'box':
                foodSize = [
                  2 + (Math.random() * 8),
                  2 + (Math.random() * 4),
                  2 + (Math.random() * 2),
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
