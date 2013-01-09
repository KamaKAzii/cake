connect = require 'connect'
express = require 'express'

SECRET = 'secret'
PORT = 3000
console.log 'listening on port', PORT

sessions = {}

app = express()
  .use(connect.logger 'dev')
  .use(connect.static 'public')
  .use(connect.cookieParser())
  .use(connect.cookieSession {secret: SECRET})
  .use(connect.static __dirname + '/public')
  .use '/login', (req, res) ->
    key = req.cookies['connect.sess']
    sessions[key] =
      login: req.param 'id'
    res.redirect '/chat'
  .use '/chat', (req, res) ->
    key = req.cookies['connect.sess']
    s = sessions[key]
    res.end 'yo ' + s.login
  .use (req, res) ->
    res.end 'hello, world\n'
  .listen PORT
