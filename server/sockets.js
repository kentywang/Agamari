const { addRoom } = require('./utils');
const { addUser, removeUser, assignRoom, unassignRoom } = require('./reducers/users');

const { addPlayer, removePlayer } = require('./reducers/gameState');

const store = require('./store');

const setUpSockets = io => {
  io.on('connection', function(socket){
    // Verify client connect
    store.dispatch(addUser(socket.id));

    console.log('A new client has connected');
    console.log('socket id: ', socket.id);

    // Verify client disconnect
    socket.on('disconnect', () => {
      console.log(store.getState().users)
      let { room } = store.getState().users[socket.id];
      store.dispatch(removePlayer(socket.id, room));
      store.dispatch(removeUser(socket.id));
      console.log(`socket id ${socket.id} has disconnected.`);
    });

    // Log out of other rooms before entering room
    socket.on('room', room => {
      store.dispatch(assignRoom(socket.id, room));
      socket.join(room);
      for (let currentRoom of Object.keys(socket.rooms)) {
        if(currentRoom !== room){
          socket.leave(currentRoom);
        }
      };

    var initPos = {
    x: 10,
    y: 0,
    z: 0,
    rx: 0,
    ry: 0,
    rz: 0
  };
      
      store.dispatch(addPlayer(socket.id, initPos, room));
      
      socket.emit('newGameState', store.getState().gameState[room]);

      io.sockets.in(room).emit('change_state', addPlayer(socket.id, initPos));

      socket.emit('in_room');

      // store.dispatch(addRoom(addPlayer(socket.id), room));

      console.log(store.getState().gameState[room]);
    });

    // Log messages to all players in room (for testing/debugging)
    socket.on('log', room => io.sockets.in(room).emit('message', `hello from ${room}`));

    // Relay game state changes and update server state
    socket.on('state_changed', action => {
      let room = Object.keys(socket.rooms)[0];
      store.dispatch(addRoom(action, room));
      io.sockets.in(room).emit('change_state', action);
      console.log(store.getState().gameState[room]);
    });
  });


};

module.exports = { setUpSockets };