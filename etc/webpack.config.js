/* eslint-disable */
const path = require('path');

module.exports = {
  stats: { assets: false, modules: false },
  mode: 'production',
  entry: './src/index.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: 'index.bundle.js',
    path: path.resolve(__dirname, '..', 'dist'),
    library: 'waPC',
  },
};
