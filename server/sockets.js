const { addRoom } = require('./utils');
const { addUser, removeUser, assignRoom, unassignRoom } = require('./reducers/users');

const { removePlayer } = require('./reducers/gameState');

const store = require('./store');

// Given a state change from a player, broadcast to other players and update server game state
const changeOtherStates = (socket, action) => {
  let room = Object.keys(socket.rooms)[0];
  socket.broadcast.to(room).emit('change_state', action);
  store.dispatch(addRoom(action, room));
};

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
      store.dispatch(addRoom(removePlayer(socket.id), room));
      store.dispatch(removeUser(socket.id));
      console.log(`socket id ${socket.id} has disconnected.`);
    });

    // Log out of other rooms before entering room
    socket.on('room', room => {
      store.dispatch(assignRoom(socket.id, room));

      for (let currentRoom of Object.keys(socket.rooms)) socket.leave(currentRoom);
      socket.join(room);
      socket.emit('in_room');
      socket.emit('newGameState', store.getState().gameState[room]);
      console.log(store.getState().gameState[room]);
    });

    // Log messages to all players in room (for testing/debugging)
    socket.on('log', room => io.sockets.in(room).emit('message', `hello from ${room}`));

    // Relay game state changes and update server state
    socket.on('state_changed', action => { changeOtherStates(socket, action); });
  });
};

module.exports = { setUpSockets };
