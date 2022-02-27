'use strict'

import { app, protocol, BrowserWindow, globalShortcut, nativeTheme, ipcMain, dialog, Notification, shell, powerMonitor, session } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
import {
  ElectronBlocker
} from '@cliqz/adblocker-electron'
import fetch from 'cross-fetch'
import { touchBar } from './main/touchbar'
import {
  createMenu,
  createFeedMenu,
  createCategoryMenu,
  createArticleItemMenu
} from './main/menu'
import axios from 'axios'
import os from 'os'
import Store from 'electron-store'
import log from 'electron-log'
import contextMenu from 'electron-context-menu'
import { autoUpdater } from 'electron-updater'
import fs from 'fs'
import path from 'path'
import { URL, URLSearchParams } from 'url'
import dayjs from 'dayjs'
import i18nextMainBackend from './i18nmain.config'
import {
  parseArticle
} from './main/article'
require('v8-compile-cache')
const FormData = require('form-data')
const i18nextBackend = require('i18next-electron-fs-backend')

const isDevelopment = process.env.NODE_ENV !== 'production'

autoUpdater.logger = log
autoUpdater.logger.transports.file.level = 'info'

contextMenu({
  showInspectElement: false
})

const store = new Store({
  encryptionKey: process.env.VUE_APP_ENCRYPT_KEY,
  clearInvalidConfig: true
})

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win
let menu
let winUrl
let consumerKey
let code

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])

async function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({
    minWidth: 1280,
    minHeight: 720,
    width: 1400,
    height: 768,
    title: 'Raven Reader',
    maximizable: true,
    webPreferences: {
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      webviewTag: true,
      contextIsolation: true,
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      preload: path.join(__dirname, 'preload.js'),
      disableBlinkFeatures: 'Auxclick'
    }
  })

  // Maximize window on startup when not in development
  if (!isDevelopment && win !== null) {
    win.maximize()
  }

  i18nextBackend.mainBindings(ipcMain, win, fs)

  ElectronBlocker.fromPrebuiltAdsAndTracking(fetch).then((blocker) => {
    blocker.enableBlockingInSession(session.defaultSession)
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

  if (process.platform !== 'darwin') {
    globalShortcut.register('Alt+M', () => {
      const visible = win.isMenuBarVisible()
      win.setMenuBarVisibility(visible)
    })
  }

  // Set up necessary bindings to update the menu items
  // based on the current language selected
  i18nextMainBackend.on('loaded', (loaded) => {
    i18nextMainBackend.changeLanguage(app.getLocale())
    i18nextMainBackend.off('loaded')
  })

  menu = createMenu(win, i18nextMainBackend)
  i18nextMainBackend.on('languageChanged', (lng) => {
    log.info('Language changed')
    menu = createMenu(win, i18nextMainBackend)
  })

  if (store.get('settings.start_in_trays')) { win.hide() }
}

function signInInoreader () {
  shell.openExternal(`https://www.inoreader.com/oauth2/auth?client_id=${process.env.VUE_APP_INOREADER_CLIENT_ID}&redirect_uri=ravenreader://inoreader/auth&response_type=code&scope=read%20write&state=ravenreader`)
}

function signInPocketWithPopUp () {
  if (os.platform() === 'darwin') {
    consumerKey = process.env.VUE_APP_POCKET_MAC_KEY
  }

  if (os.platform() === 'win32') {
    consumerKey = process.env.VUE_APP_POCKET_WINDOWS_KEY
  }

  if (os.platform() === 'linux') {
    consumerKey = process.env.VUE_APP_POCKET_LINUX_KEY
  }

  axios
    .post(
      'https://getpocket.com/v3/oauth/request', {
        consumer_key: consumerKey,
        redirect_uri: 'http://127.0.0.1'
      }, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          'X-Accept': 'application/json'
        }
      }
    )
    .then(data => {
      code = data.data.code
      shell.openExternal(`https://getpocket.com/auth/authorize?request_token=${code}&redirect_uri=ravenreader://pocket/auth`)
    })
}

function registerLocalResourceProtocol () {
  protocol.registerFileProtocol('local-resource', (request, callback) => {
    const url = request.url.replace(/^local-resource:\/\//, '')
    // Decode URL to prevent errors when loading filenames with UTF-8 chars or chars like "#"
    const decodedUrl = decodeURI(url) // Needed in case URL contains spaces
    try {
      return callback(decodedUrl)
    } catch (error) {
      console.error('ERROR: registerLocalResourceProtocol: Could not get file path:', error)
    }
  })
}

function handleInoreader (url) {
  if (url.includes('ravenreader://inoreader/auth')) {
    const q = new URL(url).searchParams
    if (q.has('code')) {
      axios.post('https://www.inoreader.com/oauth2/token', {
        code: q.get('code'),
        client_id: process.env.VUE_APP_INOREADER_CLIENT_ID,
        client_secret: process.env.VUE_APP_INOREADER_CLIENT_SECRET,
        redirect_uri: 'ravenreader://inoreader/auth',
        scope: null,
        grant_type: 'authorization_code'
      }).then((data) => {
        data.data.expires_in = dayjs().add(data.data.expires_in, 'second').valueOf()
        win.webContents.send('inoreader-authenticated', data.data)
      })
    }
  }
  if (url === 'ravenreader://pocket/auth') {
    axios
      .post(
        'https://getpocket.com/v3/oauth/authorize', {
          consumer_key: consumerKey,
          code: code
        }, {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            'X-Accept': 'application/json'
          }
        }
      )
      .then(data => {
        data.data.consumer_key = consumerKey
        win.webContents.send('pocket-authenticated', data.data)
      })
  }
}

