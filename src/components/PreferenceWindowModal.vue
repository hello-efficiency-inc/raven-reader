<template>
  <div>
    <b-modal
      id="preference"
      ref="preference"
      title="Preferences"
      size="lg"
      modal-class="preferencesModal"
      centered
      hide-footer
    >
      <b-overlay
        :show="showSync"
        variant="dark"
        spinner-variant="primary"
        rounded="sm"
      >
        <b-tabs
          pills
          card
          vertical
          content-class="preference-content"
        >
          <b-tab
            title="Settings"
            active
          >
            <template #title>
              <feather-icon name="settings" /> <span class="ml-3">Settings</span>
            </template>
            <b-form-group label="Keep read RSS items">
              <b-form-select
                v-model="keepread"
                :options="keepread_options"
                size="sm"
                @change="saveKeepRead"
              />
            </b-form-group>
            <b-form-group label="Set refresh interval for news feed">
              <b-form-select
                v-model="cronjob"
                :options="cron_options"
                size="sm"
                @change="saveCronjob"
              />
            </b-form-group>
            <b-form-group label="Choose appearance">
              <b-form-select
                v-model="theme_option"
                :options="themeOptions"
                size="sm"
                @change="saveAppearance"
              />
            </b-form-group>
            <b-form-group label="Oldest articles first">
              <b-form-radio-group
                id="btnradios1"
                v-model="oldestArticles"
                buttons
                button-variant="outline-primary"
                size="sm"
                :options="options"
                name="sortPref"
                @input="saveSortPreference"
              />
            </b-form-group>
            <h4 class="mt-5">
              Proxy Settings
            </h4>
            <b-form-group label="Web Server (HTTP):">
              <b-form-input
                v-model="proxy.http"
                type="text"
              />
            </b-form-group>
            <b-form-group label="Secure Web Server (HTTPS):">
              <b-form-input
                v-model="proxy.https"
                type="text"
              />
            </b-form-group>
            <b-form-group label="Bypass proxy settings for these hosts & domains:">
              <b-form-textarea
                v-model="proxy.bypass"
                :rows="3"
                :max-rows="6"
              />
            </b-form-group>
            <b-button @click="applyProxy">
              Set proxy & restart
            </b-button>
          </b-tab>
          <b-tab>
            <template #title>
              <feather-icon name="package" /> <span class="ml-3">Integrations</span>
            </template>
            <div class="row">
              <div class="col">
                <h4 class="mb-4 mt-4">
                  <strong>Read it later services</strong><br>
                  <small style="font-size: 14px;">Save articles to read it later services</small>
                </h4>
              </div>
            </div>
            <div class="row">
              <div class="col">
                <p class="text-left font-bold">
                  Instapaper
                </p>
              </div>
              <div class="col">
                <button
                  v-if="!instapaper_connected"
                  v-b-modal.instapaper
                  aria-label="Connect Instapaper"
                  class="btn-primary float-right"
                >
                  Connect
                </button>
                <button
                  v-if="instapaper_connected"
                  aria-label="Disconnect Instapaper"
                  class="btn-danger float-right"
                  @click="disconnectInstapaper"
                >
                  Disconnect
                </button>
              </div>
            </div>
            <div class="row">
              <div class="col">
                <p class="text-left font-bold">
                  Pocket
                </p>
              </div>
              <div class="col">
                <button
                  v-if="!pocket_connected"
                  class="btn-primary float-right"
                  aria-label="Connect pocket"
                  @click="signInPocket"
                >
                  Connect
                </button>
                <button
                  v-if="pocket_connected"
                  class="btn-danger float-right"
                  aria-label="Disconnect pocket"
                  @click="disconnectPocket"
                >
                  Disconnect
                </button>
              </div>
            </div>
            <div class="row">
              <div class="col">
                <h4 class="mb-4 mt-4">
                  <strong>RSS Services</strong><br>
                  <small style="font-size: 14px;">Sync across device with RSS services.</small>
                </h4>
              </div>
            </div>
            <div class="row">
              <div class="col">
                <p class="text-left font-bold">
                  Feedbin
                </p>
              </div>
              <div class="col">
                <button
                  v-if="!feedbin_connected"
                  v-b-modal.feedbin
                  aria-label="Connect Feedbin"
                  class="btn-primary float-right"
                >
                  Connect
                </button>
                <button
                  v-if="feedbin_connected"
                  aria-label="Edit Feedbin"
                  class="btn-primary float-right ml-2"
                  @click="editFeedbin"
                >
                  Edit
                </button>
                <button
                  v-if="feedbin_connected"
                  aria-label="Disconnect Feedbin"
                  class="btn-danger float-right"
                  @click="disconnectFeedbin"
                >
                  Disconnect
                </button>
              </div>
            </div>
          </b-tab>
        </b-tabs>
      </b-overlay>
    </b-modal>
    <b-modal
      id="instapaper"
      ref="instapaperLogin"
      title="Log into Instapaper"
      centered
      @hidden="onHiddenInstapaper"
    >
      <b-form-group id="input-group-1">
        <b-form-input
          id="input-1"
          v-model="instapaper.username"
          type="email"
          required
          placeholder="Enter email"
        />
      </b-form-group>
      <b-form-group id="input-group-1">
        <b-form-input
          id="input-1"
          v-model="instapaper.password"
          type="password"
          required
          placeholder="Enter password"
        />
      </b-form-group>
      <div slot="modal-footer">
        <button
          type="button"
          class="btn btn-secondary mr-2"
          @click="hideModal"
        >
          Cancel
        </button>
        <button
          type="button"
          class="btn btn-primary"
          @click="loginInstapaper"
        >
          Login
        </button>
      </div>
    </b-modal>
    <b-modal
      id="feedbin"
      ref="feedbinLogin"
      title="Log into Feedbin"
      centered
      @hidden="onHiddenFeedbin"
    >
      <b-alert
        :show="feedbin_error"
        variant="danger"
      >
        Invalid credentials
      </b-alert>
      <b-form-group id="input-group-1">
        <b-form-input
          id="input-1"
          v-model="feedbin.endpoint"
          type="email"
          required
          placeholder="Enter email"
        />
      </b-form-group>
      <b-form-group id="input-group-1">
        <b-form-input
          id="input-1"
          v-model="feedbin.email"
          type="email"
          required
          placeholder="Enter email"
        />
      </b-form-group>
      <b-form-group id="input-group-1">
        <b-form-input
          id="input-1"
          v-model="feedbin.password"
          type="password"
          required
          placeholder="Enter password"
        />
      </b-form-group>
      <div slot="modal-footer">
        <button
          type="button"
          class="btn btn-secondary mr-2"
          @click="hideFeedbinModal"
        >
          Cancel
        </button>
        <button
          type="button"
          class="btn btn-primary"
          @click="loginFeedbin"
        >
          Login
        </button>
      </div>
    </b-modal>
  </div>
