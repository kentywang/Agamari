'use strict';

const api = module.exports = require('express').Router();

api.use('/users', require('./users'));
api.use('/worlds', require('./worlds'));
api.use('/scores', require('./scores'));
api.use('/bugs', require('./bugs'));
api.use('/state', require('./states'));
api.get('/whoami', (req, res) => res.send(req.cookie.user));
