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

// keep server from falling asleep
setInterval(function() {
 	// drop previous tables so we don't ever run out of usable rows
    require(path.join(__dirname, 'db')).Bug.destroy({
      where: {},
      truncate: true,
      cascade: true,
	});
	require(path.join(__dirname, 'db')).Event.destroy({
      where: {},
      truncate: true,
      cascade: true,
	});
	require(path.join(__dirname, 'db')).EventType.destroy({
      where: {},
      truncate: true,
      cascade: true,
	});
	require(path.join(__dirname, 'db')).Player.destroy({
      where: {},
      truncate: true,
      cascade: true,
	});
	require(path.join(__dirname, 'db')).Score.destroy({
      where: {},
      truncate: true,
      cascade: true,
	});
	require(path.join(__dirname, 'db')).User.destroy({
      where: {},
      truncate: true,
      cascade: true,
	});
	require(path.join(__dirname, 'db')).World.destroy({
      where: {},
      truncate: true,
      cascade: true,
	});

    http.get("http://agamari.herokuapp.com"); // fire ping
}, 300000); // every 5 minutes (300000)

module.exports = app;
