var webpack = require('webpack')
var merge = require('webpack-merge')
var CopyWebpackPlugin = require('copy-webpack-plugin')
var webpackBaseConfig = require('./webpack.base.conf')
var config = require('../config')

// var cssLoaders = require('./css-loaders')
// var HtmlWebpackPlugin = require('html-webpack-plugin')

// add hot-reload related code to entry chunks
// Object.keys(webpackBaseConfig.entry).forEach(function (name) {
//   webpackBaseConfig.entry[name] = ['./build/dev-client'].concat(webpackBaseConfig.entry[name])
// })

module.exports = merge(webpackBaseConfig, {
  entry: {
    background: './app/background.js'
  },
  // eval-source-map is faster for development
  devtool: '#eval-source-map',
  output: {
    // necessary for the html plugin to work properly
    // when serving the html from in-memory
    publicPath: '/'
  },
  plugins: [
    // Copy files from app to dist
    new CopyWebpackPlugin([
      { from: './app/package.json', to: '.'}
    ]),

    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"development"',
        HOT: JSON.stringify(process.env.HOT),
        PORT: JSON.stringify(process.env.PORT || config.dev.port)
      }
    }),

    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.NoErrorsPlugin()
  ],
  stats: {
    colors: true
  }
})
