const path = require('path');

module.exports = {
  entry: './dist/client/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'public'),
  },
};
