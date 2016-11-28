'use strict';

(function(){


  const passportSocketIo = require('passport.socketio');
  const cookieParser = require('cookie-parser');

  var appRoot = require('app-root-path') + '/app/server';

  var debug         = require('debug')('k:socketio.server.config');
  // var config        = require(appRoot + '/config/app.server.config');
  // var cookieParser  = require('cookie-parser');
  var passport = require(appRoot + '/config/passport.server.config');
  // var passportSocketIo = require('passport.socketio');
  var chatController = require(appRoot + '/chat/chat.server.controller');


  module.exports = function(server, io, pgStore) {

    //-- use passport.socketio middleware, so that authentication information
    //   will be available in socket
    io.use(passportSocketIo.authorize({
      cookieParser: cookieParser,         // the same middleware we registrer in express
      key:          'express.sid', // the name of the cookie where express/connect stores its session_id
      secret:       'UNSAFE_SECRET', // the session_secret to parse the cookie
      store:        pgStore,           // we NEED to use a sessionstore. no memorystore please
      success:      onAuthorizeSuccess,   // *optional* callback on success - read more below
      fail:         onAuthorizeFail,      // *optional* callback on fail/error - read more below
      passport:     passport
    }));

    function onAuthorizeSuccess(data, accept){
      debug('passport.socketio: authorized successfully');

      accept();
    }

    function onAuthorizeFail(data, message, error, accept){
      if (error){
        throw new Error(message);
      }

      debug('passport.socketio: authorization failed: ', message);

      //-- accept connection anyway
      //   (even for non-users, we might want to have some real-time
      //   functionality)
      accept();

      //-- NOTE: if you want to reject the connection, use:
      //accept(new Error('error message'));
    }

    io.on('connection', function(socket) {
      debug('connection event fired, user: ', socket.request.user);

      //-- take care of feed connection
      chatController.clientConnect(io, socket);

    });
  };

})();
