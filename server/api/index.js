
'use strict';

const api = module.exports = require('express').Router()

api.use('/users', require('./userRoutes'))
api.use('/rooms', require('./roomRoutes'))
api.use('/scores', require('./scoreRoutes'))