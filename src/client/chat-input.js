var blessed = require('blessed');

module.exports = ()=> {
  var element = blessed.textarea({
    bottom: 0,
    height: 3,
    border: {type: "line", fg: "cyan"},
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
