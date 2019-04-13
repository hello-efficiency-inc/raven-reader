'use strict'

import { app, BrowserWindow, Menu, Tray, ipcMain } from 'electron'
// import updateElectron from 'update-electron-app'
import jetpack from 'fs-jetpack'
import os from 'os'
import Store from 'electron-store'
import { checkForUpdates } from './updater.js'

// updateElectron({
//   repo: 'mrgodhani/raven-reader',
//   updateInterval: '1 hour'
// })

/**
* Set `__static` path to static files in production
* https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
*/
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
let trayImage
let tray
var articleSelected = false
let menu
const winURL = process.env.NODE_ENV === 'development' ? `http://localhost:9080` : `file://${__dirname}/index.html`
const store = new Store()

function createMenu () {
  // Create the Application's main menu
  const template = [
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'pasteandmatchstyle' },
        { role: 'delete' },
        { role: 'selectall' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'togglefullscreen' }
      ]
    },
    {
      role: 'window',
      submenu: [
        { role: 'minimize' },
        { role: 'close' }
      ]
    },
    {
      label: 'Subscriptions',
      submenu: [
        {
          label: 'Add subscription',
          accelerator: 'CmdOrCtrl+N',
          click: function () {
            mainWindow.webContents.send('Add subscription')
          }
        }
      ]
    },
    {
      label: 'Item',
      submenu: [
        {
          label: 'Next item',
          accelerator: 'CmdOrCtrl+J',
          click: function () {
            mainWindow.webContents.send('Next item')
          }
        },
        {
          label: 'Previous item',
          accelerator: 'CmdOrCtrl+K',
          click: function () {
            mainWindow.webContents.send('Previous item')
          }
        },
        { type: 'separator' },
        {
          label: 'Toggle read',
          id: 'toggle-read',
          accelerator: 'CmdOrCtrl+T',
          enabled: articleSelected,
          click: function () {
            mainWindow.webContents.send('Toggle read')
          }
        },
        {
          label: 'Toggle favourite',
          id: 'toggle-favourite',
          accelerator: 'CmdOrCtrl+S',
          enabled: articleSelected,
          click: function () {
            mainWindow.webContents.send('Toggle favourite')
          }
        },
        {
          label: 'Mark all read',
          id: 'mark-all-read',
          accelerator: 'Alt+R',
          click: function () {
            mainWindow.webContents.send('Mark all read')
          }
        },
        { type: 'separator' },
        {
          label: 'Save offline',
          id: 'save-offline',
          accelerator: 'CmdOrCtrl+O',
          enabled: articleSelected,
          click: function () {
            mainWindow.webContents.send('Save offline')
          }
        },
        {
          label: 'View in browser',
          id: 'view-browser',
          accelerator: 'CmdOrCtrl+B',
          enabled: articleSelected,
          click: function () {
            mainWindow.webContents.send('View in browser')
          }
        }
      ]
    }
  ]

  const version = app.getVersion()

  if (process.platform === 'win32' || process.platform === 'linux') {
    template.unshift({
      label: 'Raven Reader',
      submenu: [
        {
          label: `Version ${version}`,
          enabled: false
        },
        {
          label: 'Check for update',
          click: function (menuItem, browserWindow, event) {
            checkForUpdates(menuItem, browserWindow, event)
          }
        },
        { role: 'hide' },
        { role: 'hideothers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    })
  }

  if (process.platform === 'darwin') {
    template.unshift({
      label: 'Raven Reader',
      submenu: [
        { role: 'about' },
        {
          label: `Version ${version}`,
          enabled: false
        },
        {
          label: 'Check for update',
          click: function (menuItem, browserWindow, event) {
            checkForUpdates(menuItem, browserWindow, event)
          }
        },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideothers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    })

    // Edit menu
    template[1].submenu.push(
      { type: 'separator' },
      {
        label: 'Speech',
        submenu: [
          { role: 'startspeaking' },
          { role: 'stopspeaking' }
        ]
      }
    )

    // Window menu
    template[3].submenu = [
      { role: 'close' },
      { role: 'minimize' },
      { role: 'zoom' },
      { type: 'separator' },
      { role: 'front' }
    ]
  }

  menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

function createTray () {
  if (os.platform() === 'darwin') {
    trayImage = require('path').join(__static, '/mactrayiconTemplate.png')
  }

  if (os.platform() === 'win32') {
    trayImage = require('path').join(__static, '/windowstrayicon.ico')
  }

  if (os.platform() === 'linux') {
    trayImage = require('path').join(__static, '/trayicon-linux.png')
  }

  tray = new Tray(trayImage)

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Quit',
      click: () => {
        app.isQuiting = true
        app.quit()
      }
    }
  ])

  tray.on('right-click', () => {
    tray.popUpContextMenu(contextMenu)
  })
  tray.on('click', () => {
    mainWindow.show()
    if (process.platform === 'darwin' && !app.dock.isVisible()) {
      app.dock.show()
    }
  })
}

function createWindow () {
  /**
   * If there is already data in old directory. Moved it to new
   */
  const oldDirectory = jetpack.cwd(app.getPath('userData'))
  const newDirectory = jetpack.cwd(app.getPath('home'))
  const existsArticle = jetpack.exists(oldDirectory.path(`articles.db`))
  const existsFeed = jetpack.exists(oldDirectory.path(`feeds.db`))

  if (existsArticle && existsFeed) {
    jetpack.move(oldDirectory.path(`feeds.db`), newDirectory.path('.rss-reader/feeds.db'))
    jetpack.move(oldDirectory.path(`articles.db`), newDirectory.path('.rss-reader/articles.db'))
  }
  /**
  * Initial window options
  */
  mainWindow = new BrowserWindow({
    webPreferences: {
      webSecurity: false
    },
    title: 'Raven Reader',
    minHeight: 768,
    minWidth: 1204,
    width: 1204,
    height: 768
  })

  mainWindow.loadURL(winURL)

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
    proxyBypassRules: proxy && proxy.bypass ? proxy.bypass : '<local>' }, () => {
    mainWindow.loadURL(winURL)
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

  createMenu()
  createTray()
}

app.requestSingleInstanceLock()
app.on('second-instance', (event, argv, cwd) => {
  app.quit()
})

app.on('ready', () => {
  createWindow()
})

app.on('before-quit', () => {
  app.isQuiting = true
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
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
