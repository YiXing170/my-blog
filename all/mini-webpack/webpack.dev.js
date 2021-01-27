const path = require('path')
// const myBabelLoder = require('./myLoader')

module.exports = {
  mode: 'development',
  entry: {
    'test': path.join(__dirname, '/test.js')
  },
  output: {
    filename: 'bundle.js',
    path: path.join(__dirname, '/dist')
  },
  module: {
    rules: [{
      test: /\.js$/,
      use: 'babel-loader'
    }]
  },
  resolveLoader: {
    alias: {
      "babel-loader": './myLoader'
    }
  },
}