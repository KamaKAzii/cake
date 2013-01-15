(function() {
  var PORT, SECRET, app, connect, cookie, express, http, io, openSockets, parseJSONCookie, parseSignedCookie, server, sessions, sio, sioCookieParser, utils;
  http = require('http');
  connect = require('connect');
  express = require('express');
  io = require('socket.io');
  cookie = require('express/node_modules/cookie');
  utils = connect.utils;
  parseSignedCookie = connect.utils.parseSignedCookie;
  parseJSONCookie = connect.utils.parseJSONCookie;
  SECRET = 'secret';
  PORT = process.env.PORT || 3000;
  sioCookieParser = express.cookieParser(SECRET);
  sessions = {};
  app = express().use(connect.logger('dev')).use(connect.static('public')).use(express.cookieParser(SECRET)).use(express.cookieSession()).use(express.bodyParser()).use(connect.static(__dirname + '/public'));
  app.post('/login', function(req, res) {
    var login;
    console.log('session', req.session);
    login = req.session.login = req.body.id;
    if ((!login) || login === '') {
      res.redirect('/');
    }
    return res.redirect('/chat.html');
  });
  app.get('/logout', function(req, res) {
    req.session = null;
    return res.redirect('/');
  });
  app.get('/dumpCookies', function(req, res) {
    var cookieString;
    cookieString = JSON.stringify(req.headers.cookie);
    return res.end(cookieString + "::" + JSON.stringify(req.signedCookies));
  });
  console.log('cake: listening on port', PORT);
  server = http.createServer(app);
  server.listen(PORT);
  sio = io.listen(server);
  sio.configure(function() {
    sio.set("transports", ["xhr-polling"]);
    return sio.set("polling duration", 10);
  });
  sio.set('authorization', function(data, accept) {
    var cookies;
    cookies = cookie.parse(data.headers.cookie);
    data.signedCookies = utils.parseSignedCookies(cookies, SECRET);
    data.signedCookies = utils.parseJSONCookies(data.signedCookies);
    console.log("auth:", data.signedCookies);
    data.login = data.signedCookies['connect.sess'].login;
    if (data.login) {
      return accept(null, true);
    } else {
      return accept('auth problem', false);
    }
  });
  openSockets = [];
  sio.sockets.on('connection', function(socket) {
    var login, s, _i, _len;
    login = socket.handshake.login;
    socket.login = login;
    socket.on('disconnect', function() {
      var i, s, _i, _len, _results;
      i = openSockets.indexOf(socket);
      if (i === -1) {
        return;
      }
      openSockets.splice(i, 1);
      _results = [];
      for (_i = 0, _len = openSockets.length; _i < _len; _i++) {
        s = openSockets[_i];
        _results.push(s.emit('leave', {
          login: login
        }));
      }
      return _results;
    });
    socket.on('send-chat', function(data) {
      var s, _i, _len, _results;
      data.login = socket.handshake.login;
      data.date = new Date();
      console.log('broadcasting ' + JSON.stringify(data));
      console.log(openSockets.length);
      _results = [];
      for (_i = 0, _len = openSockets.length; _i < _len; _i++) {
        s = openSockets[_i];
        _results.push(s.emit('send-chat', data));
      }
      return _results;
    });
    for (_i = 0, _len = openSockets.length; _i < _len; _i++) {
      s = openSockets[_i];
      s.emit('join', {
        login: login
      });
    }
    openSockets.push(socket);
    return socket.emit('welcome', {
      login: login,
      members: (function() {
        var _j, _len2, _results;
        _results = [];
        for (_j = 0, _len2 = openSockets.length; _j < _len2; _j++) {
          s = openSockets[_j];
          _results.push(s.login);
        }
        return _results;
      })()
    });
  });
}).call(this);
