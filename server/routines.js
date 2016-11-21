const store = require('./store');
const Score = require('./db/models/score');
const { forOwn } = require('lodash');
let gameState, scores, time;

/*----------  TEST STATE  ----------*/
gameState = {
  1: { color: 'red', players: {
    1: { score: 1000},
    2: { score: 2000},
    3: { score: 5000},
  }},
  2: { color: 'pink', players: {
    4: { score: 333},
    5: { score: 444},
    6: { score: 555},
  }},
  3: { color: 'blue', players: {

  }}
};

const runRoutine = () => {
  setInterval(() => {
    scores = [];
    gameState = store.getState().gameState;
    time = Date.now();
    forOwn(gameState, (room, roomId) => forOwn(room.players, (player, userId) => {
      scores.push({
        value: player.score,
        time,
        userId,
        roomId
      });
    }));
    if (scores.length) Score.bulkCreate(scores);
  }, 10000);
};

module.exports = runRoutine;
