'use strict';

const Promise = require('bluebird');

const { EventType, db } = require('./index');

  let eventTypes = [
    { name: 'join_world' },
    { name: 'leave_world' },
    { name: 'eat_player' },
    { name: 'eat_food' },
    { name: 'respawn' }
  ];


db.sync({force: true})
.then(() => {
  console.log('Dropped old data, now inserting data');
  return eventTypes.map((eventType) =>  EventType.create(eventType));
})
.then(() => {
 console.log('Finished inserting data (press ctrl-c to exit)');
})
.catch((err) => {
 console.error('There was totally a problem', err, err.stack);
});
