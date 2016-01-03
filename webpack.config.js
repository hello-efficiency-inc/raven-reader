
var path = require('path')
var webpack = require('webpack')

module.exports = {
  target: 'atom',
  entry: {
    app: './app/app.js',
  },
  output: {
    path: './build',
    filename: '[name].js',
  },
  plugins: [
    new webpack.IgnorePlugin(/vertx/),
  ],
  node: {
    console: true,
    fs: 'empty',
    net: 'empty',
    tls: 'empty'
  },
  module: {
    loaders: [
      {
        test: /\.json/,
        loader: "json-loader"
      },
      {
        test: /\.vue/,
        loader: 'vue'
      },
      {
        test: /\.js/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel'
      },
    ]
  }
}