app.setAsDefaultProtocolClient('ravenreader')

const primaryInstance = app.requestSingleInstanceLock()
if (!primaryInstance) {
  app.quit()
} else {
  app.on('second-instance', (event, argv, cmd) => {
    event.preventDefault()
    const url = argv[argv.length - 1]
    if (win) {
      if (win.isMinimized()) {
        win.restore()
      }
      win.focus()
    }
    if (process.platform !== 'darwin') {
      handleInoreader(url)
    }
  })
}

app.commandLine.appendSwitch('lang', app.getLocale())
app.commandLine.appendSwitch('disable-features', 'OutOfBlinkCors')

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  } else {
    i18nextBackend.clearMainBindings(ipcMain)
  }
})

app.on('open-url', (event, url) => {
  handleInoreader(url)
})

nativeTheme.on('updated', () => {
  store.set('isDarkMode', nativeTheme.shouldUseDarkColors)
  win.webContents.send('Dark mode', {
    darkmode: nativeTheme.shouldUseDarkColors
  })
})

ipcMain.handle('article-selected', (event, status) => {
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
  if (BrowserWindow.getAllWindows().length === 0) {
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
  // Modify the origin for all requests to the following urls.
  registerLocalResourceProtocol()
  createWindow()
})

app.whenReady().then(() => {
  store.set('isDarkMode', nativeTheme.shouldUseDarkColors)
  if (!store.has('settings.theme_option')) {
    store.set('settings.theme_option', 'system')
  }
})

app.on('before-quit', () => {
  app.isQuiting = true
  globalShortcut.unregisterAll()
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

ipcMain.handle('set-feedbin-last-fetched', (event, arg) => {
  if (arg) {
    store.set('feedbin_fetched_lastime', arg)
  }
})

ipcMain.on('get-inoreader-last', (event, arg) => {
  event.returnValue = store.get('inoreader_fetched_lastime')
})

ipcMain.on('get-feedbin-last', (event, arg) => {
  event.returnValue = store.get('feedbin_fetched_lastime')
})

ipcMain.on('sort-preference', (event, arg) => {
  event.returnValue = store.get('settings.oldestArticles', 'on')
})

ipcMain.on('get-settings', (event, arg) => {
  const state = {}
  state.cronSettings = store.get('settings.cronjob', '*/5 * * * *')
  state.themeOption = store.get('settings.theme_option', 'system')
  state.oldestArticles = store.get('settings.oldestArticles', false)
  state.disableImages = store.get('settings.imagePreference', false)
  state.fullArticleDefault = store.get('settings.fullArticlePreference', false)
  state.viewOriginalDefault = store.get('settings.viewOriginalPreference', false)
  state.recentlyReadPreference = store.get('settings.recentlyReadPreference', false)
  state.proxy = store.get('settings.proxy', {
    http: '',
    https: '',
    bypass: ''
  })
  state.keepRead = store.get('settings.keepread', 1)
  if (store.has('inoreader_creds')) {
    state.inoreader_connected = true
    state.inoreader = store.get('inoreader_creds')
  }
  if (store.has('inoreader_fetched_lasttime')) {
    state.inoreader_last_fetched = store.get('inoreader_fetched_lasttime')
  }
  if (store.has('pocket_creds')) {
    state.pocket_connected = true
    state.pocket = store.get('pocket_creds')
  }
  if (store.has('instapaper_creds')) {
    state.instapaper_connected = true
    state.instapaper = store.get('instapaper_creds')
  }
  if (store.has('fever_creds')) {
    state.fever_connected = true
    state.fever = store.get('fever_creds')
  }
  if (store.has('selfhost_creds')) {
    state.selfhost_connected = true
    state.selfhost = store.get('selfhost_creds')
  }
  if (store.has('feedbin_creds')) {
    state.feedbin_connected = true
    state.feedbin = store.get('feedbin_creds', JSON.stringify({
      endpoint: 'https://api.feedbin.com/v2/',
      email: null,
      password: null
    }))
  }
  event.returnValue = state
})

ipcMain.on('get-setting-item', (event, arg) => {
  event.returnValue = store.get(arg)
})

ipcMain.handle('set-settings-item', (event, arg) => {
  switch (arg.type) {
    case 'set':
      store.set(arg.key, arg.data)
      break
    case 'delete':
      store.delete(arg.key, arg.data)
      break
  }
})

ipcMain.on('get-locale', (event) => {
  event.returnValue = app.getLocale()
})

ipcMain.on('get-dark', (event) => {
  event.returnValue = store.get('isDarkMode')
})

ipcMain.on('proxy-settings-get', (event) => {
  event.returnValue = store.get('settings.proxy', null)
})

ipcMain.handle('export-opml', (event, arg) => {
  fs.unlink(
          `${app.getPath('downloads')}/subscriptions.opml`,
          err => {
            if (err && err.code !== 'ENOENT') throw err
            fs.writeFile(
              `${app.getPath(
              'downloads'
            )}/subscriptions.opml`,
              arg, {
                flag: 'w',
                encoding: 'utf8'
              },
              err => {
                if (err) throw err
                log.info('XML Saved')
                const notification = new Notification({
                  title: 'Raven Reader',
                  body: 'Exported all feeds successfully to downloads folder.'
                })
                notification.show()
              }
            )
          }
  )
})

ipcMain.on('login-pocket', (event) => {
  event.returnValue = signInPocketWithPopUp()
})

ipcMain.on('login-inoreader', (event) => {
  event.returnValue = signInInoreader()
})

ipcMain.handle('context-menu', (event, arg) => {
  if (arg.type === 'feed') {
    createFeedMenu(arg.data, win, i18nextMainBackend)
  }

  if (arg.type === 'category') {
    createCategoryMenu(arg.data, win, i18nextMainBackend)
  }

  if (arg.type === 'article') {
    createArticleItemMenu(arg.data, win, i18nextMainBackend)
  }
})

ipcMain.handle('parse-article', async (event, url) => {
  return await parseArticle(url)
})

ipcMain.handle('instapaper-login', async (event, data) => {
  const result = await axios.post('https://www.instapaper.com/api/authenticate', {}, {
    auth: data
  })
  return result.data
})

ipcMain.handle('instapaper-save', async (event, data) => {
  const result = await axios.post(`https://www.instapaper.com/api/add?url=${data.url}`, {}, {
    auth: {
      username: data.username,
      password: data.password
    }
  })
  return result.data
})

ipcMain.handle('save-pocket', async (event, data) => {
  const result = await axios.post('https://getpocket.com/v3/add', {
    url: data.url,
    access_token: data.credential.access_token,
    consumer_key: data.credential.consumer_key
  })
  return result.data
})

ipcMain.handle('fever-login', async (event, data) => {
  const formData = new FormData()
  formData.append('api_key', data.formData)
  const config = {
    url: `${data.endpoint}?api`,
    method: 'post',
    data: formData,
    headers: {
      ...formData.getHeaders()
    }
  }
  const result = await axios(config)
  return result.data
})

ipcMain.handle('fever-endpoint-execute', async (event, data) => {
  const formData = new FormData()
  formData.append('api_key', data.formData)
  const result = await axios.post(data.endpoint, formData, {
    headers: {
      ...formData.getHeaders()
    }
  })
  return result.data
})

ipcMain.handle('google-login', async (event, data) => {
  const params = new URLSearchParams(data.formData)
  const result = await axios.post(data.endpoint, params.toString())
  return result.data
})

ipcMain.handle('inoreader-endpoint-fetch', async (event, data) => {
  const result = await axios.get(data.endpoint, {
    headers: {
      Authorization: `Bearer ${data.access_token}`
    }
  })
  return result.data
})

ipcMain.handle('inoreader-endpoint-refresh', async (event, data) => {
  const result = axios.post(data.endpoint, data.formData)
  return result.data
})

ipcMain.handle('inoreader-endpoint-execute', async (event, data) => {
  const result = await axios.post(data.endpoint, data.formData, {
    headers: {
      Authorization: `Bearer ${data.access_token}`
    }
  })
  return result.data
})

ipcMain.handle('google-endpoint-fetch', async (event, data) => {
  const result = await axios.get(data.endpoint, {
    headers: {
      Authorization: `GoogleLogin auth=${data.formData.auth}`
    }
  })
  return result.data
})

ipcMain.handle('google-endpoint-execute', async (event, data) => {
  const result = await axios.post(data.endpoint, data.formData.data, {
    headers: {
      Authorization: `GoogleLogin auth=${data.formData.auth}`
    }
  })
  return result.data
})

ipcMain.handle('feedbin-login', async (event, data) => {
  const result = await axios.get(data.endpoint, {
    auth: {
      username: data.creds.email,
      password: data.creds.password
    }
  })
  return result.data
})

ipcMain.handle('feedbin-endpoint-fetch', async (event, data) => {
  const result = await axios.get(data.endpoint, {
    auth: {
      username: data.creds.email,
      password: data.creds.password
    }
  })
  return result.data
})

ipcMain.handle('feedbin-endpoint-execute', async (event, data) => {
  const result = await axios.post(data.endpoint, data.formData, {
    auth: {
      username: data.creds.email,
      password: data.creds.password
    }
  })
  return result.data
})

powerMonitor.on('resume', () => {
  win.webContents.send('power-resume')
})

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
