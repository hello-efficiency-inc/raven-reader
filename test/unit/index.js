// Add this to make Electron code run properly. To be perfectly
// honest, I'm not sure why this is necessary.
window.process = window.parent.process
window.require = window.parent.require

// require all test files (files that ends with .spec.js)
var testsContext = require.context('./specs', true, /\.spec$/)
testsContext.keys().forEach(testsContext)

// require all src files except main.js for coverage.
// you can also change this to match only the subset of files that
// you want coverage for.
var srcContext = require.context('../../app', true, /^\.\/(?!(background|main)(\.js)?$)/)
srcContext.keys().forEach(srcContext)
