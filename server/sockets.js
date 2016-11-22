const {validRoomNames} = require('./gameEngine');

const { addRoom } = require('./utils');
const { addUser, removeUser, assignRoom, unassignRoom } = require('./reducers/users');

const { addPlayer, removePlayer, removeFoodAndAddMass } = require('./reducers/gameState');

const store = require('./store');

const {spawnFood} = require('./gameEngine');

const setUpSockets = io => {
  io.on('connection', function(socket){

    // socket.on('made_connection', ()=>{
      // Verify client connect
      store.dispatch(addUser(socket.id));
    // });

    console.log('A new client has connected');
    console.log('socket id: ', socket.id);

    // Verify client disconnect
    socket.on('disconnect', () => {
      let { gameState } = store.getState();
      let rooms = Object.keys(gameState);
      for (let room of rooms) {
        if (gameState[room].players[socket.id]) {
          store.dispatch(removePlayer(socket.id, room));
        }
      }
      store.dispatch(removeUser(socket.id));
      console.log(`socket id ${socket.id} has disconnected.`);
    });

    // Log out of other rooms before entering room
    socket.on('room', room => {
      let { gameState } = store.getState();
      store.dispatch(assignRoom(socket.id, room));
      socket.join(room);
      for (let currentRoom of Object.keys(socket.rooms)) {
        if (currentRoom !== room) {
          socket.leave(currentRoom);
          if (gameState[currentRoom]) {
            store.dispatch(removePlayer(socket.id, currentRoom));
          }
        }
      }
      var initPos = {
      x: 10,
      y: 35,
      z: 10,
      rx: 0,
      ry: 0,
      rz: 0
    };


      // let's make sure to do these in order(maybe with promises)
      store.dispatch(addPlayer(socket.id, initPos, room));

      socket.emit('game_state', store.getState().gameState[room]);

      io.sockets.in(room).emit('change_state', addPlayer(socket.id, initPos));

      io.sockets.in(room).emit('add_player', socket.id);

      socket.emit('in_room');

      // store.dispatch(addRoom(addPlayer(socket.id), room));

      //console.log(store.getState().gameState[room]);
    });

    // Log messages to all players in room (for testing/debugging)
    socket.on('log', room => io.sockets.in(room).emit('message', `hello from ${room}`));

    // Relay game state changes and update server state
    socket.on('state_changed', action => {
      //console.log("state changed")
      let room = Object.keys(socket.rooms)[0];
      store.dispatch(addRoom(action, room));
      //io.sockets.in(room).emit('change_state', action);
      //console.log(store.getState().gameState[room]);
    });

    // update food array and player mass
    socket.on('ate_food_got_bigger', (id, index) => {
      //console.log("got food eaten msg")
      let room = Object.keys(socket.rooms)[0];
      store.dispatch(removeFoodAndAddMass(id, index, room));
      io.sockets.in(room).emit('ate_food_got_bigger', index);
    });
  });
};

const broadcastState = (io) => {
  setInterval(() => {
   // console.log("games state in room 1: ", store.getState().gameState.room1.players);
  }, 5000);
  setInterval(() => {
    //console.log(store.getState())

    
    let rooms = Object.keys(io.sockets.adapter.rooms);
    for (let room of rooms) {
      // Only enter if room name is in valid room names array
      if (validRoomNames.indexOf(room) + 1) {
        let { gameState } = store.getState();
        if (gameState[room]) {
          io.sockets.in(room).emit('game_state', gameState[room]);
        }
      }
    }
    spawnFood(io);
  }, (1000 / 60));
}

module.exports = { setUpSockets, broadcastState };
