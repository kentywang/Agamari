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
    },
    {
      name: 'World1'
    },
    {
      name: 'World2'
    },
    {
      name: 'World3'
    }
  ];

 let scores = [
    // {
    //   value: 10,
    //   time: new Date()
    // },
    // {
    //   value: 50,
    //   time: new Date()
    // },
    // {
    //   value: 90,
    //   time: new Date()
    // }
  ];

 let users = [
    {
      email: 'player1@fullstack.com',
      password: '1234',
      admin: false,
      username: 'player1'
    },
    {
      email: 'player2@fullstack.com',
      password: '1234',
      admin: false,
      username: 'player2'
    },
    {
      email: 'player3@fullstack.com',
      password: '1234',
      admin: false,
      username: 'player3'
    },
    {
      email: 'player4@fullstack.com',
      password: '1234',
      admin: false,
      username: 'player4'
    },
    {
      email: 'player5@fullstack.com',
      password: '1234',
      admin: false,
      username: 'player5'
    },
    {
      email: 'player6@fullstack.com',
      password: '1234',
      admin: false,
      username: 'player6'
    },
    {
      email: 'dan@fullstack.com',
      password: 'diggitydan',
      admin: false,
      username: 'dan'
    },
    {
      email: 'ben@fullstack.com',
      password: 'diggityben',
      admin: true,
      username: 'ben'
    },
    {
      email: 'joe@fullstack.com',
      password: 'diggityjoe',
      admin: false,
      username: 'joe'
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
