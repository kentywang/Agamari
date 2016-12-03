let Promise = require('bluebird');


function initPos(){
  let x = Math.random() * 1000 - 500;
  let y = Math.random() * 1000 - 500;
  let z = Math.random() * 1000 - 500;

  return {
    x,
    y,
    z,
    qx: 0,
    qy: 0,
    qz: 0,
    qw: 1,
    scale: 1,
    volume: 4000
  }
};

const { User } = require('../db');
const store = require('../store');
const roomNames = require('../room-names');
const { forOwn, size, pickBy, random, difference } = require('lodash');
const { receivePlayer, removePlayer } = require('../reducers/players');
const { addRoom } = require('../reducers/rooms');
const { removeFood } = require('../reducers/food');
const { updatePlayer,
        updateVolume,
        changePlayerScale,
        addFoodToDiet,
        addPlayerToDiet,
        clearDiet,
        afk,
        unAfk } = require('../reducers/players');

const addRandomRoom = () => {
  let { rooms } = store.getState();
  let availableNames = difference(roomNames, rooms);
  let name = availableNames[random(availableNames.length - 1)];
  store.dispatch(addRoom(name));
  return name;
};
const {playerIsLeading} = require('./engine');


const setUpListeners = (io, socket) => {
  Promise.promisifyAll(socket);

    console.log('A new client has connected');
    console.log('socket id: ', socket.id);

    // Player requests to start game as guest
    socket.on('start_as_guest', ({ nickname }) => {
      User.create({ nickname, guest: true })
        .then(({id, nickname}) => {
          let { rooms, players, food } = store.getState();
          let room = undefined;
          for (let i = 0; i < rooms.length && !room; i++) {
            let playerCount = size(pickBy(players, player => player.room === rooms[i]));
            if (playerCount < 6) room = rooms[i];
          }
          if (!room) room = addRandomRoom();

          // Create new player with db info, initial position and room
          let player = Object.assign({}, initPos(), {id, nickname, room});

          // Log player out of all current rooms (async, stored in array of promises)
          let leavePromises = [];
          forOwn(socket.rooms, currentRoom => {
            leavePromises.push(socket.leaveAsync(currentRoom));
          });

          // Add player to server game state
          store.dispatch(receivePlayer(socket.id, player));

          // Tell all players in room to create object for new player
          io.sockets.in(room).emit('add_player', socket.id, player);

             console.log('adding player to game', players[socket.id]);
          Promise.all(leavePromises)
            .then(() => {
              // Find all players in room and tell new player to add to game state
                console.log('current player', player);
              let roomPlayers = pickBy(players, currentPlayer => currentPlayer.room === room);
              roomPlayers[socket.id] = player;
              //console.log('roomPlayers', roomPlayers)
              // let roomPlayers = players.filter(({ room }) => room === room);
              // here we pass the entire players store (incl. diet arrays)
              socket.emitAsync('player_data', roomPlayers);
            })
            .then(() => {
              // Find all food in room and tell new player to add to game state
              let roomFood = pickBy(food, currentFood => currentFood.room === room);
              // let roomFood = food.filter(({ room }) => room === room);
             
              socket.emitAsync('food_data', roomFood);
            })
            .then(() => socket.joinAsync(room)) // Join room
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
        if ((data.x > -1400 && data.y > -1400 && data.z > -1400) && (data.x < 1400 && data.y < 1400 && data.z < 1400)) {
          // If player's y coordinate is greater than or equal to zero,
          // update game state with current position
          store.dispatch(updatePlayer(socket.id, data));
        } else{
          // If y coordinate is below zero, tell players to remove player object.
          // For now, we are automatically respawning player
          io.sockets.in(player.room).emit('remove_player', socket.id);
          store.dispatch(updatePlayer(socket.id, initPos()));
          store.dispatch(clearDiet(socket.id));
          io.sockets.in(player.room).emit('add_player', socket.id, Object.assign({}, initPos(), {nickname: player.nickname}), true);
          console.log(player.room)
          socket.emit('you_lose', player.room);
        }
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
     // console.log(id, food[id])
      if (eaten) {
        // **** store.dispatch(addFoodToDiet(eaten, socket.id, store.getState().players[socket.id]));
        //console.log("in eat food socket listener, number of diets: ", store.getState().players[socket.id].diet.length)
        store.dispatch(removeFood(id));

        var place = playerIsLeading(socket.id);

        let roomPlayers = pickBy(store.getState().players, ({ room }) => room === player.room);

        var numberPeople = Object.keys(roomPlayers).length;

        if(numberPeople === 1){
            store.dispatch(updateVolume(socket.id, (volume-player.volume)/1 + player.volume));
            store.dispatch(changePlayerScale(socket.id, ((volume - player.volume)/1) / player.volume));
        }

        else if(numberPeople === 2){
          switch (place){
            case 1:
              store.dispatch(updateVolume(socket.id, (volume-player.volume)/4 + player.volume));
              store.dispatch(changePlayerScale(socket.id, ((volume - player.volume)/4) / player.volume));
              break;
            case 2:
              store.dispatch(updateVolume(socket.id, (volume-player.volume)/1 + player.volume));
              store.dispatch(changePlayerScale(socket.id, ((volume - player.volume)/1) / player.volume));
              break;
            default:
              store.dispatch(updateVolume(socket.id, (volume-player.volume)/1 + player.volume));
              store.dispatch(changePlayerScale(socket.id, ((volume - player.volume)/1) / player.volume));
              break;
          }
        }

        else if(numberPeople === 3){
          switch (place){
            case 1:
              store.dispatch(updateVolume(socket.id, (volume-player.volume)/16 + player.volume));
              store.dispatch(changePlayerScale(socket.id, ((volume - player.volume)/16) / player.volume));
              break;
            case 2:
              store.dispatch(updateVolume(socket.id, (volume-player.volume)/4 + player.volume));
              store.dispatch(changePlayerScale(socket.id, ((volume - player.volume)/4) / player.volume));
              break;
            case 3:
              store.dispatch(updateVolume(socket.id, (volume-player.volume)/1 + player.volume));
              store.dispatch(changePlayerScale(socket.id, ((volume - player.volume)/1) / player.volume));
              break;
            default:
              store.dispatch(updateVolume(socket.id, (volume-player.volume)/1 + player.volume));
              store.dispatch(changePlayerScale(socket.id, ((volume - player.volume)/1) / player.volume));
              break;
          }
        }

        else if(numberPeople >= 4){
          switch (place){
            case 1:
              store.dispatch(updateVolume(socket.id, (volume-player.volume)/64 + player.volume));
              store.dispatch(changePlayerScale(socket.id, ((volume - player.volume)/64) / player.volume));
              break;
            case 2:
              store.dispatch(updateVolume(socket.id, (volume-player.volume)/16 + player.volume));
              store.dispatch(changePlayerScale(socket.id, ((volume - player.volume)/16) / player.volume));
              break;
            case 3:
              store.dispatch(updateVolume(socket.id, (volume-player.volume)/4 + player.volume));
              store.dispatch(changePlayerScale(socket.id, ((volume - player.volume)/4) / player.volume));
              break;
            case 4:
              store.dispatch(updateVolume(socket.id, (volume-player.volume)/1 + player.volume));
              store.dispatch(changePlayerScale(socket.id, ((volume - player.volume)/1) / player.volume));
              break;
            default:
              store.dispatch(updateVolume(socket.id, (volume-player.volume)/1 + player.volume));
              store.dispatch(changePlayerScale(socket.id, ((volume - player.volume)/1) / player.volume));
              break;
          }
        }
        // }else{
        //   store.dispatch(updateVolume(socket.id, volume));
        //   store.dispatch(changePlayerScale(socket.id, (volume - player.volume) / player.volume));
        // }
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

    // Verify client disconnect
    socket.on('leave', () => {
      let player = store.getState().players[socket.id];
      if (player) {
        let { room } = player;

        // Remove player from server game state and tell players to remove player object
        store.dispatch(removePlayer(socket.id));
        io.sockets.in(room).emit('remove_player', socket.id);

        console.log(`${player.nickname} has left ${room}.`);
      }
    });

    socket.on('got_eaten', (id, volume) => {
      //console.log('this guy ate!', id);
      let { players } = store.getState();
      let eaten = players[socket.id];
      let eater = players[id];


      if (eaten && eater && Date.now() - (eaten.eatenCooldown || 0) > 3000) {
        let { room } = eaten;
        io.sockets.in(room).emit('remove_player', socket.id, id, eater, eaten);
        // *** store.dispatch(addPlayerToDiet(eaten, id, store.getState().players[id]));
        //console.log(store.getState().players[id].diet);

        // disabled because bouncing bug
        //store.dispatch(changePlayerScale(id, (volume - eater.volume) / eater.volume));

        // io.sockets.in(room).emit('remove_eaten_player', socket.id, id, store.getState().players[id], store.getState().players[socket.id]);
        store.dispatch(updateVolume(id, volume));
        store.dispatch(updatePlayer(socket.id, initPos()));
        store.dispatch(clearDiet(socket.id));
        io.sockets.in(room).emit('add_player', socket.id, Object.assign({}, initPos(), {nickname: eaten.nickname}), true);
        socket.emit('you_got_eaten', eater.nickname);
        io.sockets.in(room).emit('casualty_report', eater.nickname, eaten.nickname);
      }
    });

    socket.on('time_me', ()=>{

      store.dispatch(afk(socket.id));
      // kick player in 1 min if their browser window doesn't become active again
      setTimeout(()=>{
        let player = store.getState().players[socket.id];
        if (player && player.afk) {
            let { room } = player;

            socket.emit("afk_leave");
            // Remove player from server game state and tell players to remove player object
            store.dispatch(removePlayer(socket.id));
            io.sockets.in(room).emit('remove_player', socket.id);

            console.log(`${player.nickname} has left ${room}.`);
        }
      },60*1000)
    })

    socket.on('untime_me', ()=>{

      // set afk status to false
      let player = store.getState().players[socket.id];
      if(player){
        store.dispatch(unAfk(socket.id));
      }
    });
}

module.exports = setUpListeners;
