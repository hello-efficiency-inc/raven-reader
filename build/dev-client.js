/* global __resourceQuery */

// We need to explicity set the client's path to http://localhost:PORT
// for it to work with Electron. In order to read the port from config.js,
// we need to supply it as a compile-time constant through resourceQuery.
var hotClient = require('webpack-hot-middleware/client' + __resourceQuery)
// var hotClient = require('webpack-hot-middleware/client')

hotClient.subscribe(function (event) {
  if (event.action === 'reload') {
    window.location.reload()
  }
})
