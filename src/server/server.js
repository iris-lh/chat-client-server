var ioreq = require("socket.io-request");
var io = require("socket.io")(3000);
var _ = require('lodash')

var version = '2.0.2'



function numberOfAnons(sessions) {
  count = 0

  // Replace with lodash!
  for (var key of Object.keys(sessions)) {
    if ( (sessions[key].username) && (sessions[key].username.slice(0,4) === 'anon') ) {
      count++
    }
  }
  console.log(`number of anons: ${count}`)
  return count
}

function getUserIdByUsername(username, sessions) {
  return _.findKey(sessions, function(s) { return s.username === username; });
}



var sessions = {}

var anons = 0

io.on("connection", function(socket){
  var clientIp = socket.request.connection.remoteAddress
  var clientId = socket.client.id



  ioreq(socket).response("login", function(req, res){
    sessions[clientId] = {username: req.username, ip: clientIp}
    var user           = sessions[clientId].username


    var returnUserName
    if (user) {
      returnUserName = user
    } else {
      returnUserName = 'anon-' + (anons)
      anons++
    }
    // var returnUserName = user ? user : 'anon-' + (numberOfAnons(sessions))
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



  socket.on("sendMessage", function(req, res){
    var user = sessions[clientId].username
    var msg  = req.msg
    var data = {user: user, msg: msg}
    io.to('/chat').emit('broadcastMessage', data)
    console.log(`${new Date()} - ${user}: ${msg}`)
  });



  socket.on("sendCommand", function(data){
    var cmd = data.cmd.split(' ')


    if (cmd[0] === '/who') {
      var users = []

      // Replace with lodash!
      for (var key of Object.keys(sessions)) {
        if (key !== clientId) {
          users.push(sessions[key].username)
        }
      }
      var usersString
      users.length > 0 ? usersString = users.join(', ') : usersString = 'none'
      io.to(clientId).emit('systemMessage', {type: 'listUsers', users: usersString})


    } else if (cmd[0] === '/name') {
      var oldName = sessions[clientId].username
      var newName = cmd[1]
      io.to('/chat').emit('systemMessage', {type: 'changeNameAlert', oldName: oldName, newName: newName})
      io.to(clientId).emit('systemMessage', {type: 'changeName', newName: newName})
      sessions[clientId].username = newName


    } else if (cmd[0] === '/help') {
      io.to(clientId).emit('systemMessage', {type: 'help', data: ['/name <YourNewName>', '/who','/w <recipient> <message>', '/help']})


    } else if (cmd[0] === '/w') {
      var args        = cmd
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
