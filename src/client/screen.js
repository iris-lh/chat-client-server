var blessed = require('blessed')
var events = require('events')

module.exports = ()=> {
  var element = blessed.screen({
      title: 'space-mud',
      smartCSR: true,
      useBCE: true,
      cursor: {
          artificial: true,
          blink: true,
          shape: 'block'
      },
      log: `${__dirname}/application.log`,
      debug: true,
      dockBorders: true
  });

  return element
}
