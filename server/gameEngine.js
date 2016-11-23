
const reducerMode = 'immutable';
const validRoomNames = ['room1', 'room2'];
const { pickBy, filter } = require('lodash');
const { receiveFood } = require('./reducers/food');

let elapsedTime = Date.now(),
    id = 1;

function spawnFood(io, store) {
  if (Date.now() - elapsedTime > 5000){
    elapsedTime = Date.now();
    let { rooms, food, players } = store.getState();
      for (let currentRoom of rooms) {
        if (pickBy(players, ({ room }) => room === currentRoom).length) {
          if (Object.keys(food).length < 15) {
            let x = (Math.random() * 400) - 200,
                z = (Math.random() * 400) - 200,
                type = 'sphere';
            let data = { x, z, type, room: currentRoom };
            store.dispatch(receiveFood(id, data));
            io.sockets.in(currentRoom).emit('add_food', id, data);
            id++;
          }
        }
      }
    }
}

module.exports = { spawnFood, validRoomNames, reducerMode };
