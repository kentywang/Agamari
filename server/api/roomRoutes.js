'use strict';

const router = module.exports = require('express').Router();
const Room = require('../db/models/room');

router.get('/', (req, res, next) => {
  Room.findAll()
    .then(rooms => res.json(rooms))
    .catch(next);
});

router.get('/:id', (req, res, next) => {
 Room.findById(req.params.id)
    .then(room => res.json(room))
    .catch(next);
});
