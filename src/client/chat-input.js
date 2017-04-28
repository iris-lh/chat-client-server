var blessed = require('blessed');
var colors = require('./colors')

module.exports = ()=> {
  var element = blessed.textarea({
    bottom: 0,
    height: 3,
    border: {type: "line", fg: colors.uiPrimary},
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

  return element
}
