var path = require('path')
var webpack = require('webpack')
var config = require('../config')
var cssLoaders = require('./css-loaders')
var projectRoot = path.resolve(__dirname, '../')

module.exports = {
  // Note: entry points are added by environment-specific configs.

  output: {
    path: config.build.outputRoot,
    filename: '[name].js'
  },
  // Use target 'node' so that __dirname works properly. We then need
  // to manually specify the electron modules in the ExternalsPlugin
  // since we're not using target 'electron'.
  target: 'node',
  node: {
    __filename: false,
    __dirname: false
  },
  resolve: {
    extensions: ['', '.js', '.vue'],
    fallback: [path.join(__dirname, '../node_modules')],
    alias: {
      app: path.resolve(__dirname, '../app')
    }
  },
  resolveLoader: {
    fallback: [path.join(__dirname, '../node_modules')]
  },
  module: {
    noParse: /node_modules\/json-schema\/lib\/validate\.js/,
    preLoaders: [
      {
        test: /\.vue$/,
        loader: 'eslint',
        include: projectRoot,
        exclude: /node_modules/
      },
      {
        test: /\.js$/,
        loader: 'eslint',
        include: projectRoot,
        exclude: /vue-devtools|node_modules/
      }
    ],
    plugins: [
      new webpack.IgnorePlugin(/vertx/),
      new webpack.NormalModuleReplacementPlugin(/^\.\/package$/, function(result) {
          if(/cheerio/.test(result.context)) {
              result.request = "./package.json"
          }
      })
    ],
    node: {
      console: true,
      fs: 'empty',
      net: 'empty',
      tls: 'empty'
    },
    loaders: [
      {
        test: /\.vue$/,
        loader: 'vue'
      },
      {
        test: /\.js$/,
        loader: 'babel',
        include: projectRoot,
        exclude: /vue-devtools|node_modules/
      },
      {
        test: /\.json$/,
        loader: 'json'
      },
      {
        test: /\.html$/,
        loader: 'vue-html'
      },
      {
        test: /\.(png|jpe?g|gif|svg|woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url',
        query: {
          limit: 10000,
          name: path.join(config.build.assetsSubDirectory, '[name].[ext]')
        }
      }
    ]
  },
  plugins: [
    new webpack.ExternalsPlugin('commonjs2', [
      'desktop-capturer',
      'electron',
      'ipc',
      'ipc-renderer',
      'native-image',
      'remote',
      'web-frame',
      'clipboard',
      'crash-reporter',
      'screen',
      'shell'
    ])
  ],
  vue: {
    loaders: cssLoaders()
  }
  // eslint: {
  //   formatter: require('eslint-friendly-formatter')
  // }
}
