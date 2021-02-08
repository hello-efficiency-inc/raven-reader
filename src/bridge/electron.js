import { app, ipcRenderer, shell, clipboard } from 'electron'
import md5 from 'crypto-js/md5'
const osLocale = require('os-locale');

export default {
  currentLocale: () => {
    return osLocale.sync().split(/-|_/)[0]
  },
  convertToMD5: (text) => {
    return md5(text)
  },
  copyToClipboard: (url) => {
    clipboard.writeText(url, 'selection')
  },
  removeListeners: () => {
    ipcRenderer.removeAllListeners()
  },
  articleSelected: () => {
    ipcRenderer.invoke('article-selected')
  },
  exportOpml: (xmlData) => {
    ipcRenderer.invoke('export-opml', xmlData)
  },
  restartApp: () => {
    app.relaunch()
    app.exit(0)
  },
  loginPocket: () => {
    return ipcRenderer.send('login-pocket')
  },
  loginInoreader: () => {
    return ipcRenderer.send('login-inoreader')
  },
  openExternal: (href) => {
    shell.openExternal(href)
  },
  createContextMenu: (type, data) => {
    return ipcRenderer.invoke('context-menu', {
      type: type,
      data: data
    })
  }
}
