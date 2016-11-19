'use strict';

const router = module.exports = require('express').Router();
const Room = require('../db/models/room');
const Score = require('../db/models/score');

router.get('/', (req, res, next) => {
  Score.findAll()
    .then(rooms => res.send(rooms))
    .catch(next);
});

router.get('/:id', (req, res, next) => {
 Room.findById(req.params.id)
    .then(score => res.json(score))
    .catch(next);
});

