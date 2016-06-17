/**
 * General configuration for build and release scripts.
 *
 * This file as adapted from http://vuejs-templates.github.io/webpack.
 * Some options were removed or changed to simplify things and/or
 * make them more applicable to Electron apps.
 */
var path = require('path')

module.exports = {
  build: {
    // The directory which will contained packaged releases and installers
    // for various operation systems.
    releasesRoot: path.resolve(__dirname, 'releases'),

    // The target directory for your app's compiled assets. Must be an absolute path.
    // This is the directory which will contain a runnable electron app.
    outputRoot: path.resolve(__dirname, 'dist'),

    // Nest webpack-generated assets under this directory in `assetsRoot`.
    // This applies to all non-JavaScript assets processed by webpack.
    assetsSubDirectory: 'assets',

    // Whether to generate source maps for production builds.
    productionSourceMap: true
  },
  release: {
    // The Electron version to use for packaged releases. If blank, it defaults
    // to the version of electron-prebuilt in your development package.json.
    //
    // electronVersion: '0.37.2',

    // The target platforms for packaged releases. For options, see
    // https://github.com/electron-userland/electron-packager
    platform: 'all'
  },
  dev: {
    // Dev server port.
    port: 8080,

    // Proxy requests to different backend during development.
    // https://github.com/chimurai/http-proxy-middleware
    proxyTable: {
      // '/api': {
      //   target: 'http://jsonplaceholder.typicode.com',
      //   changeOrigin: true,
      //   pathRewrite: {
      //     '^/api': ''
      //   }
      // }
    },

    // Whether or not open another Electron window with vue-devtools.
    vueDevTools: true
  }
}
