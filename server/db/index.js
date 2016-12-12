const User = require('./models/user');
const Player = require('./models/player');
const World = require('./models/world');
const Event = require('./models/event');
const EventType = require('./models/eventType');
const Score = require('./models/score');
const Bug = require('./models/bug');
const db = require('./_db');


//ASSOCIATIONS
User.hasMany(Player);
Player.belongsTo(User);

World.hasMany(Player);
Player.belongsTo(World);

Player.hasMany(Event, { as: 'eatPlayerEvent', foreignKey: 'player_id' });
Event.belongsTo(Player, { foreignKey: 'player_id' });
Player.hasMany(Event, { as: 'gotEatenEvent', foreignKey: 'eaten_player_id' });
Event.belongsTo(Player, { as: 'eatenPlayer', foreignKey: 'eaten_player_id' });
EventType.hasMany(Event, { foreignKey: 'event_type' });
Event.belongsTo(EventType, { as: 'type', foreignKey: 'event_type' });
World.hasMany(Event, { underscore: true });
Event.belongsTo(World, { underscore: true });

Player.hasMany(Score);
Score.belongsTo(Player);
World.hasMany(Score);
Score.belongsTo(World);

module.exports = { db, User, Player, World, Event, EventType, Score, Bug };
