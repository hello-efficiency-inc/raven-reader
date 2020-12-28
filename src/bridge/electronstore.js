import { ipcRenderer } from 'electron'

const electronStoreBridge = {
  getSortPreference: () => {
    return ipcRenderer.sendSync('sort-preference')
  },
  setFeedbinLastFetched: (timestamp) => {
    ipcRenderer.invoke('set-feedbin-last-fetched', timestamp)
  },
  inoreaderLastFetched: () => {
    return ipcRenderer.sendSync('get-inoreader-last')
  },
  getFeedbinLastFetched: () => {
    return ipcRenderer.sendSync('get-feedbin-last')
  },
  getSettings: () => {
    return ipcRenderer.sendSync('get-settings')
  },
  getIsDarkMode: () => {
    return ipcRenderer.sendSync('get-dark')
  },
  storeSetSettingItem: (type, key, data = null) => {
    ipcRenderer.invoke('set-settings-item', {
      type: type,
      key: key,
      data: data
    })
  },
  getProxySettings: () => {
    return ipcRenderer.send('proxy-settings-get')
  }
}

export default electronStoreBridge
