'use strict';

const gameState = {
  room1: {color : "blue"},
  room2: {color: "green"}
}

const express = require('express'),
      bodyParser = require('body-parser'),
      morgan = require('morgan'),
      path = require('path'),
      chalk = require('chalk'),
      http = require('http'),
      server = http.createServer();


const app = express();

 server.on('request', app);

const PORT = process.env.PORT || 8000;

//sockets
const io = require('socket.io')(server);

io.on('connection', function(socket){
  console.log('A new client has connected')
  console.log('socket id: ', socket.id)

  //event that runs anytime a socket disconnects
  socket.on('disconnect', function(){
    console.log('socket id ' + socket.id + ' has disconnected. : (');
  })

  socket.on('button', function(start, end, color){
    console.log('clicked');

    io.emit('receivedClick');
  });

  socket.on('room', room => {
    for (let room in socket.rooms) socket.leave(room);
    socket.join(room);
    socket.emit('newGameState', gameState[room]);
  });

  socket.on('log', room => {
    io.sockets.in(room).emit('message', "hello from " + room);
  });

});


// middleware
app.use(bodyParser.json())
   .use(bodyParser.urlencoded({ extended: false }))
   .use(morgan('dev'))
   .use(express.static(path.join(__dirname, '..', 'public')))
   .use('/materialize-css',
      express.static(path.join(__dirname, '..', 'node_modules', 'materialize-css', 'dist')))
   .use('/jquery', express.static(path.join(__dirname, '..', 'node_modules', 'jquery', 'dist')))
   .use('/api', require('./api/'));
   

const indexHtmlPath = path.join(__dirname, '..', 'public', 'index.html');

app.get('/', (req, res, next) => res.sendFile(indexHtmlPath));

require(path.join(__dirname, 'db')).db.sync()
    .then(() => {
      server.listen(PORT, () =>
        console.log(chalk.italic.magenta(`Server listening on ${PORT}...`)));
    })
    .catch(console.error);


