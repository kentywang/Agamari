
const reducerMode = 'immutable';
const validRoomNames = ['room1', 'room2'];
const { pickBy, filter } = require('lodash');
const { receiveFood } = require('./reducers/food');
const { updatePlayer } = require('./reducers/players');

const { initPos } = require('./sockets');

let types = ["box", "sphere"]
let elapsedTime = Date.now(),
    id = 1;

function spawnFood(io, store) {
  if (Date.now() - elapsedTime > 250){
    //console.log('spawning food');
    elapsedTime = Date.now();
    let { rooms, food, players } = store.getState();
    //console.log('rooms', rooms);
      for (let currentRoom of rooms) {
      //  console.log('currentRoom', currentRoom);
        let roomPlayers = pickBy(players, ({ room }) => room === currentRoom);
        if (Object.keys(roomPlayers).length) {
        //  console.log('generating food');
          if (Object.keys(food).length < 500) {
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
                foodSize = [
                  1 + (Math.random() * 3)
                ];
                break;
              default:
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
        }
      }
    }
}

// function respawn(io, store, socket, room){
//   console.log("in respawn")
//     io.sockets.in(room).emit('remove_player', socket.id);
//     store.dispatch(updatePlayer(socket.id, initPos, room));
//     io.sockets.in(room).emit('add_player', socket.id, initPos, true);
//     socket.emit('you_lose', 'You died!');
// }

module.exports = { spawnFood, validRoomNames, reducerMode };
