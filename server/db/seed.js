'use strict';

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
  return Promise.all(eventTypes.map((eventType) =>  EventType.create(eventType)));
})
.then(() => {
 console.log('Finished inserting data.');
 process.exit(0);
})
.catch((err) => {
 console.error('There was totally a problem', err, err.stack);
 process.exit(1);
});
