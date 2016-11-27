'use strict';
const PORT = process.env.PORT || 8000;

const express = require('express');
const path = require('path');
const chalk = require('chalk');
const http = require('http');
const setUpListeners = require('./game/listeners');
const { broadcastState } = require('./game/engine');
const { db, User } = require(path.join(__dirname, 'db'));
const { passport } = require('./auth');
const passportSocketIo = require('passport.socketio');
const cookieParser = require('cookie-parser');
const { pgStore, applyMiddleware } = require('./middleware');

// Create server and app
const server = http.createServer();
const app = express();
server.on('request', app);

// Sockets
const io = require('socket.io')(server);

io.use(passportSocketIo.authorize({
  key: 'connect.sid',
  secret: 'UNSAFE_SECRET',
  store: pgStore,
  passport: passport,
  cookieParser: cookieParser
}));

io.on('connection', socket => { setUpListeners(io, socket); });
broadcastState(io);

// Middleware and routers
applyMiddleware(app);

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

