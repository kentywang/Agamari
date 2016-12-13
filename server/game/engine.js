const { pickBy, size } = require('lodash');
const { receiveFood, removeMultipleFood } = require('../reducers/food');
const { removeRoom } = require('../reducers/rooms');
const store = require('../store');

let types = ['box', 'sphere'];
let elapsedTime = {},
    moonSpawnTime = {},
    id = 1;
let spawnTime = .5 * 1000;

const spawnFood = (io, currentRoom) => {
  // spawn food in a room every so often
  if (!elapsedTime[currentRoom] || Date.now() - elapsedTime[currentRoom] > spawnTime){

    // moon spawn cooldown
    if(!moonSpawnTime[currentRoom]){
      moonSpawnTime[currentRoom] = Date.now() - 30 * 60 * 1000;
    }

    elapsedTime[currentRoom] = Date.now();

    let { food, players } = store.getState();

    let roomPlayers = pickBy(players, ({ room }) => room === currentRoom);
    let roomFood = pickBy(food, ({ room }) => room === currentRoom );

    // spawn food if room populated
    if (size(roomPlayers)) {

        if (size(roomFood) < 200) {
          let x = (Math.random() * 1000) - 500,
              y = (Math.random() * 1000) - 500,
              z = (Math.random() * 1000) - 500,
              type = types[~~(Math.random() * types.length)],
              foodSize = [];

          switch (type){
            case 'box':
              let boxType = Math.random();
              if(boxType<.6){
                // box
                foodSize = [
                  2 + (Math.random() * 8),
                  2 + (Math.random() * 4),
                  2 + (Math.random() * 3),
                ];    
              }else if(boxType<.8){
                // plane
                foodSize = [
                  6 + (Math.random() * 3),
                  7 + (Math.random() * 2),
                  1 + (Math.random() * 1)
                ];   
              }else{
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
          let randomPlayerId = Object.keys(roomPlayers)[~~(Math.random() * Object.keys(roomPlayers).length)];

          let playerToFeed = roomPlayers[randomPlayerId];

          // check to see what is the largest scale in the game
          let largestScale = 1;

          for (var Pid in roomPlayers) {
            if(roomPlayers[Pid].scale > largestScale){
              largestScale = roomPlayers[Pid].scale;
            }
          }

          // if player is the largest in room and he isn't alone, rechoose a player to scale food to
          if(Object.keys(roomPlayers).length > 1 && playerToFeed.scale === largestScale){
            randomPlayerId = Object.keys(roomPlayers)[~~(Math.random() * Object.keys(roomPlayers).length)];
          }

          playerToFeed = roomPlayers[randomPlayerId];

          let parms;
          // occasionally spawn food linearly scaled to players
          if(Math.random() > .95){
             parms = foodSize.map(e => (e * playerToFeed.scale));
          }else{
             parms = foodSize.map(e => (e * Math.min(playerToFeed.scale, 1 + Math.log(playerToFeed.scale)/Math.log(5))));
          }

          // create Moon at first, then in increments based on moon spawn time
          if(Date.now() - moonSpawnTime[currentRoom] >= 30 * 60 * 1000){
            moonSpawnTime[currentRoom] = Date.now();

            x = (Math.random() * 1000) - 500,
            y = (Math.random() * 1000) - 500,
            z = (Math.random() * 1000) - 500,
            type = "moon",
            parms = [100];
          }

          // add food to room
          let data = { x, y, z, type, parms, room: currentRoom };
          store.dispatch(receiveFood(id, data));
          io.sockets.in(currentRoom).emit('add_food', id, data);
          id++;
        }
      } else {
        store.dispatch(removeMultipleFood(roomFood));
        store.dispatch(removeRoom(currentRoom));
      }
  }
};

const broadcastState = (io) => {
  setInterval(() => {
    // On set interval, emit all player positions to all players in each room
    let { players, rooms } = store.getState();
    for (let currentRoom of rooms) {
      let roomPlayers = pickBy(players, ({ room }) => room === currentRoom);
      io.sockets.in(currentRoom).emit('player_data', roomPlayers);
      spawnFood(io, currentRoom);
    }
  }, (1000 / 30));
};

function playerIsLeading(id){
  // this fn returns position in leaderboard of player id
  let player = store.getState().players[id];
  let { players } = store.getState();

  if (player) {
    let currentRoom = player.room;
    let roomPlayers = pickBy(players, ({ room }) => room === currentRoom);
    let peopleAhead = 0;

    for (var Pid in roomPlayers) {
      if(roomPlayers[Pid].volume > player.volume){
        peopleAhead++;
      }
    }
    return peopleAhead+1;
  }
}

module.exports = { broadcastState, spawnFood, playerIsLeading };