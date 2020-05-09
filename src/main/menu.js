import { app, Menu } from 'electron'
import Store from 'electron-store'
import {
  checkForUpdates
} from './updater.js'
import dayjs from 'dayjs'

const store = new Store()
var articleSelected = false

export default function createMenu (mainWindow) {
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
    submenu: [{
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
    submenu: [{
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
    }
    ]
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
        id: 'checkupdate',
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
        type: 'separator'
      },
      {
        label: 'Check for update',
        id: 'checkupdate',
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

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
  return menu
}
