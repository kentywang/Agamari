const { forOwn, pickBy } = require('lodash');
let Promise = require('bluebird');


const initPos = {
  x: 0,
  y: 1800,
  z: 0,
  qx: 0,
  qy: 0,
  qz: 0,
  qw: 1,
  scale: 1,
  volume: 4200 // this would change depending on what we choose for starting ball size
};

const { User } = require('../db');
const store = require('../store');


const { receivePlayer, removePlayer } = require('../reducers/players');
const { removeFood } = require('../reducers/food');
const { updatePlayer,
        updateVolume,
        changePlayerScale,
        addFoodToDiet,
        clearDiet } = require('../reducers/players');


const setUpListeners = (io, socket) => {
  Promise.promisifyAll(socket);

    console.log('A new client has connected');
    console.log('socket id: ', socket.id);

    // Player requests to start game as guest
    socket.on('start_as_guest', ({ nickname }) => {
      User.create({ nickname, guest: true })
        .then(({id, nickname}) => {
          // Create new player with db info, initial position and room
          let player = Object.assign({}, initPos, {id, nickname, room: 'room1'});

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
             console.log(leavePromises);
          Promise.all(leavePromises)
            .then(() => {
              // Find all players in room and tell new player to add to game state
                console.log('current player', player);
              let roomPlayers = pickBy(players, (player) => {
                return player.room === 'room1';
              })
              //console.log('roomPlayers', roomPlayers)
              // let roomPlayers = players.filter(({ room }) => room === 'room1');
              // here we pass the entire players store (incl. diet arrays)
              socket.emitAsync('player_data', roomPlayers);
            })
            .then(() => {
              // Find all food in room and tell new player to add to game state
              let roomFood = pickBy(food, ({ room }) => room === 'room1');
              // let roomFood = food.filter(({ room }) => room === 'room1');
              socket.emitAsync('food_data', roomFood);
            })
            .then(() => socket.joinAsync('room1')) // Join room
            .then(() => socket.emit('start_game')); // Tell player to initialize game
        })
        .catch(err => {
          console.error(err);
          socket.emit('start_fail', err);
        });
    });

    // For every frame of animation, players are emitting their current position
    socket.on('update_position', data => {
      let player = store.getState().players[socket.id];
      if (player) {
        //if (data.y >= 5) {
          // If player's y coordinate is greater than or equal to zero,
          // update game state with current position
          store.dispatch(updatePlayer(socket.id, data));
        // } else if (data.y < -5) {
        //   // If y coordinate is below zero, tell players to remove player object.
        //   // For now, we are automatically respawning player
        //   io.sockets.in(player.room).emit('remove_player', socket.id);
        //   store.dispatch(updatePlayer(socket.id, initPos));
        //   store.dispatch(clearDiet(socket.id));
        //   io.sockets.in(player.room).emit('add_player', socket.id, Object.assign({}, initPos, {nickname: player.nickname}), true);
        //   socket.emit('you_lose', 'You fell off the board!');
        // }
      }
    });

    // When players collide with food objects, they emit the food's id
    socket.on('eat_food', (id, volume) => {
     // console.log("sss")
      let { food } = store.getState();
      let eaten = food[id];
      let player = store.getState().players[socket.id];
      // First, verify that food still exists.
      // Then increase player size and tell other players to remove food object
      if (eaten) {
        store.dispatch(addFoodToDiet(eaten, socket.id, store.getState().players[socket.id]));
        //console.log("in eat food socket listener, number of diets: ", store.getState().players[socket.id].diet.length)
        store.dispatch(removeFood(id));
        store.dispatch(updateVolume(socket.id, volume));
        store.dispatch(changePlayerScale(socket.id, (volume - player.volume) / player.volume));
        io.sockets.in(eaten.room).emit('remove_food', id, socket.id, store.getState().players[socket.id]);
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

    socket.on('got_eaten', (id, volume) => {
      //console.log('this guy ate!', id);
      let { players } = store.getState();
      let eaten = players[socket.id];
      let eater = players[id];

      if (eaten && eater) {
        let { room } = eaten;
        io.sockets.in(room).emit('remove_player', socket.id, id);
        //store.dispatch(addPlayerToDiet(eaten, id, store.getState().players[id]));
        //console.log(store.getState().players[id].diet);
        store.dispatch(changePlayerScale(id, (volume - eater.volume) / eater.volume));
        // io.sockets.in(room).emit('remove_eaten_player', socket.id, id, store.getState().players[id], store.getState().players[socket.id]);
        store.dispatch(updateVolume(id, volume));
        store.dispatch(updatePlayer(socket.id, initPos));
        store.dispatch(clearDiet(socket.id));
        io.sockets.in(room).emit('add_player', socket.id, Object.assign({}, initPos, {nickname: eaten.nickname}), true);
        socket.emit('you_lose', 'You died!');
      }
    });
}

module.exports = setUpListeners;
