const Sequelize = require('sequelize');
const db = require('../_db');

const Player = db.define('player', {
  nickname: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
},
{
});

module.exports = Player;
