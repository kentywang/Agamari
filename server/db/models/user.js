const Sequelize = require('sequelize');
const db = require('../_db');
const bcrypt = require('bcrypt');

const User = db.define('user', {
  email: {
    type: Sequelize.STRING,
    unique: true
  },
  password: {
    type: Sequelize.VIRTUAL
  },
  password_digest: {
    type: Sequelize.STRING,
  },
  admin: {
    type: Sequelize.BOOLEAN
  },
  username: {
    type: Sequelize.STRING,
    unique: true
  },
  guest: {
    type: Sequelize.BOOLEAN,
  }
},
{
  hooks: {
    beforeCreate: setEmailAndPassword,
    beforeUpdate: setEmailAndPassword
  },
  instanceMethods: {
    authenticate(plaintext) {
      return new Promise((resolve, reject) =>
        bcrypt.compare(plaintext, this.password_digest,
          (err, result) =>
            err ? reject(err) : resolve(result))
        );
    }
  }
});

function setEmailAndPassword(user) {
  user.email = user.email && user.email.toLowerCase();
  if (!user.password) return Promise.resolve(user);

  return new Promise((resolve, reject) =>
      bcrypt.hash(user.get('password'), 10, (err, hash) => {
          if (err) reject(err);
          user.set('password_digest', hash);
      resolve(user);
      })
  );
}
module.exports = User;
