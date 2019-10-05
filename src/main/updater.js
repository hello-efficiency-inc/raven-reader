import axios from 'axios'
import Store from 'electron-store'
import {
  TEST_LICENSE_KEY,
  API_DOMAIN
} from '../renderer/config'

const { dialog } = require('electron')
const { autoUpdater } = require('electron-updater')
const log = require('electron-log')
const store = new Store()

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
  log.info('Current version is up-to-date.')
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

export const autoUpdateApp = () => {
  const licenseKey = store.get('license_key')
  axios.get(`${API_DOMAIN}/license/verify?license_key=${licenseKey}`).then((res) => {
    const expired = res.data.data.expired
    if (!expired) {
      autoUpdater.checkForUpdates()
    } else {
      dialog.showMessageBox({
        title: 'No updates',
        message: 'Your license key is expired. Please renew license key by repurchasing it from https://ravenreader.app'
      })
    }
  }).catch((err) => {
    if (err) {
      log.error(err)
      log.info('No license found in database')
    }
  })
}

// export this to MenuItem click callback
export const checkForUpdates = (menuItem, focusedWindow, event) => {
  updater = menuItem
  updater.enabled = false
  const licenseKey = store.get('license_key')
  if (licenseKey !== TEST_LICENSE_KEY) {
    axios.get(`${API_DOMAIN}/license/verify?license_key=${licenseKey}`).then((res) => {
      const expired = res.data.data.expired
      if (!expired) {
        autoUpdater.checkForUpdates()
        log.info('Checking for updates')
      } else {
        log.info('License expired')
        dialog.showMessageBox({
          title: 'No updates',
          message: 'Your license key is expired. Please renew license key by repurchasing it from https://ravenreader.app.'
        })
      }
    }).catch((err) => {
      if (err) {
        log.error(err)
        dialog.showMessageBox({
          title: 'No updates',
          message: 'License key not found in our database.'
        })
        updater.enabled = true
      }
    })
  } else {
    autoUpdater.checkForUpdates()
  }
}
