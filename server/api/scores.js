'use strict';

const router = module.exports = require('express').Router();
const World = require('../db/models/world');
const Score = require('../db/models/score');

router.get('/', (req, res, next) => {
  Score.findAll()
    .then(world => res.send(world))
    .catch(next);
});

router.get('/:id', (req, res, next) => {
 World.findById(req.params.id)
    .then(score => res.json(score))
    .catch(next);
});

