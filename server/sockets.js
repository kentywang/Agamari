const { validRoomNames, spawnFood } = require('./gameEngine');

const initPos = {
  x: 10,
  y: 35,
  z: 10,
  rx: 0,
  ry: 0,
  rz: 0
};

const joinRoom = (socket, room) => {
  socket.join(room);
  forOwn(socket.rooms, (value, key) => {
    if (key !== room) socket.leave(key);
  });
};

const { addRoom } = require('./utils');
const { addUser, removeUser, assignRoom } = require('./reducers/users');
const { addPlayer, removePlayer } = require('./reducers/gameState');
const { User } = require('./db');
const store = require('./store');
const { forOwn } = require('lodash');


const setUpSockets = io => {
  io.on('connection', socket => {

    // User connects, add to user list with null room
    store.dispatch(addUser(socket.id));
    console.log('A new client has connected');
    console.log('socket id: ', socket.id);


    // Start game as guest
    socket.on('start_as_guest', ({ nickname }) => {
      console.log('creating guest account', nickname);
      User.create({ nickname, guest: true })
        .then(({id, nickname}) => {
          store.dispatch(assignRoom(socket.id, 'room1'));
          let user = Object.assign(initPos, {id, nickname});

          // Maybe emit event and trigger thunk?
          store.dispatch(addPlayer(socket.id, user, 'room1'));
          let roomState = store.getState().gameState['room1'];
          socket.emit('game_state', roomState);
          io.sockets.in('room1').emit('change_state', addPlayer(socket.id, user));
          io.sockets.in('room1').emit('add_player', socket.id);
          joinRoom(socket, 'room1');
          console.log('joined room1');
          socket.emit('game_ready');
        })
        .catch(err => socket.emit('start_fail', err));
    });


    // Relay game state changes and update server state
    socket.on('state_changed', action => {
      let room = Object.keys(socket.rooms)[0];
      if (store.getState().gameState[room]) {
        store.dispatch(addRoom(action, room));
      }
    });


    // Verify client disconnect
    socket.on('disconnect', () => {
      // Log player out from all games
      forOwn(store.getState().gameState, (state, room) => {
        if (state.players[socket.id]) store.dispatch(removePlayer(socket.id, room));
      });

      // Remove from server-side user list
      store.dispatch(removeUser(socket.id));
      console.log(`socket id ${socket.id} has disconnected.`);
    });

  });
};

const broadcastState = (io) => {
  setInterval(() => {
    let { gameState } = store.getState();
    forOwn(gameState, (state, room) => {
        // console.log('looping', state);
        io.sockets.in(room).emit('game_state', state);
    });
    spawnFood(io);
  }, (1000 / 60));
};



module.exports = { setUpSockets, broadcastState };
