import { app, ipcRenderer } from 'electron'

export default {
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
  createContextMenu: (type, data) => {
    return ipcRenderer.invoke('context-menu', {
      type: type,
      data: data
    })
  }
}
