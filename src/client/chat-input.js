var blessed = require('blessed');

module.exports = ()=> {
  var element = blessed.textarea({
    bottom: 0,
    height: 1,
    inputOnFocus: true,
    padding: {
      top: 0,
      left: 0
    },
    style: {
      fg: '#555',
      bg: '#111',

      focus: {
        fg: 'white',
        bg: '#222'
      }
    }
  });

  return element
}
