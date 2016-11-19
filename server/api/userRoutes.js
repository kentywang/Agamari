
'use strict';

const router = module.exports = require('express').Router();

const User = require('../db/models/user');
module.exports = router;


router.get('/', (req, res, next) => {
  User.findAll()
    .then(users => res.json(users))
    .catch(next);
});

router.get('/:id', function (req, res, next) {
  User.findById(req.params.id)
    .then(user => res.json(user))
    .catch(next);
});


/*
router.post('/login', (req, res, next) => {
 User.findOne({
   where: req.body
 })
 .then(user => {
   if (!user) {
     res.sendStatus(401);
   } else {
     req.session.userId = user.id;
     res.sendStatus(204);
   }
 })
 .catch(next);
});

router.get('/logout', (req, res, next) => {
 req.session.destroy();
 res.sendStatus(204);
});


router.delete('/:userId', (req, res, next) => {
    if(req.user.admin) {
    User.destroy({
      where: {
        id: req.params.id
      }
    })
    .then(params => {
      console.log("params", params)
      res.sendStatus(202);
    })
    .catch(next);
  } else {
    res.sendStatus(401);
  }
})

*/
