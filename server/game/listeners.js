const Promise = require('bluebird');
const axios = require('axios');
const passport = require('passport');
const chalk = require('chalk');

const initPos = {
  x: 0,
  y: 50,
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
const { startGame } = require('./utils');

const { receivePlayer, removePlayer } = require('../reducers/players');
const { removeFood } = require('../reducers/food');
const { updatePlayer,
        updateVolume,
        changePlayerScale,
        addFoodToDiet,
        clearDiet } = require('../reducers/players');


const setUpListeners = (io, socket) => {
  let { user } = socket.request;
  Promise.promisifyAll(socket);

    console.log('A new client has connected');
    console.log('socket id: ', socket.id);

    socket.on('start', () => {
      console.log(chalk.blue('starting!'));
      if (socket.request.user && socket.request.user.logged_in) {
        startGame(io, socket);
      }
    });

    // // Player requests to start game as guest
    // socket.on('start_as_guest', ({ nickname }) => {
    //   User.create({ nickname, guest: true })
    //     .then((user) => {
    //       startGame(io, socket, user);
    //     })
    //     .catch(err => {
    //       console.error(err);
    //       socket.emit('start_fail', err.message);
    //     });
    // });

    // For every frame of animation, players are emitting their current position
    socket.on('update_position', data => {
      let player = store.getState().players[user.id];
      if (player) {
        if (data.y >= 5) {
          // If player's y coordinate is greater than or equal to zero,
          // update game state with current position
          store.dispatch(updatePlayer(user.id, data));
        } else if (data.y < -5) {
          // If y coordinate is below zero, tell players to remove player object.
          // For now, we are automatically respawning player
          io.sockets.in(player.room).emit('remove_player', user.id);
          store.dispatch(updatePlayer(user.id, initPos));
          store.dispatch(clearDiet(user.id));
          io.sockets.in(player.room).emit('add_player', user.id, Object.assign({}, initPos, {nickname: player.nickname}), true);
          socket.emit('you_lose', 'You fell off the board!');
        }
      }
    });

    // When players collide with food objects, they emit the food's id
    socket.on('eat_food', (id, volume) => {
     // console.log("sss")
      let { food } = store.getState();
      let eaten = food[id];
      let player = store.getState().players[user.id];
      // First, verify that food still exists.
      // Then increase player size and tell other players to remove food object
      if (eaten) {
        store.dispatch(addFoodToDiet(eaten, user.id, store.getState().players[user.id]));
        //console.log("in eat food socket listener, number of diets: ", store.getState().players[user.id].diet.length)
        store.dispatch(removeFood(id));
        store.dispatch(updateVolume(user.id, volume));
        store.dispatch(changePlayerScale(user.id, (volume - player.volume) / player.volume));
        io.sockets.in(eaten.room).emit('remove_food', id, user.id, store.getState().players[user.id]);
      }
    });

    // Verify client disconnect
    socket.on('disconnect', () => {
      let player = store.getState().players[user.id];
      if (player) {
        let { room } = player;

        // Remove player from server game state and tell players to remove player object
        store.dispatch(removePlayer(user.id));
        io.sockets.in(room).emit('remove_player', user.id.toString());

        console.log(`socket id ${socket.id} has disconnected.`);
      }
    });

    socket.on('got_eaten', (id, volume) => {
      let clock = {};
      let { players } = store.getState();
      let eaten = players[user.id];
      let eater = players[id];
      if (eaten && eater && (Date.now - clock[eaten.id] > 3000)) {
        clock[eaten.id] = Date.now();
        let { room } = eaten;

        io.sockets.in(room).emit('remove_player', user.id.toString(), id);
        //store.dispatch(addPlayerToDiet(eaten, id, store.getState().players[id]));
        //console.log(store.getState().players[id].diet);
        store.dispatch(changePlayerScale(id, (volume - eater.volume) / eater.volume));
        // io.sockets.in(room).emit('remove_eaten_player', user.id, id, store.getState().players[id], store.getState().players[user.id]);
        store.dispatch(updateVolume(id, volume));
        store.dispatch(updatePlayer(user.id, initPos));
        store.dispatch(clearDiet(user.id));
        io.sockets.in(room).emit('add_player', user.id.toString(), Object.assign({}, initPos, {nickname: eaten.nickname}), true);
        socket.emit('you_lose', 'You died!');
      }
    });
};

module.exports = setUpListeners;
