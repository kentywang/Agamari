const Sequelize = require('sequelize');
const db = require('../_db');

const Score = db.define('score', {
  value: {
    type: Sequelize.INTEGER,
    allowNull: false,
    validate: {
            min: 0
          }
  },
  time: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW,
    allowNull: false,
  }
},
{
  timestamps: false,

}
);

module.exports = Score;
