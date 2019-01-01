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
</b-modal>
</template>
<script>
import oauth from '../services/oauth'
import { URL } from 'url'
import { setImmediate } from 'timers'
import axios from 'axios'
import helper from '../services/helpers'

export default {
  data () {
    return {
      inoreader_connected: false
    }
  },
  mounted () {
    if (localStorage.getItem('inoreader_token')) {
      this.inoreader_connected = true
    }
  },
  methods: {
    signInWithPopUp () {
      return new Promise((resolve, reject) => {
        const authWindow = new this.$electron.remote.BrowserWindow({
          width: 500,
          height: 600,
          show: true
        })
        const ses = authWindow.webContents.session
        ses.clearStorageData()
        const authUrl = oauth.buildAuthUrl()

        function handleNavigation (url) {
          const params = new URL(url).searchParams
          if (params) {
            if (params.get('error')) {
              authWindow.removeAllListeners('closed')
              setImmediate(() => authWindow.close())
              resolve(false)
            } else if (params.get('code')) {
              authWindow.removeAllListeners('closed')
              setImmediate(() => authWindow.close())
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
    disconnect () {
      localStorage.removeItem('inoreader_token')
      this.inoreader_connected = false
    },
    async syncFeedsFromInoreader () {
      const token = JSON.parse(localStorage.getItem('inoreader_token')).access_token
      const subscriptionLists = await axios.get('https://www.inoreader.com/reader/api/0/subscription/list', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const rssFeedUrls = subscriptionLists.data.subscriptions.map((item) => {
        item.feedUrl = item.url
        return item
      })
      helper.subscribe(rssFeedUrls, null, false)
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
        localStorage.setItem('inoreader_token', JSON.stringify(token))
        this.inoreader_connected = true
      }
    }
  }
}
</script>