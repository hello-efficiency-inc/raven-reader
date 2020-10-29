'use strict'
import 'v8-compile-cache'
import { app, protocol, BrowserWindow, globalShortcut, nativeTheme, ipcMain, dialog } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
import { enforceMacOSAppLocation } from 'electron-util'
import { touchBar } from './touchbar'
import createMenu from './menu'
import createTray from './tray'
import Store from 'electron-store'
import log from 'electron-log'
import contextMenu from 'electron-context-menu'
import { autoUpdater } from 'electron-updater'
import path from 'path'
const isDevelopment = process.env.NODE_ENV !== 'production'

autoUpdater.logger = log
autoUpdater.logger.transports.file.level = 'info'

contextMenu({
  showInspectElement: false
})

const store = new Store()

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win
let tray
let menu
let winUrl

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])

function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({
    minWidth: 1400,
    minHeight: 768,
    width: 1400,
    height: 768,
    title: 'Raven Reader',
    maximizable: true,
    webPreferences: {
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      webviewTag: true,
      webSecurity: false,
      enableRemoteModule: true,
      allowRunningInsecureContent: isDevelopment,
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      preload: path.join(__dirname, 'preload.js')
    }
  })

  win.setTouchBar(touchBar)
  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    winUrl = process.env.WEBPACK_DEV_SERVER_URL
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    winUrl = 'app://./index.html'
    autoUpdater.checkForUpdatesAndNotify()
  }

  // Load the index.html when not in development
  win.loadURL(winUrl)

  win.on('closed', () => {
    win = null
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

  win.webContents.session.setProxy({
    proxyRules: proxyRules,
    proxyBypassRules: proxy && proxy.bypass ? proxy.bypass : '<local>'
  }, () => {
    if (win) {
      win.loadURL(winUrl)
    }
  })

  win.on('closed', () => {
    win = null
  })

  win.on('close', (event) => {
    if (app.isQuiting) {
      win = null
    } else {
      event.preventDefault()
      win.hide()
      if (process.platform === 'darwin') {
        app.dock.hide()
      }
      return false
    }
  })
  menu = createMenu(win)
  tray = createTray(win)

  if (process.platform !== 'darwin') {
    globalShortcut.register('Alt+M', () => {
      const visible = win.isMenuBarVisible()
      win.setMenuBarVisibility(visible)
    })
  }
}

app.requestSingleInstanceLock()
app.on('second-instance', (event, argv, cmd) => {
  app.quit()
})

app.commandLine.appendSwitch('disable-features', 'OutOfBlinkCors')

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

nativeTheme.on('updated', () => {
  store.set('isDarkMode', nativeTheme.shouldUseDarkColors)
  win.webContents.send('Dark mode', {
    darkmode: nativeTheme.shouldUseDarkColors
  })
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
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
})

app.on('web-contents-created', (event, contents) => {
  contents.on('will-navigate', (event, navigationUrl) => {
    event.preventDefault()
  })
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS_DEVTOOLS)
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
    }
  }
  createWindow()
})

app.whenReady().then(() => {
  enforceMacOSAppLocation()
  store.set('isDarkMode', nativeTheme.shouldUseDarkColors)
  if (!store.has('settings.theme_option')) {
    store.set('settings.theme_option', 'system')
  }
})

app.on('before-quit', () => {
  app.isQuiting = true
  globalShortcut.unregisterAll()
  tray.destroy()
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}

autoUpdater.on('checking-for-update', () => {
  log.info('Checking for update...')
})
autoUpdater.on('update-not-available', (info) => {
  log.info('Update not available.')
})

autoUpdater.on('error', (error) => {
  log.info(error == null ? 'unknown' : (error.stack || error).toString())
})

autoUpdater.on('update-downloaded', (info) => {
  log.info('Update downloaded')
  dialog.showMessageBox({
    title: 'Install Updates',
    message: 'Updates downloaded, application will be quit for update...'
  }, () => {
    setImmediate(() => autoUpdater.quitAndInstall())
  })
})

autoUpdater.on('download-progress', (progressObj) => {
  let logMessage = 'Download speed: ' + progressObj.bytesPerSecond
  logMessage = logMessage + ' - Downloaded ' + progressObj.percent + '%'
  logMessage = logMessage + ' (' + progressObj.transferred + '/' + progressObj.total + ')'
  log.info(logMessage)
})
