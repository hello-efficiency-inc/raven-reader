import {
  contextBridge,
  ipcRenderer
} from 'electron'
import rssService from './bridge/rss'
import electronStore from './bridge/electronstore'
import electronService from './bridge/electron'

contextBridge.exposeInMainWorld('log', require('electron-log'))
contextBridge.exposeInMainWorld('fs', require('fs'))
contextBridge.exposeInMainWorld('electronstore', electronStore)
contextBridge.exposeInMainWorld('rss', rssService)
contextBridge.exposeInMainWorld('electron', electronService)
contextBridge.exposeInMainWorld('api', {
  ipcRendReceive: (channel, func) => {
    const validChannels = [
      'Add subscription',
      'Dark mode',
      'Next item',
      'Previous item',
      'Save offline',
      'Mark all read',
      'View in browser',
      'Import subscriptions',
      'Export subscriptions',
      'Toggle read',
      'Toggle favourite',
      'onlinestatus',
      'Settings',
      'pocket-authenticated',
      'refresh-feed',
      'edit-feed',
      'mark-feed-read',
      'unsubscribe-feed',
      'category-read',
      'category-delete',
      'category-rename',
      'mark-read',
      'mark-favourite',
      'save-article'
    ]
    if (validChannels.includes(channel)) {
      // Deliberately strip event as it includes `sender`
      ipcRenderer.on(channel, (event, ...args) => func(...args))
    }
  }
})

// window.shell = require('electron').shell
// window.globalagent = require('global-agent')
