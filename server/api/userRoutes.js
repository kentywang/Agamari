
'use strict';

const router = module.exports = require('express').Router()

const Room = require('../db/models/room');
const Score = require('../db/models/score');
const User = require('../db/models/user');
module.exports = router;


router.get('/', function (req, res, next) {
 User.findAll()
 .then(users => res.json(users))
 .catch((err)=>{console.log(err);
 				next(err)});
});

router.get('/:id', function (req, res, next) {
 User.findOne({
    where: {
      id: req.params.id
    },
	})
  	.then(user => res.json(user))
    .catch(next);
})


/*
router.post('/login', function (req, res, next) {
 User.findOne({
   where: req.body
 })
 .then(function (user) {
   if (!user) {
     res.sendStatus(401);
   } else {
     req.session.userId = user.id;
     res.sendStatus(204);
   }
 })
 .catch(next);
});

router.get('/logout', function (req, res, next) {
 req.session.destroy();
 res.sendStatus(204);
});


router.delete('/:userId', function(req, res, next) {
    if(req.user.admin) {
    User.destroy({
      where: {
        id: req.params.id
      }    
    })
    .then( (params) => {
      console.log("params", params)
      res.sendStatus(202);
    })
    .catch(next);
  } else {
    res.sendStatus(401);
  }
})



*/



