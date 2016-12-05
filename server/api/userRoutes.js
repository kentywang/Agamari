
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

router.post('/anonymous', (req, res, next) => {
  console.log(req.cookie, res.cookie);
  console.log(req.session, res.session);
  User.create({
    displayName: req.body.displayName,
    anonymous: true
  })
  .then(user => {
    res.json({
      id: user.id,
      name: user.displayName
    });
  })
  .catch(next);
});
