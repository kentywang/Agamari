const Sequelize = require('sequelize');
const db = require('../_db');

const Bug = db.define('bug', {
  name: {
    type: Sequelize.STRING
  },
  email: {
    type: Sequelize.STRING,
    validate: {
      isEmail: true
    }
  },
  subject: {
    type: Sequelize.STRING
  },
  details: {
    type: Sequelize.TEXT
  }
},
{

}
);

module.exports = Bug;
