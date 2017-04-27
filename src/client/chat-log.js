var blessed = require('blessed');
var contrib = require('blessed-contrib')

// module.exports = ()=> {
//   var log = contrib.log({
//     top: 0,
//     bufferLength: 100,
//     bottom: 2,
//     width: '100%',
//     border: {type: "line", fg: "cyan"},
//     tags: true,
//     wrap: true,
//     padding: {
//       left: 1,
//       right: 1
//     },
//     style: {
//       fg: 'white',
//     }
//   })
//
//   return log
// }

module.exports = ()=> {
  var log = blessed.text({
    top: 0,
    // bufferLength: 100,
    bottom: 2,
    width: '100%',
    border: {type: "line", fg: "cyan"},
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
