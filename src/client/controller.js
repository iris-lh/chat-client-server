var config = require('./config')
var credentials = require('./credentials')
var io = require("socket.io-client")(config.host);
var ioreq = require("socket.io-request");
var uuid = require('uuid')

var version = '0.1.3'


module.exports = (elements)=> {
  var {screen, login, input, log} = elements
  var heartbeatIntervalId
  var reconnectIntervalId

  screen.append(log)
  screen.append(input)
  input.focus()



  log.pushLine(`{gray-fg}CLIENT {white-fg}Connecting to ${config.host}...`)

  io.on('connect', ()=> {
    clearInterval(reconnectIntervalId)

    heartbeatIntervalId = setInterval(()=>{
      io.emit('clientHeartbeat')
    }, 10000)

    log.pushLine('{green-fg}{gray-fg}CLIENT {white-fg}Connected!{/}')

    ioreq(io).request(
      'login',
      {username: credentials.username, version: version}
    ).then((res)=> {
      res ? log.pushLine(`{gray-fg}CLIENT {white-fg}Logged in as {cyan-fg}${credentials.username}.{/}`)
      : log.pushLine('{gray-fg}CLIENT {red-fg}Failed to log in.{/}')
      log.pushLine('')
    })
  })


  io.on('disconnect', ()=> {
    log.pushLine('{gray-fg}CLIENT {white-fg}Disconnected.')
    log.setScrollPerc(100)
    clearInterval(heartbeatIntervalId)
    reconnectIntervalId = setInterval(()=>{
      log.pushLine('{gray-fg}CLIENT {white-fg}Attempting to reconnect...')
      log.setScrollPerc(100)
    }, 1500)
    io.emit('heartbeat')
  })



  io.on('serverHeartbeat', ()=> {
    // log.pushLine('heard heartbeat from server')
  })



  io.on('broadcastMessage', (msg)=> {
    if (msg.user !== credentials.username) {
      log.pushLine(`{#099-fg}${msg.user} {white-fg}${msg.msg}{/}`)
      log.setScrollPerc(100)
    }
  })

  io.on('systemMessage', (msg)=> {
    switch(msg.type) {
      case 'userDisconnected':
        log.pushLine(`{gray-fg}SERVER {#099-fg}${msg.user} {white-fg}disconnected.{/}`)
        break;
      case 'userConnected':
        log.pushLine(`{gray-fg}SERVER {#099-fg}${msg.user} {white-fg}connected.{/}`)
        break;
      case 'listUsers':
        log.pushLine(`{gray-fg}SERVER {white-fg}Other connected users: {#099-fg}${msg.users}{/}`)
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
        io.emit('sendCommand', {cmd: msg})
      } else {
        log.pushLine(`{cyan-fg}${credentials.username} {white-fg}${msg}{/}`)
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
