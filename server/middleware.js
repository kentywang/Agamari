const express = require('express'),
      bodyParser = require('body-parser'),
      morgan = require('morgan'),
      path = require('path'),
      passport = require('passport');

const applyMiddleware = app => {
  app.use(require('cookie-session') ({
    name: 'session',
    keys: [process.env.SESSION_SECRET || 'an insecure secret key'],
  }))
   .use(bodyParser.json())
   .use(bodyParser.urlencoded({ extended: false }))
   .use(morgan('dev'))
   .use(passport.initialize())
   .use(passport.session())
   .use(express.static(path.join(__dirname, '..', 'public')))
   .use('/materialize-css',
      express.static(path.join(__dirname, '..', 'node_modules', 'materialize-css', 'dist')))
   .use('/jquery', express.static(path.join(__dirname, '..', 'node_modules', 'jquery', 'dist')))
   .use('/api', require('./api/'));
};

module.exports = { applyMiddleware };
