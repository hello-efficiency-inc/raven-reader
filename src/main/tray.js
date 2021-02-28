/* global __static */
import {
  app,
  Menu,
  Tray
} from 'electron'
import os from 'os'

export default function createTray(mainWindow, i18nextMain) {
  let trayImage

  if (os.platform() === 'darwin') {
    trayImage = require('path').join(__static, '/mactrayiconTemplate.png')
  }

  if (os.platform() === 'win32') {
    trayImage = require('path').join(__static, '/windowstrayicon.ico')
  }

  if (os.platform() === 'linux') {
    trayImage = require('path').join(__static, '/trayicon-linux.png')
  }

  const tray = new Tray(trayImage)

  const contextMenu = Menu.buildFromTemplate([
    {
      label: i18nextMain.t('start in tray'),
      type: "checkbox",
      checked: true,
      click: () => {
        //console.log(contextMenu.items[0].checked)
      }
    },
    {
      label: i18nextMain.t('Quit'),
      click: () => {
        app.isQuiting = true
        app.quit()
      }
    }
  ])

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
  return tray
}
