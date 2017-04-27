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

  log.log(`Connecting to ${config.host}...`)

  ioreq(io).request(
    'login',
    {username: config.username, password: config.password}
  ).then((res)=> {
    res ? log.log('{green-fg}Connected!{/}')
        : log.log('{red-fg}Failed to connect.{/}')
    log.log('')
  })


  screen.append(log)
  screen.append(input)
  input.focus()



  io.on('broadcastMessage', (data)=> {
    screen.debug('received message')
    log.log(`{cyan-fg}${data.user} {white-fg}${data.msg}{/}`)
  })

  // LOGIN



  // INPUT

  input.key('enter', function(ch, key) {
    var msg = this.getValue().slice(0, -1)

    if (msg.length > 0) {
      ioreq(io).request('sendMessage', {msg: msg})
      // .then((res)=> {
      //   log.log(`{cyan-fg}${res.user} {white-fg}${res.msg}{/}`)
      // })
      io.emit('sendMessage', {msg: msg})
    }

    this.clearValue();
    screen.render();
  });

  input.key(['escape', 'C-c'], function(ch, key) {
    process.exit(0)
  });



  return elements
}
