var config = require('./config')
var io = require("socket.io-client")(config.host);
var ioreq = require("socket.io-request");
var colors = require('./colors')

var version = '1.0.1'


module.exports = (elements)=> {
  var {screen, login, input, log} = elements
  var heartbeatIntervalId
  var reconnectIntervalId
  var USERNAME = process.argv[2]

  screen.append(log)
  screen.append(input)
  input.focus()



  log.pushLine(`${colors.system}CLIENT ${colors.default}Connecting to ${config.host}...`)

  io.on('connect', ()=> {
    clearInterval(reconnectIntervalId)

    heartbeatIntervalId = setInterval(()=>{
      io.emit('clientHeartbeat')
    }, 10000)

    log.pushLine(`${colors.system}CLIENT ${colors.success}Connected!`)

    ioreq(io).request(
      'login',
      {username: USERNAME, version: version}
      // {version: version}
    ).then((res)=> {
      USERNAME = res.username
      res.success ? log.pushLine(`${colors.system}CLIENT ${colors.default}Logged in as ${colors.self}${USERNAME}{/}.`)
      : log.pushLine(`${colors.system}CLIENT ${colors.failure}Failed to log in.`)
      log.pushLine('')
    })
  })


  io.on('disconnect', ()=> {
    log.pushLine(`${colors.system}CLIENT ${colors.default}Disconnected.`)
    log.setScrollPerc(100)
    clearInterval(heartbeatIntervalId)
    reconnectIntervalId = setInterval(()=>{
      log.pushLine(`${colors.system}CLIENT ${colors.default}Attempting to reconnect...`)
      log.setScrollPerc(100)
    }, 1500)
    io.emit('heartbeat')
  })



  io.on('serverHeartbeat', ()=> {
    // log.pushLine('heard heartbeat from server')
  })



  io.on('broadcastMessage', (msg)=> {
    if (msg.user !== USERNAME) {
      log.pushLine(`${colors.others}${msg.user} ${colors.default}${msg.msg}`)
      log.setScrollPerc(100)
    }
  })

  io.on('systemMessage', (msg)=> {
    switch(msg.type) {

      case 'userDisconnected':
        log.pushLine(`${colors.system}SERVER ${colors.others}${msg.user} ${colors.default}disconnected.`)
        break;

      case 'userConnected':
        log.pushLine(`${colors.system}SERVER ${colors.others}${msg.user} ${colors.default}connected.`)
        break;

      case 'listUsers':
        log.pushLine(`${colors.system}SERVER ${colors.default}Other connected users: ${colors.others}${msg.users}`)
        break;

      case 'changeName':
        USERNAME = msg.newName
        break;

      case 'changeNameAlert':
        log.pushLine(`${colors.system}SERVER ${colors.others}${msg.oldName} ${colors.default}changed their name to ${colors.others}${msg.newName}.`)
        break;

      case 'help':
        log.pushLine(`${colors.system}SERVER ${colors.default}${msg.data.join(', ')}`)
        break;
    }
    log.setScrollPerc(100)
  })

  // LOGIN



  // INPUT

  input.key('enter', function(ch, key) {
    var msg = this.getValue().slice(0, -1)

    if (msg.length > 0) {
      if (msg.split('')[0] === '/') {
        io.emit('sendCommand', {cmd: msg.split(' ')})
      } else {
        log.pushLine(`${colors.self}${USERNAME}{/} ${colors.default}${msg}`)
        log.setScrollPerc(100)
        io.emit('sendMessage', {msg: msg})
      }
    }

    this.clearValue();
  });

  input.key(['escape', 'C-c'], function(ch, key) {
    process.exit(0)
  });



  return elements
}
