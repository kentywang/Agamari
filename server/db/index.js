const User = require('./models/user');
const Room = require('./models/room');
const Score = require('./models/score');
const Bug = require('./models/bug');
const _db = require('./_db');


//ASSOCIATIONS
User.hasMany(Score);
Score.belongsTo(User);

Room.hasMany(Score);
Score.belongsTo(Room);

module.exports = {db: _db, User, Room, Score, Bug };
