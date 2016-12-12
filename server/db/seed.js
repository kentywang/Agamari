'use strict';

const Promise = require('bluebird');

const { User, EventType, Score, db } = require('./index');

  let eventTypes = [
    { name: 'join_game' },
    { name: 'leave_game' },
    { name: 'eat_player' },
    { name: 'eat_food' }
  ];

 let scores = [
    {
      value: 10,
      time: new Date()
    },
    {
      value: 50,
      time: new Date()
    },
    {
      value: 900,
      time: new Date()
    }
  ];

 let users = [
    {
      email: 'dan@fullstack.com',
      password: 'diggitydan',
      admin: false,
      username: 'dan',
      nickname: 'dan',
      guest: false
    },
    {
      email: 'ben@fullstack.com',
      password: 'diggityben',
      admin: true,
      username: 'ben',
      nickname: 'ben',
      guest: false
    },
    {
      email: 'joe@fullstack.com',
      password: 'diggityjoe',
      admin: false,
      username: 'joe',
      nickname: 'joe',
      guest: false
    }

    ];

db.sync({force: true})
.then(() => {
  console.log('Dropped old data, now inserting data');
  return eventTypes.map((eventType) =>  EventType.create(eventType));
})
.then(() => {
 return scores.map((score) =>  Score.create(score));
})
.then(() => {
 return users.map((user) =>  User.create(user));
})
.then(() => {
 console.log('Finished inserting data (press ctrl-c to exit)');
})
.catch((err) => {
 console.error('There was totally a problem', err, err.stack);
});
