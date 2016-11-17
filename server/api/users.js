
'use strict';

const router = module.exports = require('express').Router()

const Room = require('../db/models/room');
const Score = require('../db/models/score');
const User = require('../db/models/user');
module.exports = router;


router.get('/', function (req, res, next) {
 console.log("test");
 User.findAll()
 .then(users => {
 	console.log(users)
 	res.json(users)})
 .catch((err)=>{console.log(err);
 				next(err)});
});

// router.get('/:id', function (req, res, next) {
//  console.log(req.session);
//  User.findById(req.params.id)
//  .then(user => res.json(user))
//  .catch(next);

// })

// router.get('orders/:userId', function(req, res, next) {
//  Order.getAllOrdersByUserId(req.params.userId)
//  .then(orders => res.json (orders))
//  .catch(next);
// });

// router.post('/login', function (req, res, next) {
//  User.findOne({
//    where: req.body
//  })
//  .then(function (user) {
//    if (!user) {
//      res.sendStatus(401);
//    } else {
//      req.session.userId = user.id;
//      res.sendStatus(204);
//    }
//  })
//  .catch(next);
// });

// router.get('/logout', function (req, res, next) {
//  req.session.destroy();
//  res.sendStatus(204);
// });


// router.post('/signup', function (req, res, next) {

//  User.findOrCreate({
//    where: {
//      firstName: req.body.firstName,
//      lastName: req.body.lastName,
//      email: req.body.email
//    },
//    defaults: {
//      password: req.body.password
//    }
//  })
//  .then(function (user) {
//    req.session.userId = user.id;
//    res.sendStatus(204);
//  });

// });

// router.get('/me', function (req, res, next) {
//  if (req.user) {
//    res.send(req.user);
//  } else {
//    res.sendStatus(401);
//  }
// });

