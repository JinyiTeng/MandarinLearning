const webpack = require('webpack');

module.exports = {
  resolve: {
    fallback: {
      https: require.resolve('https-browserify'),
      http: require.resolve('stream-http'),
      crypto: require.resolve('crypto-browserify'),
      os: require.resolve('os-browserify/browser'),
      stream: require.resolve('stream-browserify'),
      url: require.resolve('url/'),
      assert: require.resolve('assert/'),
      buffer: require.resolve('buffer/'),
      process: require.resolve('process/'),
    },
  },
  plugins: [
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      process: ['process'],
    }),
  ],
};
