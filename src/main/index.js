'use strict'

import {
  app,
  BrowserWindow,
  Menu,
  Tray,
  ipcMain,
  globalShortcut,
  systemPreferences
} from 'electron'
import jetpack from 'fs-jetpack'
import os from 'os'
import Store from 'electron-store'
import {
  checkForUpdates,
  autoUpdateApp
} from './updater.js'
import {
  enforceMacOSAppLocation,
  darkMode
} from 'electron-util'
import {
  touchBar
} from './touchbar.js'

const contextMenu = require('electron-context-menu')

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
let trayImage
let tray
var articleSelected = false
let menu
const store = new Store()

function createMenu () {
  // Create the Application's main menu
  const template = [{
    label: 'Edit',
    submenu: [{
      role: 'undo'
    },
    {
      role: 'redo'
    },
    {
      type: 'separator'
    },
    {
      role: 'cut'
    },
    {
      role: 'copy'
    },
    {
      role: 'paste'
    },
    {
      role: 'pasteandmatchstyle'
    },
    {
      role: 'delete'
    },
    {
      role: 'selectall'
    }
    ]
  },
  {
    label: 'View',
    submenu: [{
      role: 'togglefullscreen'
    }]
  },
  {
    role: 'window',
    submenu: [
      {
        role: 'minimize'
      },
      {
        role: 'close'
      }
    ]
  },
  {
    label: 'Subscriptions',
    submenu: [{
      label: 'Add subscription',
      accelerator: 'CmdOrCtrl+N',
      click: function () {
        mainWindow.webContents.send('Add subscription')
      }
    }]
  },
  {
    label: 'Item',
    submenu: [{
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
    {
      type: 'separator'
    },
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
    {
      type: 'separator'
    },
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
  },
  {
    label: 'Import and Export',
    submenu: [
      {
        label: 'Import subscriptions',
        click: function () {
          mainWindow.webContents.send('Import subscriptions')
        }
      },
      {
        type: 'separator'
      },
      {
        label: 'Export subscriptions',
        click: function () {
          mainWindow.webContents.send('Export subscriptions')
        }
      }]
  }
  ]

  const version = app.getVersion()

  if (process.platform === 'win32' || process.platform === 'linux') {
    template.unshift({
      label: 'Raven Reader',
      submenu: [{
        label: `Version ${version}`,
        enabled: false
      },
      {
        label: 'Check for update',
        click: function (menuItem, browserWindow, event) {
          checkForUpdates(menuItem, browserWindow, event)
        }
      },
      {
        label: 'Settings',
        id: 'settings',
        type: 'normal',
        accelerator: 'CmdOrCtrl+,',
        click: function () {
          mainWindow.webContents.send('Settings')
        }
      },
      {
        label: 'Add account',
        id: 'addaccount',
        click: function () {
          mainWindow.webContents.send('Add account')
        }
      },
      {
        role: 'hide'
      },
      {
        role: 'hideothers'
      },
      {
        role: 'unhide'
      },
      {
        type: 'separator'
      },
      {
        role: 'quit'
      }
      ]
    })
  }

  if (process.platform === 'darwin') {
    template.unshift({
      label: 'Raven Reader',
      submenu: [{
        role: 'about'
      },
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
      {
        type: 'separator'
      },
      {
        label: 'Settings',
        id: 'settings',
        accelerator: 'CmdOrCtrl+,',
        type: 'normal',
        click: function () {
          mainWindow.webContents.send('Settings')
        }
      },
      {
        type: 'separator'
      },
      {
        label: 'Manage accounts',
        id: 'manageaccounts',
        click: function () {
          mainWindow.webContents.send('Manage accounts')
        }
      },
      {
        label: 'Add account',
        id: 'addaccount',
        click: function () {
          mainWindow.webContents.send('Add account')
        }
      },
      {
        type: 'separator'
      },
      {
        role: 'services'
      },
      {
        type: 'separator'
      },
      {
        type: 'separator'
      },
      {
        role: 'hide'
      },
      {
        role: 'hideothers'
      },
      {
        role: 'unhide'
      },
      {
        type: 'separator'
      },
      {
        role: 'quit'
      }
      ]
    })

    // Edit menu
    template[1].submenu.push({
      type: 'separator'
    }, {
      label: 'Speech',
      submenu: [{
        role: 'startspeaking'
      },
      {
        role: 'stopspeaking'
      }
      ]
    })

    // Window menu
    template[3].submenu = [{
      role: 'close'
    },
    {
      role: 'minimize'
    },
    {
      role: 'zoom'
    },
    {
      type: 'separator'
    },
    {
      role: 'front'
    }
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

  const contextMenu = Menu.buildFromTemplate([{
    label: 'Quit',
    click: () => {
      app.isQuiting = true
      app.quit()
    }
  }])

  if (os.platform() !== 'linux') {
    tray.on('right-click', () => {
      tray.popUpContextMenu(contextMenu)
    })
  } else {
    tray.setContextMenu(contextMenu)
  }
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
  const existsArticle = jetpack.exists(oldDirectory.path('articles.db'))
  const existsFeed = jetpack.exists(oldDirectory.path('feeds.db'))
  const winURL = process.env.NODE_ENV === 'development' ? 'http://localhost:9080' : `file://${__dirname}/index.html`

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
      webSecurity: true
    },
    maximizable: true,
    title: 'Raven Reader',
    minHeight: 768,
    minWidth: 1204,
    width: 1204,
    height: 768
  })

  // mainWindow.webContents.openDevTools()
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

  createMenu()
  createTray()

  if (process.platform !== 'darwin') {
    globalShortcut.register('Alt+M', () => {
      const visible = mainWindow.isMenuBarVisible()
      if (visible) {
        mainWindow.setMenuBarVisibility(false)
      } else {
        mainWindow.setMenuBarVisibility(true)
      }
    })
  }
}

app.requestSingleInstanceLock()
app.on('second-instance', (event, argv, cwd) => {
  app.quit()
})

app.on('ready', () => {
  createWindow()
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
