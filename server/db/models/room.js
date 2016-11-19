const Sequelize = require('sequelize');
const db = require('../_db');

const Room = db.define('room', {
  name: {
    type: Sequelize.STRING,
    unique: true,
  }
},
{

});

module.exports = Room;
