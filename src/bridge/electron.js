import { app, ipcRenderer, shell, clipboard } from 'electron'

export default {
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
