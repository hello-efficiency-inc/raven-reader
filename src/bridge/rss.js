import { ipcRenderer } from 'electron'

export default {
  parseRssUrl (url) {
    return ipcRenderer.invoke('rss-parse', url)
  },
  findRss (url) {
    return ipcRenderer.invoke('find-rss', url)
  }
}
