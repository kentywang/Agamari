'use strict';

const express = require('express'),
      bodyParser = require('body-parser'),
      morgan = require('morgan'),
      path = require('path'),
      chalk = require('chalk');

const app = express();

const PORT = process.env.PORT || 8000;

app.use(bodyParser.json())
   .use(bodyParser.urlencoded({ extended: false }))
   .use(morgan('dev'))
   .use(express.static(path.join(__dirname, '..', 'public')))
   .use('/materialize-css',
      express.static(path.join(__dirname, '..', 'node_modules', 'materialize-css', 'dist')))
   .use('/three', express.static(path.join(__dirname, '..', 'node_modules', 'three', 'build')))
   //.use('/api', require('./api'));

const indexHtmlPath = path.join(__dirname, '..', 'public', 'index.html');

app.get('*', (req, res, next) => res.sendFile(indexHtmlPath));

require(path.join(__dirname, 'db'))._db.sync()
    .then(function () {
      app.listen(PORT, () =>
        console.log(chalk.italic.magenta(`Server listening on ${PORT}...`)));
    })
    .catch(function(err){
        console.log("Error!")
    });


