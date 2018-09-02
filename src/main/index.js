'use strict'

import { app, BrowserWindow, Menu, Tray } from 'electron'
import updateElectron from 'update-electron-app'
import electronLog from 'electron-log'
import jetpack from 'fs-jetpack'
import os from 'os'

let myWindow = null

updateElectron({
  repo: 'mrgodhani/rss-reader',
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

function createWindow () {
  /**
   * If there is already data in old directory. Moved it to new
   */
  const oldDirectory = jetpack.cwd(app.getPath('userData'))
  const newDirectory = jetpack.cwd(app.getPath('home'))
  const existsArticle = jetpack.exists(oldDirectory.path(`articles.db`))
  const existsFeed = jetpack.exists(oldDirectory.path(`feeds.db`))
  let trayImage
  if (os.platform() === 'darwin') {
    trayImage = require('path').join(__static, '/mactrayiconTemplate.png')
  }

  if (os.platform() === 'win32') {
    trayImage = require('path').join(__static, '/windowstrayicon.ico')
  }

  const appIcon = new Tray(trayImage)

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

  const contextMenu = Menu.buildFromTemplate([
    { label: 'About RSS Reader', selector: 'orderFrontStandardAboutPanel:' },
    {
      label: 'Show App',
      click: () => {
        mainWindow.show()
      }
    },
    {
      label: 'Quit',
      click: () => {
        app.isQuiting = true
        app.quit()
      }
    }
  ])

  appIcon.setContextMenu(contextMenu)

  mainWindow.loadURL(winURL)

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  mainWindow.on('close', (event) => {
    if (!app.isQuiting) {
      event.preventDefault()
      mainWindow.minimize()
      app.dock.hide()
    }
    return false
  })

  mainWindow.on('restore', (event) => {
    app.dock.show()
  })

  createMenu()
}

// Allow only one instance
const isSecondInstance = app.makeSingleInstance((commandLine, workingDirectory) => {
  if (myWindow) {
    if (myWindow.isMinimized()) myWindow.restore()
    myWindow.focus()
  }
})

if (isSecondInstance) {
  app.quit()
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})
