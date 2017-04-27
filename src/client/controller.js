var config = require('./config')
var io = require("socket.io-client")(config.host);
var ioreq = require("socket.io-request");
var uuid = require('uuid')

var stage = 'login'

function initiateLogin(screen, el) {
  var username = el.children[0]
  var password = el.children[1]
  var credentials = {username:undefined, password:undefined}

  username.focus()
  username.key(['enter'], function() {
    credentials.username = this.getValue().slice(0, -1)
    // credentials.username = 'what the hell'
    password.focus()
  })

  password.key(['enter'], function() {
    credentials.password = this.getValue()//.slice(0, -1)
    screen.debug(credentials)
  })

}

module.exports = (el)=> {

  var sessionId = uuid()
  var {screen, login, input, log} = el


  var stage = 'login'
  screen.append(screen, login)
  screen.debug(initiateLogin(login))



  // SCREEN

  screen.key(['q', 'C-c', 'escape'], function(ch, key) {
      process.exit(0);
  });

  screen.key('enter', function() {
    switch (stage) {
      case 'active':
        input.focus()
        break;
    }
  });

  screen.key('m', function() {
    this.log(log.content)
  });



  // LOGIN



  // INPUT

  input.key('enter', function(ch, key) {
    var msg = this.getValue().slice(0, -1)

    if (msg.length > 0) {
      ioreq(io).request(
        'speech',
        {sessionId: sessionId, msg: msg}

      ).then((res)=> {
        log.log(`${res.user}: ${res.msg}`)
      })

      this.clearValue();
    }
    screen.render();
  });

  input.key('escape', function(ch, key) {
    var message = this.getValue();
    screen.focusPop()
    screen.render();
  });



  return el
}
