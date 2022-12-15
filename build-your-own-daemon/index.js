const { spawn } = require('child_process')


spawn('node', ['test.js'], {
  detached: true
})


process.exit(0)