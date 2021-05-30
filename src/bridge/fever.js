import {
  ipcRenderer
} from 'electron'

export default {
  login: async (endpoint, formData) => {
    return await ipcRenderer.invoke('fever-login', {
      endpoint: endpoint,
      formData: formData
    })
  },
  post: async (endpoint, formData) => {
    return await ipcRenderer.invoke('fever-endpoint-execute', {
      endpoint: endpoint,
      formData: formData
    })
  }
}
