var blessed    = require('blessed');
var Screen     = require('./screen')
var Login      = require('./login')
var ChatInput  = require('./chat-input')
var ChatLog    = require('./chat-log')
var Controller = require('./controller.js')

var el = Controller({
  screen: Screen(),
  login:  Login(),
  log:    ChatLog(),
  input:  ChatInput()
})

el.screen.render();
