const Sequelize = require('sequelize');
const db = require('../_db');

const Score = db.define('score', {
  value: {
    type: Sequelize.INTEGER,
    allowNull: false,
    validate: { min: 0 }
  }
},
{
  timestamps: true,
  createdAt: 'time'
}
);

module.exports = Score;
