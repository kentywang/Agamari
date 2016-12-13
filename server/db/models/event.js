const Sequelize = require('sequelize');
const Promise = require('bluebird');
const db = require('../_db');
const EventType = require('./eventType');

const Event = db.define('event', {
  volume: {
    type: Sequelize.INTEGER,
    field: 'player_volume'
  },
  playersEaten: {
    type: Sequelize.INTEGER,
    field: 'players_eaten'
  },
  foodEaten: {
    type: Sequelize.INTEGER,
    field: 'food_eaten'
  },
  eatenPlayerVolume: {
    type: Sequelize.INTEGER,
    field: 'eaten_player_volume'
  },
  eatenPlayerPlayersEaten: {
    type: Sequelize.INTEGER,
    field: 'eaten_player_players_eaten'
  },
  eatenPlayerFoodEaten: {
    type: Sequelize.INTEGER,
    field: 'eaten_player_food_eaten'
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
  classMethods: {
    playerEatsPlayer: function(eater, eaten) {
      let event = this.create({
          volume: eater.volume,
          playersEaten: eater.playersEaten,
          foodEaten: eater.foodEaten,
          eatenPlayerVolume: eaten.volume,
          eatenPlayerPlayersEaten: eaten.playersEaten,
          eatenPlayerFoodEaten: eaten.foodEaten,
        });
      let type = EventType.findOne({ where: { name: 'eat_player' }});
      return Promise.all([event, type]).spread((event, type) => {
        event.setType(type.id);
        event.setPlayer(eater.id);
        event.setEatenPlayer(eaten.id);
        event.setWorld(eater.world);
        return event;
      });
    },
    playerEatsFood: function(player) {
      let event = this.create({
          volume: player.volume,
          playersEaten: player.playersEaten,
          foodEaten: player.foodEaten
        });
      let type = EventType.findOne({ where: { name: 'eat_food' }});
      return Promise.all([event, type]).spread((event, type) => {
        event.setType(type.id);
        event.setPlayer(player.id);
        event.setWorld(player.world);
        return event;
      });
    },
    playerRespawns: function(player) {
      let event = this.create({
          volume: player.volume,
          playersEaten: player.playersEaten,
          foodEaten: player.foodEaten
        });
      let type = EventType.findOne({ where: { name: 'respawn' }});
      return Promise.all([event, type]).spread((event, type) => {
        event.setType(type.id);
        event.setPlayer(player.id);
        event.setWorld(player.world);
        return event;
      });
    },
    joinWorld: function(player) {
      let event = this.create({
          volume: player.volume,
          playersEaten: player.playersEaten,
          foodEaten: player.foodEaten
        });
      let type = EventType.findOne({ where: { name: 'join_world' }});
      return Promise.all([event, type]).spread((event, type) => {
        event.setType(type.id);
        event.setPlayer(player.id);
        event.setWorld(player.world);
        return event;
      });
    },
    leaveWorld: function(player) {
      let event = this.create({
          volume: player.volume,
          playersEaten: player.playersEaten,
          foodEaten: player.foodEaten
        });
      let type = EventType.findOne({ where: { name: 'leave_world' }});
      return Promise.all([event, type]).spread((event, type) => {
        event.setType(type.id);
        event.setPlayer(player.id);
        event.setWorld(player.world);
        return event;
      });
    }
  }
}
);

module.exports = Event;
