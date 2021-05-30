import {
  ipcRenderer
} from 'electron'

export default {
  login: async (endpoint, formData) => {
    return await ipcRenderer.invoke('google-login', {
      endpoint: endpoint,
      formData: formData
    })
  },
  fetch: async (endpoint, formData) => {
    return await ipcRenderer.invoke('google-endpoint-fetch', {
      endpoint: endpoint,
      formData: formData
    })
  },
  post: async (endpoint, formData) => {
    return await ipcRenderer.invoke('google-endpoint-execute', {
      endpoint: endpoint,
      formData: formData
    })
  }
}
