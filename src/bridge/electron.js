import { ipcRenderer } from 'electron'

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
  loginPocket: () => {
    return ipcRenderer.send('login-pocket')
  },
  createContextMenu: (type, data) => {
    return ipcRenderer.send('context-menu', {
      type: type,
      data: data
    })
  }
}
