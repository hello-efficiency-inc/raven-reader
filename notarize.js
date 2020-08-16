require('dotenv').config()
const electronNotarize = require('electron-notarize')

exports.default = async function notarizing (context) {
  const {
    electronPlatformName,
    appOutDir
  } = context
  if (electronPlatformName !== 'darwin') {
    return
  }

  const appName = context.packager.appInfo.productFilename

  const notarize = await electronNotarize.notarize({
    appBundleId: 'org.helloefficiency.ravenreader',
    appPath: `${appOutDir}/${appName}.app`,
    appleId: process.env.appleId,
    appleIdPassword: process.env.applePass
  })
  return notarize
}
