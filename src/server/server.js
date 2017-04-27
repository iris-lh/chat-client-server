var ioreq = require("socket.io-request");
var io = require("socket.io")(3000);
var users = require('./test-users')



var sessions = {}

io.on("connection", function(socket){
  var clientIp = socket.request.headers.host
  var clientId = socket.client.id

  socket.on('disconnect', ()=> {
    console.log(`${sessions[clientId].username} disconnected.`)
    delete sessions[clientId]
  })

  ioreq(socket).response("login", function(req, res){
    if (req.password === users[req.username]) {
      sessions[clientId] = {username: req.username, ip: clientIp}
      res(true)
      console.log(`${sessions[clientId].username} logged in.`)
      console.log(`ip: ${sessions[clientId].ip}`)
    } else {
      res(false)
    }
  });

  ioreq(socket).response("logout", function(req, res){
    var user = sessions[clientId].username

    console.log(`${user} logged out.`)

    delete sessions[id]
  });

  ioreq(socket).response("speech", function(req, res){
    var user = sessions[clientId].username
    var msg = req.msg
    res({user: user, msg: msg})
    console.log(`${new Date()} - ${user}: ${msg}`)
  });

});
