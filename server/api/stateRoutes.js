'use strict';

const router = module.exports = require('express').Router();
const store = require('../store');
const { pickBy, size } = require('lodash');


const getGlobalState = (req, res, next) => {
  let { worlds, players, food } = store.getState();
  let state = {};
  state.numWorlds = worlds.length;
  state.numPlayers = size(players);
  state.worlds = worlds.map(world => (
    { world,
      players: pickBy(players, player => world === player.world),
      food: pickBy(food, food => world === food.world)
    }));
  state.players = players;
  state.food = food;
  res.json(state);
};

router.get('/', getGlobalState);
