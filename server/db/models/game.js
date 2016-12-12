const Sequelize = require('sequelize');
const db = require('../_db');

const Game = db.define('game', {
  leftAt: {
    type: Sequelize.DATE
  }
},
{
  createdAt: 'joinedAt',
}
);

module.exports = Game;
