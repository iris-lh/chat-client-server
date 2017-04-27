var ioreq = require("socket.io-request");
var io = require("socket.io")(3000);
var users = require('./test-users')

var version = '1.0.0'

var sessions = {}

function numberOfAnons(sessions) {
  count = 0
  for (var key of Object.keys(sessions)) {
    if ( (sessions[key].username) && (sessions[key].username.slice(0,9) === 'anon') ) {
      count++
    }
  }
  return count
}

io.on("connection", function(socket){
  var clientIp = socket.request.connection.remoteAddress
  var clientId = socket.client.id

  // LOGIN
  ioreq(socket).response("login", function(req, res){
    sessions[clientId] = {username: req.username, ip: clientIp}
    var user = sessions[clientId].username
    var returnUserName = user ? user : 'anon-' + (numberOfAnons(sessions))

    sessions[clientId].username = returnUserName
    res({success: true, username: returnUserName})

    console.log(`${returnUserName} logged in.`)
    console.log(`ip: ${sessions[clientId].ip}`)
    io.to('/chat').emit('systemMessage', {type: 'userConnected', user: user})
    socket.join('/chat')
  });

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
    // console.log('heard heartbeat from ' + clientId)
  })




  // LOGOUT
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

    switch(data.cmd[0]) {
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

      case '/name':
        var oldName = sessions[clientId].username
        var newName = data.cmd[1]
        io.to('/chat').emit('systemMessage', {type: 'changeName', oldName: oldName, newName: newName})
        sessions[clientId].username = newName
        break;

      case '/help':
        io.to(clientId).emit('systemMessage', {type: 'help', data: ['/name <YourNewName>', '/who', '/help']})
        break;
    }

  });

});
