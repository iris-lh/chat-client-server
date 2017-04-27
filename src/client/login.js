var blessed = require('blessed');

module.exports = ()=> {
  var login = blessed.box({
    bottom: 1,
    height: 2,
    left: 1

  })

  var usernameLabel = blessed.box({
    bottom: 1,
    height: 1,
    width: 10,
    content: 'USERNAME: ',
    padding: {
      top: 0,
      left: 0
    },
    style: {
      fg: 'white',
    }
  });

  var usernameInput = blessed.textbox({
    bottom: 1,
    left: 10,
    height: 1,
    inputOnFocus: true,
    padding: {
      top: 0,
      left: 0
    },
    style: {
      fg: '#555',

      focus: {
        fg: 'white',
      }
    }
  });

  var passwordLabel = blessed.box({
    bottom: 0,
    height: 1,
    width: 10,
    content: 'PASSWORD: ',
    padding: {
      top: 0,
      left: 0
    },
    style: {
      fg: 'white',
    }
  });

  var password = blessed.textbox({
    bottom: 0,
    height: 1,
    left: 10,
    inputOnFocus: true,
    censor: true,
    padding: {
      top: 0,
      left: 0
    },
    style: {
      fg: '#555',

      focus: {
        fg: 'white',
      }
    }
  });

  login.append(usernameInput)
  login.append(password)
  login.append(usernameLabel)
  login.append(passwordLabel)

  return login
}
