import {
  ipcRenderer
} from 'electron'

export default {
  login: async (endpoint, creds) => {
    return await ipcRenderer.invoke('feedbin-login', {
      endpoint: endpoint,
      creds: {
        email: creds.email,
        password: creds.password
      }
    })
  },
  fetch: async (endpoint, creds) => {
    return await ipcRenderer.invoke('feedbin-endpoint-fetch', {
      endpoint: endpoint,
      creds: {
        email: creds.email,
        password: creds.password
      }
    })
  },
  post: async (endpoint, formData, creds) => {
    return await ipcRenderer.invoke('feedbin-endpoint-execute', {
      endpoint: endpoint,
      formData: formData,
      creds: {
        email: creds.email,
        password: creds.password
      }
    })
  }
}
