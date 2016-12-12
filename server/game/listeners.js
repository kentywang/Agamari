const Promise = require('bluebird');
const swearjar = require('swearjar');
const chalk = require('chalk');

// player spawn function
function initPos(){
  let x = Math.random() * 1000 - 500;
  let y = Math.random() * 1000 - 500;
  let z = Math.random() * 1000 - 500;
  // let x = - 500;
  // let y = - 500;
  // let z = - 500;

  return {
    x,
    y,
    z,
    qx: 0,
    qy: 0,
    qz: 0,
    qw: 1,
    scale: 1,
    volume: 4000,
    foodEaten: 0,
    playersEaten: 0
  };
}

const { Player, User, World, Event, Score } = require('../db');
const store = require('../store');
const worldNames = require('../world-names');
const { forOwn, size, pickBy, random } = require('lodash');
const { receivePlayer,
        removePlayer,
        incrementFoodEaten,
        clearFoodEaten,
        incrementPlayersEaten,
        clearPlayersEaten } = require('../reducers/players');
const { addWorld } = require('../reducers/worlds');
const { removeFood } = require('../reducers/food');
const { updatePlayer,
        updateVolume,
        changePlayerScale,
        clearDiet } = require('../reducers/players');


const getWorld = () => {
  let { worlds, players} = store.getState();
  for (let world of worlds) {
    let playerCount = size(pickBy(players, player => player.world === world.id));
    if (playerCount < 20) {
      return [world, false];
    }
  }
  return [worldNames[random(worldNames.length - 1)], true];
};

const {playerIsLeading} = require('./engine');


