var path = require('path')
var webpack = require('webpack')
var merge = require('webpack-merge')
var ExtractTextPlugin = require('extract-text-webpack-plugin')
var HtmlWebpackPlugin = require('html-webpack-plugin')
var CopyWebpackPlugin = require('copy-webpack-plugin')
var config = require('../config')
var baseWebpackConfig = require('./webpack.base.conf')
var cssLoaders = require('./css-loaders')

module.exports = merge(baseWebpackConfig, {
  entry: {
    app: './app/main.js',
    background: './app/background.js'
  },
  devtool: config.build.productionSourceMap ? '#source-map' : false,
  output: {
    filename: '[name].js',
    chunkFilename: '[id].js'
  },
  vue: {
    loaders: cssLoaders({
      sourceMap: config.build.productionSourceMap,
      extract: true
    })
  },
  plugins: [
    new CopyWebpackPlugin([
      { from: './app/package.json', to: '.' },
      { from: './static', to: 'static' }
    ]),
    // http://vuejs.github.io/vue-loader/workflow/production.html
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }),
    new webpack.NormalModuleReplacementPlugin(/^\.\/package$/, function(result) {
        if(/cheerio/.test(result.context)) {
            result.request = "./package.json"
        }
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    }),
    new webpack.optimize.OccurenceOrderPlugin(),
    // extract css into its own file
    new ExtractTextPlugin(path.join(config.build.assetsSubDirectory, '[name].css')),
    // generate dist index.html with correct asset hash for caching.
    // you can customize output by editing /index.html
    // see https://github.com/ampedandwired/html-webpack-plugin
    new HtmlWebpackPlugin({
      filename: 'main.html',
      template: './app/main.html',
      excludeChunks: ['background'],
      inject: true,
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: true
        // more options:
        // https://github.com/kangax/html-minifier#options-quick-reference
      }
    })
  ]
})
