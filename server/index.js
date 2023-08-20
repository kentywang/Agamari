const PORT = process.env.PORT || 8000;

const express = require('express');
const path = require('path');
const http = require('http');
const io = require('socket.io');
const setUpListeners = require('./game/listeners');
const { broadcastState } = require('./game/engine');

// Create server and app
const server = http.createServer();
const app = express();
server.on('request', app);

// Sockets
const ioServer = io(server);
ioServer.on('connection', (socket) => {
  setUpListeners(ioServer, socket);
});
broadcastState(ioServer);

// Middleware and routers
app.use(express.static(path.join(__dirname, '..', 'public')))
  .use(
    '/materialize-css',
    express.static(path.join(__dirname, '..', 'node_modules', 'materialize-css', 'dist')),
  );

// Index path
const indexHtmlPath = path.join(__dirname, '..', 'public', 'index.html');
app.get('/', (req, res) => res.sendFile(indexHtmlPath));

// eslint-disable-next-line no-console
server.listen(PORT, () => console.log(`Server listening on ${PORT}...`));

module.exports = app;
