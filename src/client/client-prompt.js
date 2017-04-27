var colors = require("colors/safe")
var ioreq = require("socket.io-request");
var config = require('./config')
var io = require("socket.io-client")(config.host);
var prompt = require('prompt')
var uuid = require('uuid')

var sessionId = uuid()

function main() {
  prompt.delimiter = ''
  prompt.get(['>'], (err, input)=> {
    var input = input['>']
    if (input === 'quit' || input === 'exit') {
      ioreq(io).request('logout', sessionId)
      console.log(colors.cyan('\nGoodbye!\n'))
      process.exit()
    }

    ioreq(io).request('speech', {sessionId: sessionId, msg: input})

    .then((response)=>{
      console.log(colors.gray(response.user + ' ') + response.msg)
      main()
    })
  })
}

function login() {
  var schema = {
     properties: {
       Username: {
         required: true
       },
       Password: {
         hidden: true,
         required: true
       }
     }
   };

  console.log('\nLogin')
  prompt.get(schema, (err, input)=> {

    ioreq(io).request(
      'login',
      {
        username: input.Username,
        password: input.Password,
        sessionId: sessionId
      })

    .then((response)=> {
    if (response) {
      console.log(colors.cyan('\nWelcome!\n'))
      main()
    } else {
      console.log(colors.red('\nIncorrect username/password.'))
      login()
    }})

  })
}

prompt.start()
prompt.message = ''
login()
