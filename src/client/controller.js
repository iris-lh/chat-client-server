var config = require('./config')
var io = require("socket.io-client")(config.host);
var ioreq = require("socket.io-request");
var uuid = require('uuid')



var stage = 'active'

function initiateLogin(screen, el) {
  var username = el.children[0]
  var password = el.children[1]
  var credentials = {username:undefined, password:undefined}

  username.focus()
  username.key(['enter'], function() {
    credentials.username = this.getValue().slice(0, -1)
    password.focus()
  })

  password.key(['enter'], function() {
    credentials.password = this.getValue()//.slice(0, -1)
    screen.debug(credentials)
  })

}



module.exports = (elements)=> {
  var {screen, login, input, log} = elements
  var heartbeatIntervalId
  var reconnectIntervalId

  log.log(`{gray-fg}CLIENT {white-fg}Connecting to ${config.host}...`)

  io.on('connect', ()=> {
    clearInterval(reconnectIntervalId)

    heartbeatIntervalId = setInterval(()=>{
      io.emit('clientHeartbeat')
    }, 10000)

    log.log('{green-fg}{gray-fg}CLIENT {white-fg}Connected!{/}')

    ioreq(io).request(
      'login',
      {username: credentials.username, version: version}
    ).then((res)=> {
      res ? log.log(`{gray-fg}CLIENT {green-fg}Logged in as ${credentials.username}.{/}`)
      : log.log('{gray-fg}CLIENT {red-fg}Failed to log in.{/}')
      log.log('')
    })
  })


  io.on('disconnect', ()=> {
    log.log('Disconnected.')
    clearInterval(heartbeatIntervalId)
    reconnectIntervalId = setInterval(()=>{
      log.log('{gray-fg}CLIENT {white-fg}Attempting to reconnect...')
    }, 1500)
    io.emit('heartbeat')
  })



  io.on('serverHeartbeat', ()=> {
    // log.log('heard heartbeat from server')
  })







  io.on('broadcastMessage', (msg)=> {
    var nameColor
    msg.user === credentials.username ? nameColor = '{cyan-fg}' : nameColor = '{#099-fg}'
    log.log(`${nameColor}${msg.user} {white-fg}${msg.msg}{/}`)
  })

  io.on('systemMessage', (msg)=> {
    switch(msg.type) {
      case 'userDisconnected':
        log.log(`{gray-fg}SERVER {#099-fg}${msg.user} {white-fg}disconnected.{/}`)
        break;
      case 'userConnected':
        log.log(`{gray-fg}SERVER {#099-fg}${msg.user} {white-fg}connected.{/}`)
      break;
    }
  })

  // LOGIN



  // INPUT

  input.key('enter', function(ch, key) {
    var msg = this.getValue().slice(0, -1)

    if (msg.length > 0) {
      if (msg.split('')[0] === '/') {
        io.emit('sendCommand', {cmd: msg})
      } else {
        io.emit('sendMessage', {msg: msg})
      }
    }

    this.clearValue();
    screen.render();
  });

  input.key(['escape', 'C-c'], function(ch, key) {
    process.exit(0)
  });



  return elements
}
