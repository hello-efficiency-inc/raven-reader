/**
 * Packages the application into executable .app and .exe files.
 * For more info, see https://github.com/electron-userland/electron-packager.
 */
var argv = require('minimist')(process.argv.slice(2))
var packager = require('electron-packager')
var appManifest = require('../app/package.json')
var devManifest = require('../package.json')
var config = require('../config')

function getElectronVersion () {
  var v = config.release.electronVersion ||
    (devManifest.devDependencies || {})['electron-prebuilt'] ||
    (devManifest.dependencies || {})['electron-prebuilt']

  if (v) {
    return v.replace(/^\D+/, '')
  } else {
    console.log(
      'No electron version was found in config.js or package.json.'
    )
  }
}

var packagerConfig = {
  dir: config.build.outputRoot,
  out: config.build.releasesRoot,
  name: appManifest.productName,
  'app-version': appManifest.version,
  version: getElectronVersion(),
  platform: argv.platform || config.release.platform,
  arch: argv.arch || 'all',
  prune: true,
  overwrite: true,
  ignore: Object.keys((appManifest.devDependencies || {})).map(function (name) {
    return '/node_modules/' + name + '($|/)'
  })
}

packager(packagerConfig, function (err, appPath) {
  if (err) {
    console.error(err)
    process.exit(1)
  }

  console.log('packaged to ' + appPath)
})
