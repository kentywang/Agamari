const Sequelize = require('sequelize');
const db = require('../_db');
const eventType = require('./eventType');

const Event = db.define('event', {
  playerVolume: {
    type: Sequelize.INTEGER,
    field: 'player_volume'
  },
  playerDiet: {
    type: Sequelize.INTEGER,
    field: 'player_diet'
  },
  eatenPlayerVolume: {
    type: Sequelize.INTEGER,
    field: 'eaten_player_volume'
  },
  eatenPlayerDiet: {
    type: Sequelize.INTEGER,
    field: 'eaten_player_diet'
  },
  eatenFoodVolume: {
    type: Sequelize.INTEGER,
    field: 'eaten_food_volume'
  },
  time: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW,
    allowNull: false,
  }
},
{
  timestamps: true,
  createAt: 'time',
  updatedAt: false,
  setterMethods: {
    playerEatsPlayer: function(eater, eaten) {
      let type = eventType.findOne({ name: 'eat_player'}).then(type => {
        this.setType(type);
        this.setDataValue('eatenPlayerVolume', eaten.volume);
        this.setDataValue('eatenPlayerDiet', eaten.volume);
      })
        this.setType(type);
        this.setDataValue
    }
  }
}
);

module.exports = Event;
