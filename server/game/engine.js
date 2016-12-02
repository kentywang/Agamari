
const { pickBy, size } = require('lodash');
const { receiveFood, removeMultipleFood } = require('../reducers/food');
const { removeRoom } = require('../reducers/rooms');
const store = require('../store');

let types = ['box', 'sphere'];
let elapsedTime = {},
    moonSpawnTime = {},
    id = 1;

const spawnFood = (io, currentRoom) => {
  if (!elapsedTime[currentRoom] || Date.now() - elapsedTime[currentRoom] > 200){
    if(!moonSpawnTime[currentRoom]){
      moonSpawnTime[currentRoom] = Date.now() - 7 * 60 * 1000;
    }
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

            while(isLargestPlayer(randomPlayerId, roomPlayers)){
              randomPlayerId = Object.keys(roomPlayers)[~~(Math.random() * Object.keys(roomPlayers).length)];
             // console.log("rerolling")
            }      

            let playerToFeed = roomPlayers[randomPlayerId];

            let parms = foodSize.map(e => ~~(e * playerToFeed.scale));
            //console.log(parms)

            // create Moon at first, then in 10 sec increments
            if(Date.now() - moonSpawnTime[currentRoom] > 7 * 60 * 1000){
              moonSpawnTime[currentRoom] = Date.now();

              x = (Math.random() * 1000) - 500,
              y = (Math.random() * 1000) - 500,
              z = (Math.random() * 1000) - 500,
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

function isLargestPlayer(id, roomPlayers){
  let playerToFeed = roomPlayers[id];

  // check to see what is the largest scale in the room
  let largestScale = 1;
  for (var Pid in roomPlayers) {
    if(roomPlayers[Pid].scale > largestScale){
      largestScale = roomPlayers[Pid].scale;
    }
  }

  // if player is the largest in room and he isn't alone, rechoose a player to scale food to
  if(Object.keys(roomPlayers).length > 1 && playerToFeed.scale === largestScale){
    //console.log("should be rerolling")
    return true;
  }

  return false;
}
// function respawn(io, store, socket, room){
//   console.log("in respawn")
//     io.sockets.in(room).emit('remove_player', socket.id);
//     store.dispatch(updatePlayer(socket.id, initPos, room));
//     io.sockets.in(room).emit('add_player', socket.id, initPos, true);
//     socket.emit('you_lose', 'You died!');
// }

module.exports = { broadcastState, spawnFood };
