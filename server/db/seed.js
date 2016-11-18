'use strict'

const Promise = require('bluebird');

const {User, Room, Score,db} = require('./index')


let rooms = [
    {
      name: "World1"
    },
    {
      name: "World2"
    },
    {
      name: "World3"
    }
  ];

 let scores= [
    {
      value: 10,
      time:new Date()
    },
    {
      value: 50,
      time:new Date()
    },
    {
      value: 90,
      time:new Date()
    }
  ];

 let users= [
    { 
      email:"dan@fullstack.com",
      password:"diggitydan",
      admin:false,
      username:"dan"
    },
    {
      email:"ben@fullstack.com",
      password:"diggityben",
      admin:true,
      username:"ben"
    },
    {
      email:"joe@fullstack.com",
      password:"diggityjoe",
      admin:false,
      username:"joe"
    }

    ];

db.sync({force: true})
.then(function () {
 console.log("Dropped old data, now inserting data");
 return rooms.map((room) =>  Room.create(room))
})
.then(function () {
 return scores.map((score) =>  Score.create(score))
})
.then(function () {
 return users.map((user) =>  User.create(user))
})
.then(function () {
 console.log("Finished inserting data (press ctrl-c to exit)");
})
.catch(function (err) {
 console.error('There was totally a problem', err, err.stack);
});

  

