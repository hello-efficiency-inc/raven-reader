import {
  ipcRenderer
} from 'electron'

export default {
  login: async (username, password) => {
    return await ipcRenderer.invoke('instapaper-login', {
      username: username,
      password: password
    })
  },
  save: async (url, username, password) => {
    return await ipcRenderer.invoke('instapaper-save', {
      url: url,
      username: username,
      password: password
    })
  }
}
