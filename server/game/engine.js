
const { pickBy, size } = require('lodash');
const { receiveFood, removeMultipleFood } = require('../reducers/food');
const { removeRoom } = require('../reducers/rooms');
const store = require('../store');

let types = ['box', 'sphere'];
let elapsedTime = {},
    id = 1;

const spawnFood = (io, currentRoom) => {
  if (!elapsedTime[currentRoom] || Date.now() - elapsedTime[currentRoom] > 200){
    //console.log('spawning food');
    elapsedTime[currentRoom] = Date.now();
    let { food, players } = store.getState();
    //console.log('rooms', rooms);
    //  console.log('currentRoom', currentRoom);
      let roomPlayers = pickBy(players, ({ room }) => room === currentRoom);
      let roomFood = pickBy(food, ({ room }) => room === currentRoom );
      //console.log("room_food", roomFood)
      if (size(roomPlayers)) {
      //  console.log('generating food');
        if (size(roomFood) < 150) {
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

            // check to see what is the largest scale in the game
            let largestScale = 1;
            for (var Pid in roomPlayers) {
              if(roomPlayers[Pid].scale > largestScale){
                largestScale = roomPlayers[Pid].scale;
              }
            }

            // if player is the largest in room and he isn't alone, rechoose a player to scale food to
            if(Object.keys(roomPlayers).length > 1 && playerToFeed.scale === largestScale){
              randomPlayerId = Object.keys(roomPlayers)[~~(Math.random() * Object.keys(roomPlayers).length)];
            }

            playerToFeed = roomPlayers[randomPlayerId];

            let parms = foodSize.map(e => ~~(e * playerToFeed.scale));
            //console.log(parms)

            // create Moon at first
            if(Object.keys(food).length == 0){
              x = 0,
              y = 0,
              z = -1,
              type = "moon",
              parms = [120];
            }

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
      spawnFood(io, currentRoom);
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
