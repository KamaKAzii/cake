connect = require 'connect'

PORT = 3000
console.log 'listening on port', PORT

app = connect()
  .use(connect.logger 'dev')
  .use(connect.static 'public')
  .use (req, res) ->
    res.end 'hello, world\n'
  .listen PORT
