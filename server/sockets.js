const { spawnFood } = require('./gameEngine');
const { forOwn, pickBy } = require('lodash');
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

const { receivePlayer, removePlayer } = require('./reducers/players');
const { User } = require('./db');
const store = require('./store');


const { removeFood } = require('./reducers/food');
const { updatePlayer, changePlayerScale } = require('./reducers/players');


const setUpSockets = io => {
  io.on('connection', socket => {
    Promise.promisifyAll(socket);

    console.log('A new client has connected');
    console.log('socket id: ', socket.id);

    // Player requests to start game as guest
    socket.on('start_as_guest', ({ nickname }) => {
      User.create({ nickname, guest: true })
        .then(({id, nickname}) => {
          // Create new player with db info, initial position and room
          let player = Object.assign(initPos, {id, nickname, room: 'room1'});

          // Log player out of all current rooms (async, stored in array of promises)
          let leavePromises = [];
          forOwn(socket.rooms, room => {
            leavePromises.push(socket.leaveAsync(room));
          });

          // Add player to server game state
          store.dispatch(receivePlayer(socket.id, player));

          // Tell all players in room to create object for new player
          io.sockets.in('room1').emit('add_player', socket.id, player);

             let { players, food } = store.getState();
             console.log('adding player to game', players);
             console.log(leavePromises)
          Promise.all(leavePromises)
            .then(() => {
              // Find all players in room and tell new player ot add to game state
                console.log('current player', player);
              let roomPlayers = pickBy(players, (player) => {

                return player.room === 'room1'
              })
              console.log('roomPlayers', roomPlayers)
              // let roomPlayers = players.filter(({ room }) => room === 'room1');
              socket.emitAsync('player_data', roomPlayers);
            })
            .then(() => {
              // Find all food in room and tell new player to add to game state
              let roomFood = pickBy(food, ({ room }) => room === 'room1')
              // let roomFood = food.filter(({ room }) => room === 'room1');
              socket.emitAsync('food_data', roomFood);
            })
            .then(() => socket.joinAsync('room1')) // Join room
            .then(() => socket.emit('start_game')); // Tell player to initialize game
        })
        .catch(err => {
          console.error(err);
          socket.emit('start_fail', err)
        });
    });

    // For every frame of animation, players are emitting their current position
    socket.on('update_position', data => {
      let player = store.getState().players[socket.id];
      if (player) {
        if (data.y >= 0) {
          // If player's y coordinate is greater than or equal to zero,
          // update game state with current position
          store.dispatch(updatePlayer(socket.id, data));
        } else if (data.y < 0) {
          // If y coordinate is below zero, tell players to remove player object.
          // For now, we are automatically respawning player
          io.sockets.in(player.room).emit('remove_player', socket.id);
          store.dispatch(updatePlayer(socket.id, initPos));
          io.sockets.in(player.room).emit('add_player', socket.id, initPos, true);
          socket.emit('you_lose', 'You fell off the board!');
        }
      }
    });

    // When players collide with food objects, they emit the food's id
    socket.on('eat_food', id => {
      let { food } = store.getState();
      let eaten = food[id];

      // First, verify that food still exists.
      // Then increase player size and tell other players to remove food object
      if (eaten) {
        store.dispatch(removeFood(id));
        store.dispatch(changePlayerScale(socket.id, 0.1));
        io.sockets.in(eaten.room).emit('remove_food', id);
      }
    });

    // Verify client disconnect
    socket.on('disconnect', () => {
      let player = store.getState().players[socket.id];
      if (player) {
        let { room } = player;

        // Remove player from server game state and tell players to remove player object
        store.dispatch(removePlayer(socket.id));
        io.sockets.in(room).emit('remove_player', socket.id);

        console.log(`socket id ${socket.id} has disconnected.`);
      }
    });

    socket.on('got_eaten', id => {
      console.log('this guy ate!', id);
      let { players } = store.getState();
      let eaten = players[socket.id]
      let eater = players[id];

      if (eaten && eater) {
        let { room } = eaten;
        store.dispatch(changePlayerScale(id, eaten.scale));
        io.sockets.in(room).emit('remove_player', socket.id);
        store.dispatch(updatePlayer(socket.id, initPos));
        io.sockets.in(room).emit('add_player', socket.id, initPos, true);
        socket.emit('you_lose', 'You died!');
      }
    });

  });
};

const broadcastState = (io) => {
  setInterval(() => {
    // On set interval, emit all player positions to all players in each room
    let { players, rooms } = store.getState();
    for (let currentRoom of rooms) {
      let roomPlayers = pickBy(players, ({ room }) => room === currentRoom);
      io.sockets.in(currentRoom).emit('player_data', roomPlayers);
    }
    spawnFood(io, store);
  }, (1000 / 60));
};


module.exports = { setUpSockets, broadcastState, initPos };
