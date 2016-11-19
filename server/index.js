'use strict';

const PORT = process.env.PORT || 8000;

const express = require('express'),
      path = require('path'),
      chalk = require('chalk'),
      http = require('http');

// Create server and app
const server = http.createServer();
const app = express();
server.on('request', app);

// Sockets
const io = require('socket.io')(server);
require('./sockets').setUpSockets(io);

// Middleware and routers
require('./middleware').applyMiddleware(app);

// Index path
const indexHtmlPath = path.join(__dirname, '..', 'public', 'index.html');
app.get('/', (req, res, next) => res.sendFile(indexHtmlPath));

// DB Sync and initialize server
require(path.join(__dirname, 'db')).db.sync()
    .then(() => {
      server.listen(PORT, () =>
        console.log(chalk.italic.magenta(`Server listening on ${PORT}...`)));
    })
    .catch(console.error);

