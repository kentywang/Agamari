const swearjar = require('swearjar');
const {
  forOwn,
  size,
  pickBy,
  random,
  find,
} = require('lodash');
const {
  initPos,
  uuid,
} = require('./utils');

const store = require('../store');
const { playerIsLeading } = require('./engine');
const worldNames = require('../world-names');
const {
  clearFoodEaten,
  clearPlayersEaten,
  addPlayer,
  playerEatsPlayer,
  playerLeaves,
  eatFood,
} = require('../reducers/players');
const { addWorld } = require('../reducers/worlds');
const {
  updatePlayer,
  updateVolume,
  changePlayerScale,
  clearDiet,
} = require('../reducers/players');

const getWorld = () => {
  const {
    worlds,
    players,
  } = store.getState();
  for (const world of worlds) {
    const playerCount = size(pickBy(players, (player) => player.world === world.id));
    if (playerCount < 20) {
      return world;
    }
  }
  return null;
};

const setUpListeners = (io, socket) => {
  console.log('A new client has connected');
  console.log('socket id: ', socket.id);

  // Player requests to start game as guest
  socket.on('start_as_guest', (data) => {
    const {
      players,
      food,
    } = store.getState();
    const foundWorld = getWorld();
    const playerWorld = foundWorld || {
      id: uuid(),
      name: worldNames[random(worldNames.length - 1)],
    };
    store.dispatch(addWorld(playerWorld));
    const world = playerWorld.id;

    // Create new player with db info, initial position and world
    const player = {
      ...initPos(),
      socketId: socket.id,
      id: uuid(),
      nickname: data.nickname,
      world,
    };

    // Log player out of all current worlds (async, stored in array of promises)
    const leavePromises = [];
    forOwn(socket.rooms, (currentRoom) => {
      leavePromises.push(socket.leave(currentRoom));
    });

    // Add player to server game state
    store.dispatch(addPlayer(socket.id, player));

    // Tell all players in world to create object for new player
    io.sockets.in(world)
      .emit('add_player', socket.id, player);

    console.log(`adding ${player.nickname} (${socket.id}) to world ${world}`);

    Promise.all(leavePromises)
      .then(() => {
        // Find all players in world and tell new player to add to game state
        const worldPlayers = pickBy(players, (currentPlayer) => currentPlayer.world === world);
        worldPlayers[socket.id] = player;

        // here we pass the entire players store (incl. diet arrays)
        socket.emit('player_data', worldPlayers);
      })
      .then(() => {
        // Find all food in world and tell new player to add to game state
        const worldFood = pickBy(food, (currentFood) => currentFood.world === world);
        // let worldFood = food.filter(({ world }) => world === world);

        socket.emit('food_data', worldFood);
      })
      .then(() => socket.join(world)) // Join world
      .then(() => socket.emit('start_game'));// Tell player to initialize game
  });

  // For every frame of animation, players are emitting their current position
  socket.on('update_position', (data) => {
    const {
      players,
      worlds,
    } = store.getState();
    const player = players[socket.id];
    if (player) {
      if ((data.x > -1600 && data.y > -1600 && data.z > -1600) && (data.x < 1600 && data.y < 1600 && data.z < 1600)) {
        // update game state with current position
        store.dispatch(updatePlayer(socket.id, data));
      } else {
        // if player's coordinates are too far from planet center, they are respawned
        io.sockets.in(player.world)
          .emit('remove_player', socket.id);
        store.dispatch(updatePlayer(socket.id, initPos()));
        store.dispatch(clearDiet(socket.id));
        store.dispatch(clearFoodEaten(socket.id));
        store.dispatch(clearPlayersEaten(socket.id));
        io.sockets.in(player.world)
          .emit('add_player', socket.id, { ...initPos(), nickname: player.nickname }, true);
        const world = find(worlds, { id: player.world });
        socket.emit('you_fell', world);
      }
    }
  });

  // When players collide with food objects, they emit the food's id
  socket.on('eat_food', (id, volume) => {
    const {
      food,
      players,
    } = store.getState();
    const eaten = food[id];
    const player = players[socket.id];
    // First, verify that food still exists.
    // Then increase player size and tell other players to remove food object
    if (eaten) {
      const numberPeople = size(pickBy(players, ({ world }) => world === player.world));
      const place = playerIsLeading(socket.id);
      // increase vol and scale of player based on number of people in world and position in leaderboard

      store.dispatch(eatFood(player, id, numberPeople, place, volume));
      io.sockets.in(eaten.world)
        .emit('remove_food', id, socket.id, player);
    }
  });

  // Verify client disconnect
  socket.on('disconnect', () => {
    const player = store.getState().players[socket.id];
    if (player) {
      const { world } = player;

      // Remove player from server game state and tell players to remove player object
      // store.dispatch(removePlayer(socket.id));
      store.dispatch(playerLeaves(player));
      io.sockets.in(world)
        .emit('remove_player', socket.id);
    }
    console.log(`socket id ${socket.id} has disconnected.`);
  });

  // Verify client disconnect
  socket.on('leave', () => {
    const {
      players,
      worlds,
    } = store.getState();
    const player = players[socket.id];
    if (player) {
      // Remove player from server game state and tell players to remove player object
      store.dispatch(playerLeaves(player));
      const world = worlds[player.world] ? worlds[player.world].name : player.world;
      io.sockets.in(player.world)
        .emit('remove_player', socket.id);
      console.log(`${player.nickname} has left ${world}.`);
    }
  });

  socket.on('got_eaten', (id, volume) => {
    const { players } = store.getState();
    const eaten = players[socket.id];
    const eater = players[id];

    if (eaten && eater && Date.now() - (eaten.eatenCooldown || 0) > 5000) {
      const { world } = eaten;
      const respawnedPlayer = { ...eaten, ...initPos() };

      store.dispatch(playerEatsPlayer(eater, eaten, volume));
      io.sockets.in(world)
        .emit('remove_player', socket.id, id, eater, eaten);
      io.sockets.in(world)
        .emit('add_player', socket.id, respawnedPlayer, true);
      socket.emit('you_got_eaten', eater.nickname);
      io.sockets.in(world)
        .emit('casualty_report', eater.nickname, eaten.nickname);
    }
  });

  socket.on('launched', (launchMult) => {
    const { players } = store.getState();
    const player = players[socket.id];

    const percentageRemainingVol = 1 - 0.01 * launchMult;
    store.dispatch(updateVolume(socket.id, player.volume * percentageRemainingVol));
    store.dispatch(changePlayerScale(socket.id, -1 * player.volume * (1 - percentageRemainingVol) / player.volume));
  });

  socket.on('new_message', (message) => {
    const player = store.getState().players[socket.id];
    if (player) {
      const {
        world,
        nickname,
      } = player;
      const text = swearjar.censor(message);
      io.sockets.in(world)
        .emit('add_message', {
          nickname,
          text,
        });
    }
  });
};

// override swearjar asterisks with rice balls
swearjar.censor = function (text) {
  let censored = text;
  this.scan(text, (word, index) => {
    censored = censored.substr(0, index)
      + word.replace(/\S/g, '🍙')
      + censored.substr(index + word.length);
  });

  return censored;
};

module.exports = setUpListeners;
