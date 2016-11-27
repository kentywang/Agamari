const passport = require('passport');
const { User } = require('./db');
const auth = require('express').Router();


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

auth.get('/whoami', (req, res) => res.send(req.user));

auth.post('/login', passport.authenticate('local'), (req, res, next) => {
  res.send('OK');
});


module.exports = auth;
