var ioreq = require("socket.io-request");
var io = require("socket.io")(3000);
var users = require('./test-users')



var sessions = {}

io.on("connection", function(socket){
  var clientIp = socket.request.headers.host

  ioreq(socket).response("login", function(req, res){
    var id = req.sessionId
    if (req.password === users[req.username]) {
      sessions[id] = {username: req.username, ip: clientIp}
      res(true)
      console.log(`${sessions[id].username} logged in.`)
      console.log(`ip: ${sessions[req.sessionId].ip}`)
    } else {
      res(false)
    }
  });

  ioreq(socket).response("logout", function(req, res){
    var id = req
    var user = sessions[id].username

    console.log(`${user} logged out.`)

    delete sessions[id]
    console.log(sessions);
  });

  ioreq(socket).response("speech", function(req, res){
    var id = req.sessionId
    var user = sessions[id].username
    var msg = req.msg
    res({user: user, msg: msg})
    console.log(`${new Date()} - ${user}: ${msg}`)
  });

});
