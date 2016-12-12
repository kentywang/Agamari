'use strict';

const api = module.exports = require('express').Router();

api.use('/users', require('./userRoutes'));
api.use('/worlds', require('./worldRoutes'));
api.use('/scores', require('./scoreRoutes'));
api.use('/bugs', require('./bugRoutes'));
api.use('/state', require('./stateRoutes'));
api.get('/whoami', (req, res) => res.send(req.cookie.user));
