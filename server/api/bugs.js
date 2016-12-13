'use strict';

const router = module.exports = require('express').Router();
const Bug = require('../db/models/bug');


router.get('/:id', (req, res, next) => {
 Bug.findById(req.params.id)
    .then(bug => res.json(bug))
    .catch(next);
});

router.get('/', (req, res, next) => {
  Bug.findAll()
    .then(bugs => res.json(bugs))
    .catch(next);
});

router.post('/', (req, res, next) => {
  Bug.create(req.body)
    .then(() => res.json({status: 'OK', message: 'Bug report submitted. Thank you.'}))
    .catch(next);
});

