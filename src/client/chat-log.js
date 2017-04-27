var blessed = require('blessed');
var contrib = require('blessed-contrib')

module.exports = ()=> {
  var log = contrib.log({
    top: 0,
    bottom: 2,
    width: '100%',
    border: {type: "line", fg: "cyan"},
    padding: {
      left: 1,
      right: 1
    },
    style: {
      fg: 'white',
      // bg: '#000',
    }
  })
   // log.log("new log line")

  return log
}

// module.exports = ()=> {
//   var element = blessed.text({
//     top: 0,
//     bottom: 2,
//     width: '100%',
//     padding: {
//       left: 1
//     },
//     style: {
//       fg: 'white',
//       bg: '#111',

//       focus: {
//         fg: 'white',
//         bg: '#111'
//       }
//     }
//   });

//   return element
// }
