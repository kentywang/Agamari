'use strict';
const PORT = process.env.PORT || 8000;

const express = require('express');
const path = require('path');
const chalk = require('chalk');
const http = require('http');
const store = require('./store');
const setUpListeners = require('./game/listeners');
const { broadcastState } = require('./game/engine');

// Create server and app
const server = http.createServer();
const app = express();
server.on('request', app);

// Sockets
const io = require('socket.io')(server);
// setUpSockets(io);
io.on('connection', socket => { setUpListeners(io, socket); });
broadcastState(io);

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