</template>
<script>
import oauth from '../services/oauth'
import db from '../services/db'
import { URL } from 'url'
import axios from 'axios'
import setTheme from '../mixins/setTheme'
import feedbin from '../services/feedbin'
axios.defaults.headers.common['Access-Control-Allow-Origin'] = 'http://localhost:9080'

export default {
  mixins: [
    setTheme
  ],
  data () {
    return {
      showSync: false,
      feedbin_error: false,
      feedbin_connected: false,
      pocket_connected: false,
      instapaper_connected: false,
      instapaper_error: null,
      feedbin: {
        endpoint: 'https://api.feedbin.com/v2/',
        email: null,
        password: null
      },
      instapaper: {
        username: null,
        password: null
      },
      keepread: 1,
      cronjob: null,
      theme_option: null,
      darkMode: 'off',
      oldestArticles: 'off',
      keepread_options: [
        { value: 1, text: '1 week' },
        { value: 2, text: '2 weeks' },
        { value: 3, text: '3 weeks' },
        { value: 4, text: '4 weeks' },
        { value: 5, text: '5 weeks' },
        { value: 6, text: '6 weeks' },
        { value: 7, text: '7 weeks' },
        { value: 8, text: '8 weeks' },
        { value: 9, text: '9 weeks' },
        { value: 10, text: '10 weeks' }
      ],
      cron_options: [
        { value: null, text: 'Please select an option' },
        { value: '*/1 * * * *', text: 'Every 1 minutes' },
        { value: '*/2 * * * *', text: 'Every 2 minutes' },
        { value: '*/5 * * * *', text: 'Every 5 minutes' },
        { value: '*/10 * * * *', text: 'Every 10 minutes' },
        { value: '*/15 * * * *', text: 'Every 15 minutes' },
        { value: '*/20 * * * *', text: 'Every 20 minutes' },
        { value: '*/25 * * * *', text: 'Every 25 minutes' },
        { value: '*/30 * * * *', text: 'Every 30 minutes' },
        { value: '*/35 * * * *', text: 'Every 35 minutes' },
        { value: '*/40 * * * *', text: 'Every 40 minutes' },
        { value: '*/45 * * * *', text: 'Every 45 minutes' },
        { value: '*/50 * * * *', text: 'Every 50 minutes' },
        { value: '*/55 * * * *', text: 'Every 55 minutes' },
        { value: '*/60 * * * *', text: 'Every 60 minutes' }
      ],
      options: [
        { text: 'On', value: 'on' },
        { text: 'Off', value: 'off' }
      ],
      themeOptions: [
        { value: 'system', text: 'Follow system' },
        { value: null, text: 'Default' },
        { text: 'Dusk', value: 'dark' },
        { text: 'Sunset', value: 'sunset' },
        { text: 'Night', value: 'night' }
      ],
      proxy: {
        http: '',
        https: '',
        bypass: ''
      }
    }
  },
  mounted () {
    this.$store.dispatch('loadSettings')
    this.keepread = this.$store.state.Setting.keepRead
    this.cronjob = this.$store.state.Setting.cronSettings
    this.theme_option = this.$store.state.Setting.themeOption
    this.setTheme(this.$store.state.Setting.themeOption)
    this.oldestArticles = this.$store.state.Setting.oldestArticles
    if (this.$store.state.Setting.proxy) {
      this.proxy.http = this.$store.state.Setting.proxy.http
      this.proxy.https = this.$store.state.Setting.proxy.https
      this.proxy.bypass = this.$store.state.Setting.proxy.bypass
    }
    if (this.$electronstore.has('instapaper_creds')) {
      this.instapaper_connected = true
    }
    if (this.$electronstore.get('pocket_token')) {
      this.pocket_connected = true
    }
    if (this.$electronstore.has('feedbin_creds')) {
      this.feedbin_connected = true
    }
  },
  methods: {
    saveKeepRead (keepread) {
      this.$store.dispatch('setKeepRead', keepread)
      this.$toasted.show('Settings for keeping read items successfully saved.', {
        theme: 'outline',
        position: 'top-center',
        duration: 3000
      })
      this.hideModal()
    },
    saveCronjob (cronValue) {
      this.$store.dispatch('setCronJob', cronValue)
      this.$toasted.show('Settings for cronjob successfully saved.', {
        theme: 'outline',
        position: 'top-center',
        duration: 3000
      })
      this.hideModal()
    },
    saveSortPreference (sortPreference) {
      this.$store.dispatch('setSortPreference', sortPreference)
      this.$toasted.show('Sorting preference changed.', {
        theme: 'outline',
        position: 'top-center',
        duration: 3000
      })
      this.hideModal()
    },
    saveAppearance (theme) {
      this.$store.dispatch('setThemeOption', theme)
      this.setTheme(theme)
      this.$toasted.show('Changed appearance settings.', {
        theme: 'outline',
        position: 'top-center',
        duration: 3000
      })
      this.hideModal()
    },
    hideModal () {
      this.$refs.preference.hide()
    },
    applyProxy () {
      this.$store.dispatch('setProxy', this.proxy)
      this.$electron.remote.app.relaunch()
      this.$electron.remote.app.exit(0)
    },
    async signInPocketWithPopUp () {
      const self = this
      return new Promise((resolve, reject) => {
        let consumerKey
        let code
        const authWindow = new this.$electron.remote.BrowserWindow({
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
                  'https://getpocket.com/v3/oauth/authorize',
                  {
                    consumer_key: consumerKey,
                    code: code
                  },
                  {
                    withCredentials: true,
                    headers: {
                      'Content-Type': 'application/json',
                      'X-Accept': 'application/json'
                    }
                  }
                )
                .then(data => {
                  data.data.consumer_key = consumerKey
                  self.$store.dispatch('setPocket', JSON.stringify(data.data))
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
            'https://getpocket.com/v3/oauth/request',
            {
              consumer_key: consumerKey,
              redirect_uri: 'http://127.0.0.1'
            },
            {
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
          show: true
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

        authWindow.webContents.on(
          'did-get-redirect-request',
          (event, oldUrl, newUrl) => {
            handleNavigation(newUrl)
          }
        )

        authWindow.loadURL(authUrl)
      })
    },
    disconnectPocket () {
      this.$store.dispatch('unsetPocket')
      this.pocket_connected = false
    },
    disconnectInstapaper () {
      this.$store.dispatch('unsetInstapaper')
      this.instapaper_connected = false
    },
    disconnectFeedbin () {
      db.deleteAllFeedBinSubscriptions().then(() => {
        db.deleteArticlesFeedbin().then(() => {
          this.$store.dispatch('unsetFeedbin').then(() => {
            this.$store.dispatch('loadFeeds')
            this.$store.dispatch('loadArticles')
            this.feedbin_connected = false
            this.hideModal()
          })
        })
      })
    },
    onHiddenInstapaper () {
      this.instapaper.username = null
      this.instapaper.password = null
    },
    onHiddenFeedbin () {
      this.feedbin.email = null
      this.feedbin.password = null
    },
    hideModalInstapaper () {
      this.$refs.instapaperLogin.hide()
    },
    hideFeedbinModal () {
      this.$refs.feedbinLogin.hide()
    },
    loginInstapaper () {
      axios.post('https://www.instapaper.com/api/authenticate', {}, {
        auth: {
          username: this.instapaper.username,
          password: this.instapaper.password
        }
      }).then(() => {
        this.$refs.instapaperLogin.hide()
        this.$store.dispatch('setInstapaper', JSON.stringify(this.instapaper))
        this.instapaper_connected = true
      })
    },
    editFeedbin () {
      this.feedbin = JSON.parse(this.$electronstore.get('feedbin_creds'))
      this.$refs.feedbinLogin.show()
    },
    async loginFeedbin () {
      this.feedbin_error = false
      axios.get(`${this.feedbin.endpoint}authentication.json`, {
        auth: {
          username: this.feedbin.email,
          password: this.feedbin.password
        }
      }).then(() => {
        this.hideFeedbinModal()
        this.$store.dispatch('setFeedbin', JSON.stringify(this.feedbin)).then(() => {
          this.feedbin_connected = true
          this.showSync = true
          const promise = Promise.all([
            feedbin.getUnreadEntries(),
            feedbin.getStarredEntries(),
            feedbin.getEntries()
          ])
          promise.then((res) => {
            const [unread, starred, entries] = res
            const mapped = feedbin.transformEntriesAndFeed(unread, starred, entries)
            feedbin.syncItems(mapped).then(() => {
              this.$store.dispatch('loadFeeds')
              this.$store.dispatch('loadArticles')
              this.showSync = false
              this.hideModal()
            })
          })
        })
      }).catch(() => {
        this.feedbin_error = true
      })
    }
  }
}
</script>
<style lang="scss">
.preference-content {
    height: 500px;
    overflow-y: auto;
}
#preference___BV_modal_body_ {
    padding: 0;
}
</style>
