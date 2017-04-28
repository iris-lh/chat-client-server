var blessed = require('blessed');
var colors = require('./colors')

module.exports = ()=> {
  var log = blessed.text({
    top: 0,
    bottom: 2,
    width: '100%',
    border: {type: "line", fg: colors.uiPrimary},
    tags: true,
    wrap: true,
    scrollable: true,
    padding: {
      left: 1,
      right: 1
    },
    style: {
      fg: 'white',
    }
  })

  return log
}
