var ioreq = require("socket.io-request");
var io = require("socket.io")(3000);
var users = require('./test-users')

var version = '0.1.2'

var sessions = {}

io.on("connection", function(socket){
  var clientIp = socket.request.connection.remoteAddress
  var clientId = socket.client.id


  socket.on('disconnect', ()=> {
    var user = sessions[clientId].username
    console.log(`${user} disconnected.`)
    io.to('/chat').emit('systemMessage', {type: 'userDisconnected', user: user})
    delete sessions[clientId]
  })


  var heartbeatId = setInterval(()=>{
    io.emit('serverHeartbeat')
  }, 10000)

  socket.on('clientHeartbeat', ()=>{
    console.log('heard heartbeat from ' + clientId)
  })


  ioreq(socket).response("login", function(req, res){
    sessions[clientId] = {username: req.username, ip: clientIp}
    var user = sessions[clientId].username
    res(true)
    console.log(`${user} logged in.`)
    console.log(`ip: ${sessions[clientId].ip}`)
    io.to('/chat').emit('systemMessage', {type: 'userConnected', user: user})
    socket.join('/chat')
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

  socket.on("sendCommand", function(data){

    switch(data.cmd) {
      case '/who':
        var users = []

        for (var key of Object.keys(sessions)) {
          if (key !== clientId) {
            users.push(sessions[key].username)
          }
        }

        var usersString
        users.length > 0 ? usersString = users.join(', ') : usersString = 'none'

        io.to(clientId).emit('systemMessage', {type: 'listUsers', users: usersString})

        break;
    }

  });

});
