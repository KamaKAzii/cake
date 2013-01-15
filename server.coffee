http = require 'http'
connect = require 'connect'
express = require 'express'
io = require 'socket.io'
cookie = require 'express/node_modules/cookie'
utils = connect.utils
parseSignedCookie = connect.utils.parseSignedCookie
parseJSONCookie = connect.utils.parseJSONCookie

SECRET = 'secret'
PORT = process.env.PORT || 3000

sioCookieParser = express.cookieParser SECRET

sessions = {}

app = express()
  .use(connect.logger 'dev')
  .use(connect.static 'public')
  .use(express.cookieParser SECRET)
  .use(express.cookieSession())
  .use(express.bodyParser())
  .use(connect.static __dirname + '/public')

app.post '/login', (req, res) ->
  console.log 'session', req.session
  login = req.session.login = req.body.id
  if (!login) or login == ''
    res.redirect '/'
  res.redirect '/chat.html'

app.get '/logout', (req, res) ->
  req.session = null
  res.redirect '/'

app.get '/dumpCookies', (req, res) ->
  cookieString = JSON.stringify req.headers.cookie
  res.end cookieString + "::" + JSON.stringify req.signedCookies

console.log 'cake: listening on port', PORT
server = http.createServer app
server.listen PORT

sio = io.listen server

sio.configure ->
  sio.set "transports", ["xhr-polling"]
  sio.set "polling duration", 10


sio.set 'authorization', (data, accept) ->
  cookies = cookie.parse data.headers.cookie
  data.signedCookies = utils.parseSignedCookies cookies, SECRET
  data.signedCookies = utils.parseJSONCookies data.signedCookies

  console.log "auth:", data.signedCookies
  data.login = data.signedCookies['connect.sess'].login
  if data.login
    accept null, true
  else
    accept 'auth problem', false

openSockets = []

sio.sockets.on 'connection', (socket) ->
  login = socket.handshake.login
  socket.login = login

  socket.on 'disconnect', ->
    i = openSockets.indexOf socket
    return if i == -1
    openSockets.splice i, 1

    for s in openSockets
      s.emit 'leave', {login}

  socket.on 'send-chat', (data) ->
    data.login = socket.handshake.login
    data.date = new Date()
    console.log 'broadcasting ' + JSON.stringify(data)
    console.log openSockets.length
    for s in openSockets
      s.emit 'send-chat', data

  for s in openSockets
    s.emit 'join', {login}

  openSockets.push socket

  socket.emit 'welcome',
    login: login
    members: s.login for s in openSockets
