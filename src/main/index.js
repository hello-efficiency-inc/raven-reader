'use strict'

import { app, BrowserWindow, Menu, Tray, ipcMain } from 'electron'
import updateElectron from 'update-electron-app'
import electronLog from 'electron-log'
import jetpack from 'fs-jetpack'
import os from 'os'

updateElectron({
  repo: 'mrgodhani/raven-reader',
  updateInterval: '1 hour',
  logger: electronLog
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
const winURL = process.env.NODE_ENV === 'development' ? `http://localhost:9080` : `file://${__dirname}/index.html`

function createMenu () {
  // Create the Application's main menu
  const template = [{
    label: 'Application',
    submenu: [
      { label: 'About Application', selector: 'orderFrontStandardAboutPanel:' },
      { type: 'separator' },
      { label: 'Quit',
        accelerator: 'Command+Q',
        click: function () {
          app.quit()
        } }
    ] }, {
    label: 'Edit',
    submenu: [
      { label: 'Undo', accelerator: 'CmdOrCtrl+Z', selector: 'undo:' },
      { label: 'Redo', accelerator: 'Shift+CmdOrCtrl+Z', selector: 'redo:' },
      { type: 'separator' },
      { label: 'Cut', accelerator: 'CmdOrCtrl+X', selector: 'cut:' },
      { label: 'Copy', accelerator: 'CmdOrCtrl+C', selector: 'copy:' },
      { label: 'Paste', accelerator: 'CmdOrCtrl+V', selector: 'paste:' },
      { label: 'Select All', accelerator: 'CmdOrCtrl+A', selector: 'selectAll:' }
    ] }
  ]

  Menu.setApplicationMenu(Menu.buildFromTemplate(template))
}

function createTray () {
  if (os.platform() === 'darwin') {
    trayImage = require('path').join(__static, '/mactrayiconTemplate.png')
  }

  if (os.platform() === 'win32') {
    trayImage = require('path').join(__static, '/windowstrayicon.ico')
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
      nodeIntegrationInWorker: true
    },
    minHeight: 768,
    minWidth: 1204,
    width: 1204,
    height: 768
  })

  mainWindow.loadURL(winURL)

  mainWindow.on('closed', () => {
    mainWindow = null
    electronLog.info('Closing app')
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
      electronLog.info('Hiding dock icon and browser window')
      return false
    }
  })

  createMenu()
  createTray()
}

const isSecondInstance = app.makeSingleInstance((commandLine, workingDirectory) => {
  electronLog.info(
    'Detected a newer instance. Closing this instance.',
    app.getVersion()
  )
  app.quit()
})

if (isSecondInstance) {
  electronLog.info('This is the newer version running.', app.getVersion())
}

app.on('ready', () => {
  createWindow()
})

app.on('before-quit', () => {
  electronLog.info('Setting isQuiting to true')
  app.isQuiting = true
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

ipcMain.on('online-status-changed', (event, status) => {
  event.sender.send('onlinestatus', status)
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})
