<template>
<b-modal id="integrations" ref="integrations" size="md" title="Integrations" hide-footer centered>
  <div class="row">
    <div class="col">
      <p class="text-left">Inoreader</p>
    </div>
    <div class="col">
      <button class="btn-primary float-right" @click="signIn" v-if="!inoreader_connected">Connect</button>
      <button class="btn-danger float-right" @click="disconnect" v-if="inoreader_connected">Disconnect</button>
    </div>
  </div>
  <div class="row" v-if="inoreader_connected">
    <div class="col">
      <p>Sync feeds from inoreader</p>
    </div>
    <div class="col">
      <button class="btn-primary float-right" @click="syncFeedsFromInoreader">
        Sync Feeds
      </button>
    </div>
  </div>
  <div class="row">
    <div class="col">
      <p class="text-left">Pocket</p>
    </div>
    <div class="col">
      <button class="btn-primary float-right" @click="signInPocket" v-if="!pocket_connected">Connect</button>
      <button class="btn-danger float-right" @click="disconnectPocket" v-if="pocket_connected">Disconnect</button>
    </div>
  </div>
</b-modal>
</template>
<script>
import oauth from '../services/oauth'
import { URL } from 'url'
import { setImmediate } from 'timers'
import helper from '../services/helpers'
import Store from 'electron-store'
import axios from 'axios'
import os from 'os'
import { POCKET_MAC_KEY, POCKET_WINDOWS_KEY, POCKET_LINUX_KEY } from '../config'

const store = new Store()

export default {
  data () {
    return {
      inoreader_connected: false,
      pocket_connected: false
    }
  },
  mounted () {
    if (store.get('inoreader_token')) {
      this.inoreader_connected = true
    }
    if (store.get('pocket_token')) {
      this.pocket_connected = true
    }
  },
  methods: {
    async signInPocketWithPopUp () {
      return new Promise((resolve, reject) => {
        var consumerKey
        var code
        const authWindow = new this.$electron.remote.BrowserWindow({
          width: 1024,
          height: 720,
          show: true,
          webPreferences: {
            nodeIntegration: false,
            devTools: true
          }
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
              axios.post('https://getpocket.com/v3/oauth/authorize',
                {
                  consumer_key: consumerKey,
                  code: code
                },
                {
                  headers: {
                    'Content-Type': 'application/json',
                    'X-Accept': 'application/json'
                  }
                }).then((data) => {
                data.data.consumer_key = consumerKey
                store.set('pocket_token', JSON.stringify(data.data))
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

        authWindow.webContents.on('did-get-redirect-request', (event, oldUrl, newUrl) => {
          handleNavigation(newUrl)
        })

        if (os.platform() === 'darwin') {
          consumerKey = POCKET_MAC_KEY
        }

        if (os.platform() === 'win32') {
          consumerKey = POCKET_WINDOWS_KEY
        }

        if (os.platform() === 'linux') {
          consumerKey = POCKET_LINUX_KEY
        }

        axios.post('https://getpocket.com/v3/oauth/request',
          {
            consumer_key: consumerKey,
            redirect_uri: 'http://127.0.0.1'
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'X-Accept': 'application/json'
            }
          }).then((data) => {
          code = data.data.code
          authWindow.loadURL(`https://getpocket.com/auth/authorize?request_token=${data.data.code}&redirect_uri=http://127.0.0.1`)
        })
      })
    },
    async signInPocket () {
      const token = await this.signInPocketWithPopUp()
      if (token) {
        this.pocket_connected = true
      }
    },
    signInWithPopUp () {
      return new Promise((resolve, reject) => {
        const authWindow = new this.$electron.remote.BrowserWindow({
          width: 1024,
          height: 720,
          show: true,
          webPreferences: {
            nodeIntegration: false,
            devTools: false
          }
        })
        const ses = authWindow.webContents.session
        ses.clearStorageData({
          storages: ['localStorage', 'cookies']
        })
        const authUrl = oauth.buildAuthUrl()

        function handleNavigation (url) {
          const urlItem = new URL(url)
          const params = urlItem.searchParams
          const hostname = urlItem.hostname
          console.log(params)
          if (params) {
            if (params.get('error')) {
              authWindow.removeAllListeners('closed')
              setImmediate(() => authWindow.close())
              resolve(false)
            } else if (hostname === '127.0.0.1' && params.get('code')) {
              authWindow.removeAllListeners('closed')
              authWindow.close()
              resolve(params.get('code'))
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

        authWindow.webContents.on('did-get-redirect-request', (event, oldUrl, newUrl) => {
          handleNavigation(newUrl)
        })

        authWindow.loadURL(authUrl)
      })
    },
    disconnectPocket () {
      store.delete('pocket_token')
      this.pocket_connected = false
    },
    disconnect () {
      store.delete('inoreader_token')
      this.inoreader_connected = false
    },
    async syncFeedsFromInoreader () {
      await helper.syncInoReader()
    },
    async signIn () {
      let token
      const code = await this.signInWithPopUp()
      if (code) {
        try {
          token = await oauth.fetchToken(code)
        } catch (e) {
          console.error(e)
        }
      }

      if (token) {
        store.set('inoreader_token', JSON.stringify(token))
        this.inoreader_connected = true
      }
    }
  }
}
</script>
