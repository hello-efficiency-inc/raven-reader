import {
  ipcRenderer
} from 'electron'

export default {
  fetch: async (endpoint, accessToken) => {
    return await ipcRenderer.invoke('inoreader-endpoint-fetch', {
      endpoint: endpoint,
      access_token: accessToken.access_token
    })
  },
  post: async (endpoint, formData, accessToken) => {
    return await ipcRenderer.invoke('inoreader-endpoint-execute', {
      endpoint: endpoint,
      formData: formData,
      access_token: accessToken.access_token
    })
  }
}
