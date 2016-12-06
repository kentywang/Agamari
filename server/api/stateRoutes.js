'use strict';

const router = module.exports = require('express').Router();
const store = require('../store');
const { pickBy, size } = require('lodash');


const getGlobalState = (req, res, next) => {
  let { rooms, players, food } = store.getState();
  let state = {};
  state.numRooms = rooms.length;
  state.numPlayers = size(players);
  state.rooms = rooms.map(room => (
    { room,
      players: pickBy(players, player => room === player.room),
      food: pickBy(food, food => room === food.room)
    }));
  state.players = players;
  state.food = food;
  res.json(state);
};

router.get('/', getGlobalState);
