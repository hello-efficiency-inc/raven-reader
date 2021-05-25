import {
  ipcRenderer
} from 'electron'

export default {
  parseArticle: async (url) => {
    return await ipcRenderer.invoke('parse-article', url)
  }
}
