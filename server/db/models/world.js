const Sequelize = require('sequelize');
const db = require('../_db');

const World = db.define('world', {
  name: {
    type: Sequelize.STRING
  },
  destroyedAt: {
    type: Sequelize.DATE,
    field: 'destroyed_at'
  }
});
World.blowUp = function(id) {
  this.update({destroyedAt: Date.now()}, {where: {id}});
};

module.exports = World;
