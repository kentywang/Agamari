const express = require('express'),
      bodyParser = require('body-parser'),
      morgan = require('morgan'),
      path = require('path');

const applyMiddleware = app => {
  app.use(bodyParser.json())
   .use(bodyParser.urlencoded({ extended: false }))
   .use(morgan('dev'))
   .use(express.static(path.join(__dirname, '..', 'public')))
   .use('/materialize-css',
      express.static(path.join(__dirname, '..', 'node_modules', 'materialize-css', 'dist')))
   .use('/jquery', express.static(path.join(__dirname, '..', 'node_modules', 'jquery', 'dist')))
   .use('/api', require('./api/'));
};

module.exports = { applyMiddleware };
