const { pickBy, size, forOwn } = require('lodash');
const { receiveFood, removeMultipleFood } = require('../reducers/food');
const { destroyWorld } = require('../reducers/worlds');
const { Score } = require('../db');
const store = require('../store');
const chalk = require('chalk');

let types = ['box', 'sphere'];
let elapsedTime = {},
    moonSpawnTime = {},
    id = 1;
let spawnTime = 0.5 * 1000;

const spawnFood = (io, currentWorld) => {
  // spawn food in a world every so often
  if (!elapsedTime[currentWorld] || Date.now() - elapsedTime[currentWorld] > spawnTime){

    // moon spawn cooldown
    if (!moonSpawnTime[currentWorld]){
      moonSpawnTime[currentWorld] = Date.now() - 30 * 60 * 1000;
    }

    elapsedTime[currentWorld] = Date.now();

    let { food, players } = store.getState();

    let worldPlayers = pickBy(players, ({ world }) => world === currentWorld);
    let worldFood = pickBy(food, ({ world }) => world === currentWorld );

    // spawn food if world populated
    if (size(worldPlayers)) {

        if (size(worldFood) < 200) {
          let x = (Math.random() * 1000) - 500,
              y = (Math.random() * 1000) - 500,
              z = (Math.random() * 1000) - 500,
              type = types[~~(Math.random() * types.length)],
              foodSize = [];

          switch (type){
            case 'box':
              let boxType = Math.random();
              if (boxType < 0.6){
                // box
                foodSize = [
                  2 + (Math.random() * 8),
                  2 + (Math.random() * 4),
                  2 + (Math.random() * 3),
                ];
              } else if (boxType < 0.8){
                // plane
                foodSize = [
                  6 + (Math.random() * 3),
                  7 + (Math.random() * 2),
                  1 + (Math.random() * 1)
                ];
              } else {
                // stick
                foodSize = [
                  9 + (Math.random() * 9),
                  2 + (Math.random() * 2),
                  2 + (Math.random() * 2)
                ];
              }
              break;
            case 'sphere':
            default:
              foodSize = [
                3 + (Math.random() * 2)
              ];
              break;
          }

          // scale food to random player
          let randomPlayerId = Object.keys(worldPlayers)[~~(Math.random() * Object.keys(worldPlayers).length)];

          let playerToFeed = worldPlayers[randomPlayerId];

          // check to see what is the largest scale in the game
          let largestScale = 1;

          for (var Pid in worldPlayers) {
            if (worldPlayers[Pid].scale > largestScale) {
              largestScale = worldPlayers[Pid].scale;
            }
          }

          // if player is the largest in world and he isn't alone, rechoose a player to scale food to
          if (size(worldPlayers) > 1 && playerToFeed.scale === largestScale){
            randomPlayerId = Object.keys(worldPlayers)[~~(Math.random() * Object.keys(worldPlayers).length)];
          }

          playerToFeed = worldPlayers[randomPlayerId];

          let parms;
          // occasionally spawn food linearly scaled to players
          if (Math.random() > 0.95){
             parms = foodSize.map(e => (e * playerToFeed.scale));
          } else {
             parms = foodSize.map(e => (e * Math.min(playerToFeed.scale, 1 + Math.log(playerToFeed.scale) / Math.log(5))));
          }

          // create Moon at first, then in increments based on moon spawn time
          if (Date.now() - moonSpawnTime[currentWorld] >= 30 * 60 * 1000){
            moonSpawnTime[currentWorld] = Date.now();

            x = (Math.random() * 1000) - 500;
            y = (Math.random() * 1000) - 500;
            z = (Math.random() * 1000) - 500;
            type = 'moon';
            parms = [100];
          }

          // add food to world
          let data = { x, y, z, type, parms, world: currentWorld };
          store.dispatch(receiveFood(id, data));
          io.sockets.in(currentWorld).emit('add_food', id, data);
          id++;
        }
      }
  }
};

const broadcastState = (io) => {
  let start = Date.now();
  setInterval(() => {
    // On set interval, emit all player positions to all players in each world
    let { players, worlds, food } = store.getState();
    if (size(players) && (Date.now() - start > 1000 * 10)) {
      Score.updateAllScores(players);
      start = Date.now();
    }
    for (let currentWorld of worlds) {
      let worldPlayers = pickBy(players, ({ world }) => world === currentWorld.id);
      io.sockets.in(currentWorld.id).emit('player_data', worldPlayers);
      if (size(worldPlayers)) {
        spawnFood(io, currentWorld.id);
      } else {
        console.log(chalk.magenta(`Destroying ${currentWorld.name}`))
        let worldFood = pickBy(food, ({ world }) => world === currentWorld.id);
        store.dispatch(removeMultipleFood(worldFood));
        store.dispatch(destroyWorld(currentWorld.id));
      }
    }
  }, (1000 / 30));
};

function playerIsLeading(id) {
  // this fn returns position in leaderboard of player id
  let { players } = store.getState();
  let player = players[id];

  if (player) {
    let peopleAhead = 0;
    forOwn(players, currentPlayer => {
      if (currentPlayer.world === player.world && currentPlayer.volume > player.volume) {
        peopleAhead++;
      }
    })
    return peopleAhead + 1;
  }
}

module.exports = { broadcastState, spawnFood, playerIsLeading };
