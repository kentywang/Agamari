
'use strict';

const api = module.exports = require('express').Router()

// const Room = require('../db/models/room');
// const Score = require('../db/models/score');
// const User = require('../db/models/user');



api.use('/users', require('./users'))