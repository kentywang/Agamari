const User = require('./user');
const Room = require('./room');
const Score = require('./score');
const _db = require('./_db');

//ASSOCIATIONS

module.exports = {_db, User, Room, Score};