'use strict';

const router = module.exports = require('express').Router()

const Room = require('../db/models/room');
const Score = require('../db/models/score');
const User = require('../db/models/user');
module.exports = router;


router.get('/', function (req, res, next) {
 Room.findAll()
 .then(rooms => res.json(rooms))
 .catch((err)=>{console.log(err);
 				next(err)});
});

router.get('/:id', function (req, res, next) {
 Room.findOne({
    where: {
      id: req.params.id
    },
	})
  	.then(Room => res.json(room))
    .catch(next);
})






