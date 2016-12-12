'use strict';

const router = module.exports = require('express').Router();
const World = require('../db/models/world');

router.get('/', (req, res, next) => {
  World.findAll()
    .then(worlds => res.json(worlds))
    .catch(next);
});

router.get('/:id', (req, res, next) => {
 World.findById(req.params.id)
    .then(world => res.json(world))
    .catch(next);
});
