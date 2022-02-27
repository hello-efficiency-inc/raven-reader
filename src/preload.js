import {
  contextBridge,
  ipcRenderer
} from 'electron'
import rssService from './bridge/rss'
import electronStore from './bridge/electronstore'
import electronService from './bridge/electron'
import parseService from './bridge/mercury'
import instapaperService from './bridge/instapaper'
import pocketService from './bridge/pocket'
import feverService from './bridge/fever'
import greaderService from './bridge/greader'
import inoreaderService from './bridge/inoreader'
import feedbinService from './bridge/feedbin'
import sanitizeService from './bridge/sanitize'
const backend = require('i18next-electron-fs-backend')

ipcRenderer.setMaxListeners(0)

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
  'inoreader-authenticated',
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
  'save-article',
  'power-resume'
]

contextBridge.exposeInMainWorld('log', require('electron-log'))
contextBridge.exposeInMainWorld('fs', require('fs'))
contextBridge.exposeInMainWorld('electronstore', electronStore)
contextBridge.exposeInMainWorld('rss', rssService)
contextBridge.exposeInMainWorld('electron', electronService)
contextBridge.exposeInMainWorld('mercury', parseService)
contextBridge.exposeInMainWorld('instapaper', instapaperService)
contextBridge.exposeInMainWorld('pocket', pocketService)
contextBridge.exposeInMainWorld('fever', feverService)
contextBridge.exposeInMainWorld('greader', greaderService)
contextBridge.exposeInMainWorld('inoreader', inoreaderService)
contextBridge.exposeInMainWorld('feedbin', feedbinService)
contextBridge.exposeInMainWorld('sanitize', sanitizeService)
contextBridge.exposeInMainWorld('api', {
  i18nextElectronBackend: backend.preloadBindings(ipcRenderer, process),
  ipcRendReceiveOnce: (channel, func) => {
    if (validChannels.includes(channel)) {
      ipcRenderer.once(channel, (event, ...args) => func(...args))
    }
  },
  ipcRendReceive: (channel, func) => {
    if (validChannels.includes(channel)) {
      // Deliberately strip event as it includes `sender`
      ipcRenderer.on(channel, (event, ...args) => func(...args))
    }
  }
})
