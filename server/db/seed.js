'use strict';

const Promise = require('bluebird');

const { User, Room, Score, db } = require('./index');


let rooms = [
    {
      name: 'room1'
    },
    {
      name: 'room2'
    },
    {
      name: 'room3'
    }
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
      guest:false
    },
    {
      email: 'ben@fullstack.com',
      password: 'diggityben',
      admin: true,
      username: 'ben',
      nickname: 'ben',
      guest:false
    },
    {
      email: 'joe@fullstack.com',
      password: 'diggityjoe',
      admin: false,
      username: 'joe',
      nickname: 'joe',
      guest:false
    }

    ];

db.sync({force: true})
.then(() => {
 console.log('Dropped old data, now inserting data');
 return rooms.map((room) =>  Room.create(room));
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
