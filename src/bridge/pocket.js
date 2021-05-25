import {
  ipcRenderer
} from 'electron'

export default {
  save: async (url, credential) => {
    return await ipcRenderer.invoke('save-pocket', {
      url: url,
      credential: credential
    })
  }
}
