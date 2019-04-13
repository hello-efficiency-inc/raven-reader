const { dialog } = require('electron')
const { autoUpdater } = require('electron-updater')
const log = require('electron-log')

let updater
autoUpdater.autoDownload = false

autoUpdater.on('error', (error) => {
  dialog.showErrorBox('Error: ', error == null ? 'Oops something went wrong.' : (error.stack || error).toString())
})

autoUpdater.on('update-available', () => {
  dialog.showMessageBox({
    type: 'info',
    title: 'Found Updates',
    message: 'Found updates, do you want update now? ✅',
    buttons: ['Sure', 'No']
  }, (buttonIndex) => {
    if (buttonIndex === 0) {
      autoUpdater.downloadUpdate()
    } else {
      updater.enabled = true
      updater = null
    }
  })
})

autoUpdater.on('update-not-available', () => {
  if (typeof updater !== 'undefined') {
    dialog.showMessageBox({
      title: 'No Updates',
      message: 'Current version is up-to-date. 🎉'
    })
    updater.enabled = true
    updater = null
  }
  log.info('Current version is up-to-date. 🎉')
})

autoUpdater.on('update-downloaded', () => {
  dialog.showMessageBox({
    title: 'Install Updates',
    message: 'Updates downloaded, application will be quit for update...'
  }, () => {
    setImmediate(() => autoUpdater.quitAndInstall())
  })
})

// export this to MenuItem click callback
export const checkForUpdates = (menuItem, focusedWindow, event) => {
  updater = menuItem
  updater.enabled = false
  autoUpdater.checkForUpdates()
}
