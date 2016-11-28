const passport = require('passport');
const { User } = require('./db');
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

module.exports = passport;
