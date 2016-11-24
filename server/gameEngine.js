
const reducerMode = 'immutable';
const validRoomNames = ['room1', 'room2'];

const { receiveFood } = require('./reducers/food');
const { updatePlayer } = require('./reducers/players');

const { initPos } = require('./sockets');


let elapsedTime = Date.now(),
    id = 0;


function spawnFood(io, store) {
  if (Date.now() - elapsedTime > 50){
    elapsedTime = Date.now();
    let rooms = Object.keys(io.sockets.adapter.rooms);
      for (let room of rooms) {
        // Only enter if room name is in valid room names array
        if (validRoomNames.indexOf(room) + 1) {
          let { food } = store.getState();
          if (food[room]) {
              if (Object.keys(food[room]).length < 30) {
                let x = (Math.random() * 400) - 200,
                    z = (Math.random() * 400) - 200,
                    type = 'box';
                let data = { x, z, type};

                store.dispatch(receiveFood(id, data, room));
                io.sockets.in(room).emit('add_food', id, data);
                id++;
              }
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
