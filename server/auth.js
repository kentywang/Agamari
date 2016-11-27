const passport = require('passport');
const { User } = require('./db');
const router = require('express').Router();
const CustomStrategy = require('passport-custom');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(
  (id, done) => {
    User.findById(id)
      .then(user => {
        done(null, user);
      })
      .catch(err => {
        done(err);
      });
  }
);

passport.use('guest-login', new CustomStrategy(
  (req, done) => {
    let { nickname } = req.body;
    User.create({ nickname, guest: true })
      .then((user) => done(null, user))
      .catch(err => done(null, false, { message: err.message }));
  }
));

passport.use(new (require('passport-local').Strategy)({
    usernameField: 'email',
    passwordField: 'password'
  },
  (email, password, done) => {
    User.findOne({ where: { email } })
      .then(user => {
        if (!user) {
          return done(null, false, { message: 'Login incorrect' });
        }
        return user.authenticate(password)
          .then(ok => {
            if (!ok) {
              return done(null, false, { message: 'Login incorrect' });
            }
            done(null, user);
          });
      })
      .catch(done);
  }
));

router.get('/whoami', (req, res) => res.send(req.user));


router.post('/login/guest', passport.authenticate('guest-login'), (req, res, next) => {
  console.log('prev req user', req.user);
  console.log('guest logging in!')
  res.send('OK');
});

router.post('/login', passport.authenticate('local'), (req, res, next) => {
  console.log('prev req user', req.user);
  console.log('user logging in!')
  res.send('OK');
});

router.get('/logout', (req, res, next) => {
  req.logout();
  res.sendStatus(204);
})

module.exports = { router, passport};
