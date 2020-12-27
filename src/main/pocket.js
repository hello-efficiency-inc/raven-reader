import { BrowserWindow } from 'electron'
import {
  URL
} from 'url'
import axios from 'axios'

export default function signInPocketWithPopUp () {
  return new Promise((resolve, reject) => {
    let consumerKey
    let code
    const authWindow = new BrowserWindow({
      width: 1024,
      height: 720,
      show: true
    })
    const ses = authWindow.webContents.session
    ses.clearStorageData({
      storages: ['localStorage', 'cookies']
    })

    function handleNavigation (url) {
      const urlItem = new URL(url)
      const params = urlItem.searchParams
      const hostname = urlItem.hostname
      if (params) {
        if (params.get('error')) {
          authWindow.removeAllListeners('closed')
          setImmediate(() => authWindow.close())
          resolve(false)
        } else if (hostname === '127.0.0.1') {
          axios
            .post(
              'https://getpocket.com/v3/oauth/authorize', {
                consumer_key: consumerKey,
                code: code
              }, {
                withCredentials: true,
                headers: {
                  'Content-Type': 'application/json',
                  'X-Accept': 'application/json'
                }
              }
            )
            .then(data => {
              data.data.consumer_key = consumerKey
              //   self.$store.dispatch('setPocket', JSON.stringify(data.data))
              resolve(data.data)
            })
          authWindow.removeAllListeners('closed')
          authWindow.close()
        }
      }
    }

    authWindow.on('closed', () => {
      resolve(false)
      throw new Error('Auth window was closed by user')
    })

    authWindow.webContents.on('will-navigate', (event, url) => {
      handleNavigation(url)
    })

    authWindow.webContents.on('will-redirect', (event, url) => {
      handleNavigation(url)
    })

    authWindow.webContents.on(
      'did-get-redirect-request',
      (event, oldUrl, newUrl) => {
        handleNavigation(newUrl)
      }
    )

    if (window.os.platform() === 'darwin') {
      consumerKey = process.env.VUE_APP_POCKET_MAC_KEY
    }

    if (window.os.platform() === 'win32') {
      consumerKey = process.env.VUE_APP_POCKET_WINDOWS_KEY
    }

    if (window.os.platform() === 'linux') {
      consumerKey = process.env.VUE_APP_POCKET_LINUX_KEY
    }

    axios
      .post(
        'https://getpocket.com/v3/oauth/request', {
          consumer_key: consumerKey,
          redirect_uri: 'http://127.0.0.1'
        }, {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            'X-Accept': 'application/json'
          }
        }
      )
      .then(data => {
        code = data.data.code
        authWindow.loadURL(
                  `https://getpocket.com/auth/authorize?request_token=${data.data.code}&redirect_uri=http://127.0.0.1`
        )
      })
  })
}
