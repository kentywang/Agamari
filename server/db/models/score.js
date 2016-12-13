const Sequelize = require('sequelize');
const db = require('../_db');
const { pick, forOwn } = require('lodash');
const chalk = require('chalk');

const Score = db.define('score', {
  volume: {
    type: Sequelize.INTEGER,
    allowNull: false,
    validate: { min: 0 }
  },
  playersEaten: {
    type: Sequelize.INTEGER,
    allowNull: false,
    validate: { min: 0 }
  },
  foodEaten: {
    type: Sequelize.INTEGER,
    allowNull: false,
    validate: { min: 0 }
  }
},
{
  timestamps: true,
  createdAt: 'time',
  classMethods: {
    add: function({ id, volume, playersEaten, foodEaten, world}) {
      console.log(chalk.magenta(id, volume, playersEaten, foodEaten, world));
      let score = {
        volume,
        playersEaten,
        foodEaten,
        player_id: id,
        world_id: world
      }
      this.create(score);
    },
    updateAllScores: function(players) {
      let playerScores = [];
      forOwn(players, ({id, volume, playersEaten, foodEaten, world}) => {
        console.log(chalk.grey(id, volume, playersEaten, foodEaten, world));
        playerScores.push({ volume, playersEaten, foodEaten, player_id: id, world_id: world });
      });
      this.bulkCreate(playerScores);
    }
  }
}
);

module.exports = Score;
