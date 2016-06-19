// This is main process of Electron, started as first thing when your
// app starts. This script is running through entire life of your application.
// It doesn't have any windows which you can see on screen, but we can open
// window from here.

import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'path'
import os from 'os'

let mainWindow

app.on('ready', () => {
  mainWindow = new BrowserWindow({
    width: 1300,
    height: 760,
    minWidth: 1300,
    minHeight: 760
  })

  // Load the HTML file directly from the webpack dev server if
  // hot reload is enabled, otherwise load the local file.
  const mainURL = process.env.HOT
  ? `http://localhost:${process.env.PORT}/main.html`
  : 'file://' + path.join(__dirname, 'main.html')

  mainWindow.loadURL(mainURL)

  if (process.env.NODE_ENV !== 'production') {
    mainWindow.openDevTools()
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
})

ipcMain.on('online-status-changed', (event, status) => {
  event.sender.send('online-status-check', status)
})

if (os.platform() === 'darwin') {
  ipcMain.on('counter', (event, counter) => {
    if (counter > 0) {
      app.dock.setBadge(counter.toString())
    } else {
      app.dock.setBadge('')
    }
  })
}

app.on('window-all-closed', () => {
  app.quit()
})
