const passport = require('../passport');
const router = module.exports = require('express').Router();


router.get('/whoami', (req, res) => res.send(req.user));


router.post('/login/guest', passport.authenticate('guest-login'), (req, res, next) => {
  console.log('guest logging in!');
  res.send('OK');
});

router.post('/login', passport.authenticate('local'), (req, res, next) => {
  console.log('user logging in!');
  res.send('OK');
});

router.get('/logout', (req, res, next) => {
  req.logout();
  res.sendStatus(204);
});
