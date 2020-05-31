'use strict'

import {
  app,
  BrowserWindow,
  ipcMain,
  globalShortcut,
  systemPreferences
} from 'electron'
import jetpack from 'fs-jetpack'
import Store from 'electron-store'
import {
  autoUpdateApp
} from './updater.js'
import {
  enforceMacOSAppLocation,
  darkMode
} from 'electron-util'
import {
  touchBar
} from './touchbar.js'
import createMenu from './menu'
import createTray from './tray'

const log = require('electron-log')
const contextMenu = require('electron-context-menu')
const {
  autoUpdater
} = require('electron-updater')

autoUpdater.logger = log
autoUpdater.logger.transports.file.level = 'info'

contextMenu({
  showInspectElement: false
})

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
let tray
let menu
const store = new Store()

function createWindow () {
  /**
   * If there is already data in old directory. Moved it to new
   */
  const oldDirectory = jetpack.cwd(app.getPath('userData'))
  const newDirectory = jetpack.cwd(app.getPath('home'))
  const existsArticle = jetpack.exists(oldDirectory.path('articles.db'))
  const existsFeed = jetpack.exists(oldDirectory.path('feeds.db'))
  const winURL = process.env.NODE_ENV === 'development' ? 'http://127.0.0.1:9080' : `file://${__dirname}/index.html`

  if (existsArticle && existsFeed) {
    jetpack.move(oldDirectory.path('feeds.db'), newDirectory.path('.rss-reader/feeds.db'))
    jetpack.move(oldDirectory.path('articles.db'), newDirectory.path('.rss-reader/articles.db'))
  }
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    webPreferences: {
      webviewTag: true,
      nodeIntegration: true,
      nodeIntegrationInWorker: true,
      webSecurity: false
    },
    maximizable: true,
    title: 'Raven Reader',
    minHeight: 768,
    minWidth: 1204,
    width: 1204,
    height: 768
  })

  mainWindow.setTouchBar(touchBar)

  if (mainWindow) {
    mainWindow.loadURL(winURL)
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  const proxy = store.get('settings.proxy') ? store.get('settings.proxy') : null
  let proxyRules = 'direct://'
  if (proxy) {
    if (proxy.http !== null && proxy.https === null) {
      proxyRules = `http=${proxy.http},${proxyRules}`
    }
    if (proxy.http !== null && proxy.https !== null) {
      proxyRules = `http=${proxy.http};https=${proxy.https},${proxyRules}`
    }
  }

  mainWindow.webContents.session.setProxy({
    proxyRules: proxyRules,
    proxyBypassRules: proxy && proxy.bypass ? proxy.bypass : '<local>'
  }, () => {
    if (mainWindow) {
      mainWindow.loadURL(winURL)
    }
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  mainWindow.on('close', (event) => {
    if (app.isQuiting) {
      mainWindow = null
    } else {
      event.preventDefault()
      mainWindow.hide()
      if (process.platform === 'darwin') {
        app.dock.hide()
      }
      return false
    }
  })

  menu = createMenu(mainWindow)
  tray = createTray(mainWindow)

  if (process.platform !== 'darwin') {
    globalShortcut.register('Alt+M', () => {
      const visible = mainWindow.isMenuBarVisible()
      mainWindow.setMenuBarVisibility(visible)
    })
  }
}

app.requestSingleInstanceLock()
app.on('second-instance', (event, argv, cwd) => {
  app.quit()
})

app.on('ready', () => {
  createWindow()
  autoUpdater.checkForUpdatesAndNotify()
})

app.whenReady().then(() => {
  enforceMacOSAppLocation()
  if (process.env.NODE_ENV === 'production') {
    autoUpdateApp()
  }
})

app.on('before-quit', () => {
  app.isQuiting = true
  globalShortcut.unregisterAll()
  tray.destroy()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

if (darkMode.isEnabled) {
  if (mainWindow) {
    mainWindow.webContents.send('Dark mode', {
      darkmode: systemPreferences.isDarkMode()
    })
  }
}

darkMode.onChange(() => {
  if (mainWindow) {
    mainWindow.webContents.send('Dark mode', {
      darkmode: darkMode.isEnabled
    })
  }
})

ipcMain.on('article-selected', (event, status) => {
  const menuItemViewBrowser = menu.getMenuItemById('view-browser')
  const menuItemToggleFavourite = menu.getMenuItemById('toggle-favourite')
  const menuItemSaveOffline = menu.getMenuItemById('save-offline')
  const menuItemToggleRead = menu.getMenuItemById('toggle-read')

  menuItemViewBrowser.enabled = true
  menuItemToggleFavourite.enabled = true
  menuItemSaveOffline.enabled = true
  menuItemToggleRead.enabled = true
})

ipcMain.on('online-status-changed', (event, status) => {
  event.sender.send('onlinestatus', status)
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

autoUpdater.on('checking-for-update', () => {
  log.info('Checking for update...')
})
autoUpdater.on('update-available', (info) => {
  log.info('Update available.')
})
autoUpdater.on('update-not-available', (info) => {
  log.info('Update not available.')
})
autoUpdater.on('error', (err) => {
  log.info('Error in auto-updater. ' + err)
})

autoUpdater.on('update-downloaded', (info) => {
  log.info('Update downloaded')
  autoUpdater.quitAndInstall()
})

autoUpdater.on('download-progress', (progressObj) => {
  let logMessage = 'Download speed: ' + progressObj.bytesPerSecond
  logMessage = logMessage + ' - Downloaded ' + progressObj.percent + '%'
  logMessage = logMessage + ' (' + progressObj.transferred + '/' + progressObj.total + ')'
  log.info(logMessage)
})
