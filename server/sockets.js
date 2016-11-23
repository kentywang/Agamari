const { validRoomNames, spawnFood } = require('./gameEngine');
const { forOwn } = require('lodash');
let Promise = require('bluebird');


const initPos = {
  x: 10,
  y: 35,
  z: 10,
  rx: 0,
  ry: 0,
  rz: 0,
  scale: 1
};

const joinRoom = (socket, room) => {
  socket.join(room);
  console.log('room', room);
  forOwn(socket.rooms, (value, key) => {
    if (key !== room) {
      console.log('key', key);
      socket.leave(key);
    }
  });
  console.log('socket rooms', socket.rooms);
};

const { addRoom } = require('./utils');
const { addUser, removeUser, assignRoom } = require('./reducers/users');
const { receivePlayer, removePlayer } = require('./reducers/players');
const { User } = require('./db');
const store = require('./store');


const { removeFood } = require('./reducers/food');
const { updatePlayer, changeScale } = require('./reducers/players');


const setUpSockets = io => {
  io.on('connection', socket => {

    // User connects, add to user list with null room
    store.dispatch(addUser(socket.id));
    console.log('A new client has connected');
    console.log('socket id: ', socket.id);


    // Start game as guest
    socket.on('start_as_guest', ({ nickname }) => {
      Promise.promisifyAll(socket);
      console.log('creating guest account', nickname);
      User.create({ nickname, guest: true })
        .then(({id, nickname}) => {
          let leavePromises = [];
          forOwn(socket.rooms, room => { leavePromises.push(socket.leaveAsync(room)); });

          store.dispatch(assignRoom(socket.id, 'room1'));
          let user = Object.assign(initPos, {id, nickname});
          store.dispatch(receivePlayer(socket.id, user, 'room1'));
          let players = store.getState().players['room1'];
          console.log(players);
          io.sockets.in('room1').emit('add_player', socket.id, user);
          Promise.all(leavePromises)
            .then(() => {
              console.log('player_data', players)
              socket.emitAsync('player_data', players)
            })
            .then(() => socket.joinAsync('room1'))
            .then(() => socket.emit('start_game'));
        })
        .catch(err => socket.emit('start_fail', err));
    });

    // Relay game state changes and update server state
    socket.on('state_changed', action => {
      let room = Object.keys(socket.rooms)[0];
      if (store.getState().players[room]) {
        store.dispatch(addRoom(action, room));
      }
    });


    // Verify client disconnect
    socket.on('disconnect', () => {
      // Log player out from all games
      forOwn(store.getState().players, (state, room) => {
        if (state[socket.id]) {
          store.dispatch(removePlayer(socket.id, room));
          io.sockets.in(room).emit('remove_player', socket.id);
        }
      });

      // Remove from server-side user list
      store.dispatch(removeUser(socket.id));
      console.log(`socket id ${socket.id} has disconnected.`);
    });





    socket.on('eat_food', id => {
      let { food } = store.getState();
      let room = socket.rooms[0];
      if (food[id]) {
        store.dispatch(removeFood(id));
        store.dispatch(changeScale(socket.id, 1));
        io.sockets.in(room).emit('remove_food', id);
      }
    })

    socket.on('update_position', data => {
      let room = Object.keys(socket.rooms)[0];

      store.dispatch(updatePlayer(socket.id, data, room));
    })

  });
};

const broadcastState = (io) => {
  setInterval(() => {
    let { players, food } = store.getState();
    forOwn(players, (state, room) => {
        io.sockets.in(room).emit('player_data', state);
    });
    spawnFood(io, store);
  }, (1000 / 60));
};


module.exports = { setUpSockets, broadcastState };
