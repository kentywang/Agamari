const Sequelize = require('sequelize');
const db = require('./_db');

const User = db.define('user', {
  email: {
    type: Sequelize.STRING,
    allowNull: true,
    unique: true,
  },
  password: {
    type: Sequelize.STRING,
  },
  admin: {
    type: Sequelize.BOOLEAN,
  },
  username: {
    type: Sequelize.STRING,
    unique: true,
  }
},
{

});

module.exports = User;