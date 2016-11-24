
const reducerMode = 'immutable';
const validRoomNames = ['room1', 'room2'];
const { pickBy, filter } = require('lodash');
const { receiveFood } = require('./reducers/food');
const { updatePlayer } = require('./reducers/players');

const { initPos } = require('./sockets');

let elapsedTime = Date.now(),
    id = 1;

function spawnFood(io, store) {
  if (Date.now() - elapsedTime > 50){
    console.log('spawning food');
    elapsedTime = Date.now();
    let { rooms, food, players } = store.getState();
    console.log('rooms', rooms);
      for (let currentRoom of rooms) {
        console.log('currentRoom', currentRoom);
        let roomPlayers = pickBy(players, ({ room }) => room === currentRoom);
        if (Object.keys(roomPlayers).length) {
          console.log('generating food');
          if (Object.keys(food).length < 15) {
            let x = (Math.random() * 400) - 200,
                z = (Math.random() * 400) - 200,
                type = 'box';
            let data = { x, z, type, room: currentRoom };
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
