var blessed = require('blessed');

module.exports = ()=> {
  var element = blessed.text({
    top: 0,
    bottom: 2,
    width: '100%',
    padding: {
      left: 1
    },
    style: {
      fg: 'white',
      bg: '#111',

      focus: {
        fg: 'white',
        bg: '#111'
      }
    }
  });

  return element
}
