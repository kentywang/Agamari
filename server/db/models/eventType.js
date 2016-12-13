const Sequelize = require('sequelize');
const db = require('../_db');

const EventType = db.define('eventType', {
  name: {
    type: Sequelize.STRING
  }
},
{

}
);

module.exports = EventType;
