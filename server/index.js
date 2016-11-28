'use strict';
const PORT = process.env.PORT || 8000;

const express = require('express');
const path = require('path');
const chalk = require('chalk');
const http = require('http');
const setUpListeners = require('./game/listeners');
const { broadcastState } = require('./game/engine');
const { db } = require(path.join(__dirname, 'db'));
const passport = require('./passport');
const passportSocketIo = require('passport.socketio');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');
const morgan = require('morgan');
const pg = require('pg');
const PgSession = require('connect-pg-simple')(session);

// Create server and app
const server = http.createServer();
const app = express();
server.on('request', app);

// Sockets
const io = require('socket.io')(server);


const pgStore = new PgSession({
    pg: pg,
    conString: process.env.DATABASE_URL || `postgres://localhost:5432/blobworld`,
    tableName: 'user_sessions'
  });

const sessionMiddleware = session({
  name: 'express.sid',
  secret: 'UNSAFE_SECRET',
  store: pgStore,
  saveUninitialized: true,
  resave: false,
  cookie: { httpOnly: true, maxAge: 30 * 24 * 60 * 60 * 1000 } // 30 days
});

const socketPassportMiddleware = passportSocketIo.authorize({
  cookieParser: cookieParser,
  key: 'express.sid',
  secret: 'UNSAFE_SECRET',
  store: pgStore,
  passport: passport
});

// Middleware and routers
app
   .use(bodyParser.json())
   .use(bodyParser.urlencoded({ extended: true }))
   .use(morgan('dev'))
   .use(sessionMiddleware)
   .use(passport.initialize())
   .use(passport.session())
   .use(express.static(path.join(__dirname, '..', 'public')))
   .use('/materialize-css',
      express.static(path.join(__dirname, '..', 'node_modules', 'materialize-css', 'dist')))
   .use('/jquery', express.static(path.join(__dirname, '..', 'node_modules', 'jquery', 'dist')))
   .use('/api', require('./api'));

// applyMiddleware(app);
io
  .use(socketPassportMiddleware)
  .on('connection', socket => {
    console.log(chalk.bgBlue.white(JSON.stringify(socket.request.user)));
     setUpListeners(io, socket);
  });
broadcastState(io);

// io.on('connection', socket => { setUpListeners(io, socket); });
// io.use(passportSocketIo.authorize({
//   cookieParser: cookieParser,
//   key: 'express.sid',
//   secret: 'UNSAFE_SECRET',
//   store: pgStore,
//   passport: passport
// }));
// broadcastState(io);


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

