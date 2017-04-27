var ioreq = require("socket.io-request");
var io = require("socket.io")(3000);
var users = require('./test-users')



var sessions = {}

io.on("connection", function(socket){
  var clientIp = socket.request.connection.remoteAddress
  var clientId = socket.client.id


  socket.join('/chat')

  console.log(socket.rooms)

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


  socket.on("sendMessage", function(req, res){
    var user = sessions[clientId].username
    var msg = req.msg
    var data = {user: user, msg: msg}

    io.to('/chat').emit('broadcastMessage', data)

    console.log(`${new Date()} - ${user}: ${msg}`)
  });

});