const setUpListeners = (io, socket) => {
  Promise.promisifyAll(socket);

    console.log('A new client has connected');
    console.log(chalk.yellow('socket id: ', socket.id));

    // Player requests to start game as guest
    socket.on('start_as_guest', data => {

      let { players, food } = store.getState();
      let user = Player.create({ nickname: data.nickname });
      let foundWorld = getWorld();
      let playerWorld = foundWorld[1] ? World.create({ name: foundWorld[0] }) : World.findById(foundWorld.id);
      Promise.all([playerWorld, user])
        .then(([dbWorld, dbUser]) => {
          let { id, nickname } = dbUser;
          if (foundWorld[1]) store.dispatch(addWorld({id: dbWorld.id, name: dbWorld.name}));
          let world = foundWorld[1] ? dbWorld.id : foundWorld[0].id;

          // Create new player with db info, initial position and world
          let player = Object.assign({}, initPos(), {id, nickname, world});

          // Log player out of all current worlds (async, stored in array of promises)
          let leavePromises = [];
          forOwn(socket.rooms, currentRoom => {
            leavePromises.push(socket.leaveAsync(currentRoom));
          });

          // Add player to server game state
          store.dispatch(receivePlayer(socket.id, player));

          // Tell all players in world to create object for new player
          io.sockets.in(world).emit('add_player', socket.id, player);

          console.log(chalk.green(`adding ${player.nickname} (${socket.id}) to world ${world}`));

          Promise.all(leavePromises)
            .then(() => {
              // Find all players in world and tell new player to add to game state
              let worldPlayers = pickBy(players, currentPlayer => currentPlayer.world === world);
              worldPlayers[socket.id] = player;

              // here we pass the entire players store (incl. diet arrays)
              socket.emitAsync('player_data', worldPlayers);
            })
            .then(() => {
              // Find all food in world and tell new player to add to game state
              let worldFood = pickBy(food, currentFood => currentFood.world === world);
              // let worldFood = food.filter(({ world }) => world === world);

              socket.emitAsync('food_data', worldFood);
            })
            .then(() => socket.joinAsync(world)) // Join world
            .then(() => socket.emit('start_game'))
            .then(() => {
              Event.joinWorld(player)
              Score.add(player);
            }); // Tell player to initialize game
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
        if ((data.x > -1600 && data.y > -1600 && data.z > -1600) && (data.x < 1600 && data.y < 1600 && data.z < 1600)) {
          // update game state with current position
          store.dispatch(updatePlayer(socket.id, data));
        } else {
          // if player's coordinates are too far from planet center, they are respawned
          io.sockets.in(player.world).emit('remove_player', socket.id);
          store.dispatch(updatePlayer(socket.id, initPos()));
          store.dispatch(clearDiet(socket.id));
          store.dispatch(clearFoodEaten(socket.id));
          store.dispatch(clearPlayersEaten(socket.id));
          io.sockets.in(player.world).emit('add_player', socket.id, Object.assign({}, initPos(), {nickname: player.nickname}), true);
          socket.emit('you_lose', player.world.name);
        }
      }
    });

    // When players collide with food objects, they emit the food's id
    socket.on('eat_food', (id, volume) => {
      let { food, players } = store.getState();
      let eaten = food[id];
      let player = players[socket.id];
      // First, verify that food still exists.
      // Then increase player size and tell other players to remove food object
      if (eaten) {
        Event.playerEatsFood(player);
        store.dispatch(removeFood(id));
        store.dispatch(incrementFoodEaten(socket.id));
        var place = playerIsLeading(socket.id);

        let worldPlayers = pickBy(players, ({ world }) => world === player.world);

        var numberPeople = size(worldPlayers);

        // increase vol and scale of player based on number of people in world and position in leaderboard
        if (numberPeople === 1) {
            store.dispatch(updateVolume(socket.id, (volume - player.volume) / 1 + player.volume));
            store.dispatch(changePlayerScale(socket.id, ((volume - player.volume) / 1) / player.volume));
        } else if (numberPeople === 2) {
          switch (place) {
            case 1:
              store.dispatch(updateVolume(socket.id, (volume - player.volume) / 3 + player.volume));
              store.dispatch(changePlayerScale(socket.id, ((volume - player.volume) / 3) / player.volume));
              break;
            case 2:
              store.dispatch(updateVolume(socket.id, (volume - player.volume) / 1 + player.volume));
              store.dispatch(changePlayerScale(socket.id, ((volume - player.volume) / 1) / player.volume));
              break;
            default:
              store.dispatch(updateVolume(socket.id, (volume - player.volume) / 1 + player.volume));
              store.dispatch(changePlayerScale(socket.id, ((volume - player.volume) / 1) / player.volume));
              break;
          }
        } else if (numberPeople === 3) {
          switch (place){
            case 1:
              store.dispatch(updateVolume(socket.id, (volume - player.volume) / 9 + player.volume));
              store.dispatch(changePlayerScale(socket.id, ((volume - player.volume) / 9) / player.volume));
              break;
            case 2:
              store.dispatch(updateVolume(socket.id, (volume - player.volume) / 3 + player.volume));
              store.dispatch(changePlayerScale(socket.id, ((volume - player.volume) / 3) / player.volume));
              break;
            case 3:
              store.dispatch(updateVolume(socket.id, (volume - player.volume) / 1 + player.volume));
              store.dispatch(changePlayerScale(socket.id, ((volume - player.volume) / 1) / player.volume));
              break;
            default:
              store.dispatch(updateVolume(socket.id, (volume - player.volume) / 1 + player.volume));
              store.dispatch(changePlayerScale(socket.id, ((volume - player.volume) / 1) / player.volume));
              break;
          }
        } else if (numberPeople === 4){
          switch (place){
            case 1:
              store.dispatch(updateVolume(socket.id, (volume - player.volume) / 27 + player.volume));
              store.dispatch(changePlayerScale(socket.id, ((volume - player.volume) / 27) / player.volume));
              break;
            case 2:
              store.dispatch(updateVolume(socket.id, (volume - player.volume) / 9 + player.volume));
              store.dispatch(changePlayerScale(socket.id, ((volume - player.volume) / 9) / player.volume));
              break;
            case 3:
              store.dispatch(updateVolume(socket.id, (volume - player.volume) / 3 + player.volume));
              store.dispatch(changePlayerScale(socket.id, ((volume - player.volume) / 3) / player.volume));
              break;
            case 4:
              store.dispatch(updateVolume(socket.id, (volume - player.volume) / 1 + player.volume));
              store.dispatch(changePlayerScale(socket.id, ((volume - player.volume) / 1) / player.volume));
              break;
            default:
              store.dispatch(updateVolume(socket.id, (volume - player.volume) / 1 + player.volume));
              store.dispatch(changePlayerScale(socket.id, ((volume - player.volume) / 1) / player.volume));
              break;
          }
        } else if (numberPeople === 5){
          switch (place){
            case 1:
              store.dispatch(updateVolume(socket.id, (volume - player.volume) / (27 * 3) + player.volume));
              store.dispatch(changePlayerScale(socket.id, ((volume - player.volume) / (27 * 3)) / player.volume));
              break;
            case 2:
              store.dispatch(updateVolume(socket.id, (volume - player.volume) / 27 + player.volume));
              store.dispatch(changePlayerScale(socket.id, ((volume - player.volume) / 27) / player.volume));
              break;
            case 3:
              store.dispatch(updateVolume(socket.id, (volume - player.volume) / 9 + player.volume));
              store.dispatch(changePlayerScale(socket.id, ((volume - player.volume) / 9) / player.volume));
              break;
            case 4:
              store.dispatch(updateVolume(socket.id, (volume - player.volume) / 3 + player.volume));
              store.dispatch(changePlayerScale(socket.id, ((volume - player.volume) / 3) / player.volume));
              break;
            case 5:
              store.dispatch(updateVolume(socket.id, (volume - player.volume) / 1 + player.volume));
              store.dispatch(changePlayerScale(socket.id, ((volume - player.volume) / 1) / player.volume));
              break;
            default:
              store.dispatch(updateVolume(socket.id, (volume - player.volume) / 1 + player.volume));
              store.dispatch(changePlayerScale(socket.id, ((volume - player.volume) / 1) / player.volume));
              break;
          }
        } else if (numberPeople >= 6){
          switch (place){
            case 1:
              store.dispatch(updateVolume(socket.id, (volume - player.volume) / (27 * 9) + player.volume));
              store.dispatch(changePlayerScale(socket.id, ((volume - player.volume) / (27 * 9)) / player.volume));
              break;
            case 2:
              store.dispatch(updateVolume(socket.id, (volume - player.volume) / (27 * 3) + player.volume));
              store.dispatch(changePlayerScale(socket.id, ((volume - player.volume) / (27 * 3)) / player.volume));
              break;
            case 3:
              store.dispatch(updateVolume(socket.id, (volume - player.volume) / 27 + player.volume));
              store.dispatch(changePlayerScale(socket.id, ((volume - player.volume) / 27) / player.volume));
              break;
            case 4:
              store.dispatch(updateVolume(socket.id, (volume - player.volume) / 9 + player.volume));
              store.dispatch(changePlayerScale(socket.id, ((volume - player.volume) / 9) / player.volume));
              break;
            case 5:
              store.dispatch(updateVolume(socket.id, (volume - player.volume) / 3 + player.volume));
              store.dispatch(changePlayerScale(socket.id, ((volume - player.volume) / 3) / player.volume));
              break;
            case 6:
              store.dispatch(updateVolume(socket.id, (volume - player.volume) / 1 + player.volume));
              store.dispatch(changePlayerScale(socket.id, ((volume - player.volume) / 1) / player.volume));
              break;
            default:
              store.dispatch(updateVolume(socket.id, (volume - player.volume) / 1 + player.volume));
              store.dispatch(changePlayerScale(socket.id, ((volume - player.volume) / 1) / player.volume));
              break;
          }
        }
        io.sockets.in(eaten.world).emit('remove_food', id, socket.id, store.getState().players[socket.id]);
      }
    });

    // Verify client disconnect
    socket.on('disconnect', () => {
      let player = store.getState().players[socket.id];
      if (player) {
      let { world } = player;

      // Remove player from server game state and tell players to remove player object
      store.dispatch(removePlayer(socket.id));
      io.sockets.in(world).emit('remove_player', socket.id);
      }
      console.log(chalk.grey(`socket id ${socket.id} has disconnected.`));
    });

    // Verify client disconnect
    socket.on('leave', () => {
      let { players, worlds } = store.getState();
      let player = players[socket.id];
      if (player) {
      let world = worlds[player.world] ? worlds[player.world].name : player.world;

      // Remove player from server game state and tell players to remove player object
      store.dispatch(removePlayer(socket.id));
      Event.leaveWorld(player);
      Score.add(player);
      io.sockets.in(player.world).emit('remove_player', socket.id);

      console.log(chalk.cyan(`${player.nickname} has left ${world}.`));
      }
    });

    socket.on('got_eaten', (id, volume) => {
      let { players } = store.getState();
      let eaten = players[socket.id];
      let eater = players[id];

      if (eaten && eater && Date.now() - (eaten.eatenCooldown || 0) > 5000) {
        let { world } = eaten;
        Event.playerEatsPlayer(eater, eaten);
        Score.add(eaten);
        io.sockets.in(world).emit('remove_player', socket.id, id, eater, eaten);
        // disabled because bouncing bug
        //store.dispatch(changePlayerScale(id, (volume - eater.volume) / eater.volume));
        store.dispatch(updateVolume(id, volume));
        store.dispatch(incrementPlayersEaten(id));
        store.dispatch(updatePlayer(socket.id, initPos()));
        store.dispatch(clearDiet(socket.id));
        store.dispatch(clearFoodEaten(socket.id));
        store.dispatch(clearPlayersEaten(socket.id));
        let respawnedPlayer = Object.assign({}, eaten, initPos());
        io.sockets.in(world).emit('add_player', socket.id, respawnedPlayer, true);
        Score.add(respawnedPlayer);
        Event.playerRespawns(respawnedPlayer);
        socket.emit('you_got_eaten', eater.nickname);
        io.sockets.in(world).emit('casualty_report', eater.nickname, eaten.nickname);
      }
    });

    socket.on('new_message', message => {
      let player = store.getState().players[socket.id];
        if (player) {
        let { world, nickname } = player;
        let text = swearjar.censor(message);
        io.sockets.in(world).emit('add_message', { nickname, text });
      }
    });
};

// override swearjar asterisks with rice balls
swearjar.censor = function (text) {
  let censored = text;
  this.scan(text, function (word, index, categories) {
    censored = censored.substr(0, index) +
                word.replace(/\S/g, '🍙') +
                censored.substr(index + word.length);
  });

  return censored;
};


module.exports = setUpListeners;
