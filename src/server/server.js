var ioreq = require("socket.io-request");
var io = require("socket.io")(3000);
var users = require('./test-users')
var _ = require('lodash')

var version = '1.0.1'



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

function getUserIdByUsername(username, sessions) {
  return _.findKey(sessions, function(s) { return s.username === username; });
}

io.on("connection", function(socket){
  var clientIp = socket.request.connection.remoteAddress
  var clientId = socket.client.id

  // LOGIN
  ioreq(socket).response("login", function(req, res){
    sessions[clientId] = {username: req.username, ip: clientIp}
    var user           = sessions[clientId].username
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
    var msg  = req.msg
    var data = {user: user, msg: msg}
    io.to('/chat').emit('broadcastMessage', data)
    console.log(`${new Date()} - ${user}: ${msg}`)
  });

  socket.on("sendCommand", function(data){


    if (data.cmd[0] === '/who') {
      var users = []
      for (var key of Object.keys(sessions)) {
        if (key !== clientId) {
          users.push(sessions[key].username)
        }
      }
      var usersString
      users.length > 0 ? usersString = users.join(', ') : usersString = 'none'
      io.to(clientId).emit('systemMessage', {type: 'listUsers', users: usersString})


    } else if (data.cmd[0] === '/name') {
      var oldName = sessions[clientId].username
      var newName = data.cmd[1]
      io.to('/chat').emit('systemMessage', {type: 'changeNameAlert', oldName: oldName, newName: newName})
      io.to(clientId).emit('systemMessage', {type: 'changeName', newName: newName})
      sessions[clientId].username = newName


    } else if (data.cmd[0] === '/help') {
      io.to(clientId).emit('systemMessage', {type: 'help', data: ['/name <YourNewName>', '/who','/w <recipient> <message>', '/help']})


    } else if (data.cmd[0] === '/w') {
      var args        = data.cmd
      var sender      = sessions[clientId].username
      var recipient   = args[1]
      var recipientId = getUserIdByUsername(recipient, sessions)
      var msg         = args.slice(2, args.length).join(' ')
      var data        = {sender: sender, recipient: recipient, msg: msg}

      console.log(`${sender} to ${recipient}: ${msg}`)

      io.to(clientId).emit('whisper', data)
      io.to(recipientId).emit('whisper', data)
    }

  });

});
