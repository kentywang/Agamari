const {validRoomNames} = require('./gameEngine');

const { addRoom } = require('./utils');
const { addUser, removeUser, assignRoom, unassignRoom } = require('./reducers/users');

const { addPlayer, removePlayer } = require('./reducers/gameState');

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
      let user = store.getState().users[socket.id]; 
      console.log(store.getState().users)
      let { room } = store.getState().users[socket.id];
      if(room){
        store.dispatch(removePlayer(socket.id, room));
      }
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
      let room = Object.keys(socket.rooms)[0];
      store.dispatch(addRoom(action, room));
      io.sockets.in(room).emit('change_state', action);
      //console.log(store.getState().gameState[room]);
    });
  });
};

const broadcastState = (io) => {
  setInterval(() => {
    //console.log(store.getState())

    spawnFood(io);
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
  }, (1000 / 60));
}

module.exports = { setUpSockets, broadcastState };
