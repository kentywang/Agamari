'use strict';
const PORT = process.env.PORT || 8000;

const express = require('express');
const path = require('path');
const chalk = require('chalk');
const http = require('http');
const setUpListeners = require('./game/listeners');
const { broadcastState } = require('./game/engine');
const { db, User } = require(path.join(__dirname, 'db'));

// Create server and app
const server = http.createServer();
const app = express();
server.on('request', app);

// Sockets
const io = require('socket.io')(server);

io.on('connection', socket => { setUpListeners(io, socket); });
broadcastState(io);

// Middleware and routers
require('./middleware').applyMiddleware(app);

// Index path
const indexHtmlPath = path.join(__dirname, '..', 'public', 'index.html');
app.get('/', (req, res, next) => res.sendFile(indexHtmlPath));

// DB Sync and initialize server
db.sync()
  .then(() => {
    server.listen(PORT, () =>
      console.log(chalk.italic.magenta(`Server listening on ${PORT}...`)));
  })
  .catch(console.error);

