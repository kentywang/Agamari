const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const morgan = require('morgan');
const path = require('path');
const passport = require('./passport');
const pg = require('pg');
const PgSession = require('connect-pg-simple')(session);


const pgStore = new PgSession({
    pg: pg,
    conString: process.env.DATABASE_URL || `postgres://localhost:5432/blobworld`,
    tableName: 'user_sessions'
  });

const sessionOpts = {
  key: 'express.sid',
  secret: 'UNSAFE_SECRET',
  store: pgStore,
  saveUninitialized: true,
  resave: false,
  cookie: { httpOnly: true, maxAge: 30 * 24 * 60 * 60 * 1000 } // 30 days
};


const applyMiddleware = app => {
  app
   .use(bodyParser.json())
   .use(bodyParser.urlencoded({ extended: true }))
   .use(morgan('dev'))
   .use(session(sessionOpts))
   .use(passport.initialize())
   .use(passport.session())
   .use(express.static(path.join(__dirname, '..', 'public')))
   .use('/materialize-css',
      express.static(path.join(__dirname, '..', 'node_modules', 'materialize-css', 'dist')))
   .use('/jquery', express.static(path.join(__dirname, '..', 'node_modules', 'jquery', 'dist')))
   .use('/api', require('./api'));
};

module.exports = { applyMiddleware, pgStore };
