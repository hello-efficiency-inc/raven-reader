<template>
  <div>
    <b-modal
      id="preference"
      ref="preference"
      :title="getTranslatedLabel('Preferences')"
      size="xl"
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
            :title="getTranslatedLabel('Settings')"
            active
          >
            <template #title>
              <feather-icon name="sliders" /> <span class="ml-3">{{ $t('Settings') }}</span>
            </template>
            <b-form-group :label="getTranslatedLabel('Keep read RSS items')">
              <b-form-select
                v-model="keepread"
                :options="keepread_options"
                size="sm"
                @change="saveKeepRead"
              />
            </b-form-group>
            <b-form-group :label="getTranslatedLabel('Set refresh interval for news feed')">
              <b-form-select
                v-model="cronjob"
                :options="cron_options"
                size="sm"
                @change="saveCronjob"
              />
            </b-form-group>
            <b-form-group :label="getTranslatedLabel('Choose appearance')">
              <b-form-select
                v-model="theme_option"
                :options="themeOptions"
                size="sm"
                @change="saveAppearance"
              />
            </b-form-group>
            <b-form-group :label="getTranslatedLabel('Oldest articles first')">
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
            <b-form-group :label="getTranslatedLabel('Disable images in Articles')">
              <b-form-radio-group
                id="disableImages"
                v-model="disableImages"
                buttons
                button-variant="outline-primary"
                size="sm"
                :options="options"
                name="imagePref"
                @input="saveImagePreference"
              />
            </b-form-group>
            <b-form-group :label="getTranslatedLabel('Automatically add to Recently Read')">
              <b-form-radio-group
                id="recentlyRead"
                v-model="recentlyRead"
                buttons
                button-variant="outline-primary"
                size="sm"
                :options="options"
                name="recentlyRead"
                @input="recentlyReadPreferences"
              />
            </b-form-group>
            <b-form-group :label="getTranslatedLabel('Full article view by default')">
              <b-form-radio-group
                id="fullArticle"
                v-model="fullArticleDefault"
                buttons
                button-variant="outline-primary"
                size="sm"
                :options="options"
                name="fullArticle"
                @input="saveFullArticlePreferences"
              />
            </b-form-group>
            <b-form-group :label="getTranslatedLabel('Content preview')">
              <b-form-radio-group
                id="contentPreview"
                v-model="contentPreview"
                buttons
                button-variant="outline-primary"
                size="sm"
                :options="options"
                name="contentPreview"
                @input="saveContentPreviewPreferences"
              />
            </b-form-group>
            <b-form-group :label="getTranslatedLabel('Delete all feed, category and article data')">
              <b-button
                variant="danger"
                squared
                @click="deleteAllData"
              >
                {{ $t('Clear all data') }}
              </b-button>
            </b-form-group>
          </b-tab>
          <b-tab>
            <template #title>
              <feather-icon name="wifi" /> <span class="ml-3">{{ $t('Proxy Setting') }}</span>
            </template>
            <h4>
              {{ $t('Proxy Setting') }}
            </h4>
            <b-form-group :label="getTranslatedLabel('Web Server (HTTP)')">
              <b-form-input
                v-model="proxy.http"
                type="text"
              />
            </b-form-group>
            <b-form-group :label="getTranslatedLabel('Secure Web Server (HTTPS)')">
              <b-form-input
                v-model="proxy.https"
                type="text"
              />
            </b-form-group>
            <b-form-group :label="getTranslatedLabel('Bypass proxy settings for these hosts & domains')">
              <b-form-textarea
                v-model="proxy.bypass"
                :rows="3"
                :max-rows="6"
              />
            </b-form-group>
            <b-button @click="applyProxy">
              {{ $t('Set proxy & restart') }}
            </b-button>
          </b-tab>
          <b-tab>
            <template #title>
              <feather-icon name="share-2" /> <span class="ml-3">{{ $t('Sharing') }}</span>
            </template>
            <div class="row">
              <div class="col">
                <h4 class="mb-4 mt-4">
                  <strong>{{ $t('Read it later services') }}</strong><br>
                  <small style="font-size: 14px;">{{ $t('Save articles to read it later services') }}</small>
                </h4>
              </div>
            </div>
            <div class="row mb-3">
              <div class="col">
                <p class="text-left font-bold">
                  {{ $t('Instapaper') }}
                </p>
              </div>
              <div class="col">
                <b-button
                  v-if="!instapaper_connected"
                  v-b-modal.instapaper
                  :aria-label="getTranslatedLabel('Connect Instapaper')"
                  class="float-right"
                  variant="primary"
                  squared
                >
                  {{ $t('Connect') }}
                </b-button>
                <b-button
                  v-if="instapaper_connected"
                  :aria-label="getTranslatedLabel('Disconnect Instapaper')"
                  class="btn-danger float-right"
                  variant="danger"
                  squared
                  @click="disconnectInstapaper"
                >
                  {{ $t('Disconnect') }}
                </b-button>
              </div>
            </div>
            <div class="row">
              <div class="col">
                <p class="text-left font-bold">
                  {{ $t('Pocket') }}
                </p>
              </div>
              <div class="col">
                <b-button
                  v-if="!pocket_connected"
                  class="float-right"
                  :aria-label="getTranslatedLabel('Connect pocket')"
                  variant="primary"
                  squared
                  @click="signInPocket"
                >
                  {{ $t('Connect') }}
                </b-button>
                <b-button
                  v-if="pocket_connected"
                  class="float-right"
                  :aria-label="getTranslatedLabel('Disconnect pocket')"
                  variant="danger"
                  squared
                  @click="disconnectPocket"
                >
                  {{ $t('Disconnect') }}
                </b-button>
              </div>
            </div>
          </b-tab>
          <b-tab>
            <template #title>
              <feather-icon name="package" /> <span class="ml-3">{{ $t('Sync Account') }}</span>
            </template>
            <div class="row mb-3">
              <div class="col">
                <h4 class="mb-4">
                  <strong>{{ $t('RSS Services') }}</strong><br>
                  <small style="font-size: 14px;">{{ $t('Sync across device with RSS services') }}</small>
                </h4>
                <p><strong>Note</strong>: {{ $t('Only one service can be connected If you have local sources prior to connecting sync accounts that share same feed URLs, local articles will be removed') }}</p>
              </div>
            </div>
            <feedbin
              :connected="feedbin_connected"
              :service-connected="servicesConnected"
              @feedbin-sync="handleSync"
              @feedbin-connected="handleFeedbinConnect"
              @preference-modal-hide="hideModal"
            />
            <inoreader
              :connected="inoreader_connected"
              :service-connected="servicesConnected"
              @inoreader-connect="handleInoreaderConnect"
              @preference-modal-hide="hideModal"
            />
            <self-hosted-greader
              :connected="selfhost_connected"
              :service-connected="servicesConnected"
              @selfhost-connected="handleSelfHostConnect"
              @selfhost-sync="handleSync"
              @preference-modal-hide="hideModal"
            />
            <fever
              :connected="fever_connected"
              :service-connected="servicesConnected"
              @fever-connected="handleFeverConnect"
              @fever-sync="handleSync"
              @preference-modal-hide="hideModal"
            />
          </b-tab>
          <b-tab>
            <template #title>
              <feather-icon name="edit" /> <span class="ml-3">{{ $t('Manage Categories') }}</span>
            </template>
            <div class="row">
              <div class="col">
                <h4 class="mb-4 mt-2">
                  <strong>{{ $t('Manage categories') }}</strong><br>
                  <small style="font-size: 14px;"><strong>Note:</strong> RSS Services categories cannot be managed from here.</small>
                </h4>
              </div>
            </div>
            <manage-categories />
          </b-tab>
          <b-tab>
            <template #title>
              <feather-icon name="edit" /> <span class="ml-3">{{ $t('Manage Feeds') }}</span>
            </template>
            <div class="row">
              <div class="col">
                <h4 class="mb-4 mt-2">
                  <strong>{{ $t('Manage feeds') }}</strong><br>
                  <small style="font-size: 14px;"><strong>Note:</strong> RSS Services feeds cannot be managed from here.</small>
                </h4>
              </div>
            </div>
            <manage-feeds />
          </b-tab>
        </b-tabs>
      </b-overlay>
    </b-modal>
    <b-modal
      id="instapaper"
      ref="instapaperLogin"
      :title="getTranslatedLabel('Log into Instapaper')"
      centered
      @hidden="onHiddenInstapaper"
    >
      <b-alert
        :show="instapaper_error"
        variant="danger"
      >
        {{ $t('Invalid credentials') }}
      </b-alert>
      <b-form-group id="input-group-1">
        <b-form-input
          id="input-1"
          v-model="instapaper.username"
          type="email"
          required
          :placeholder="getTranslatedLabel('Enter email')"
        />
      </b-form-group>
      <b-form-group id="input-group-1">
        <b-form-input
          id="input-1"
          v-model="instapaper.password"
          type="password"
          required
          :placeholder="getTranslatedLabel('Enter password')"
        />
      </b-form-group>
      <div slot="modal-footer">
        <button
          type="button"
          class="btn btn-secondary mr-2"
          @click="hideModal"
        >
          {{ $t('Cancel') }}
        </button>
        <button
          type="button"
          class="btn btn-primary"
          @click="loginInstapaper"
        >
          {{ $t('Login') }}
        </button>
      </div>
    </b-modal>
  </div>
</template>
<script>
import bus from '../services/bus'
import db from '../services/db'
import axios from 'axios'
import setTheme from '../mixins/setTheme'
import inoreader from '../services/inoreader'
import Fever from './Fever.vue'
axios.defaults.headers.common['Access-Control-Allow-Origin'] = 'http://localhost:9080'

export default {
  components: { Fever },
  mixins: [
    setTheme
  ],
  data () {
    return {
      showSync: false,
      fever_connected: false,
      selfhost_connected: false,
      feedbin_connected: false,
      inoreader_connected: false,
      pocket_connected: false,
      instapaper_connected: false,
      instapaper_error: false,
      instapaper: {
        username: null,
        password: null
      },
      keepread: 1,
      cronjob: null,
      theme_option: null,
      darkMode: 'off',
      oldestArticles: 'off',
      disableImages: 'off',
      recentlyRead: 'off',
      fullArticleDefault: 'off',
      contentPreview: 'on',
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
      imageOptions: [
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
  computed: {
    servicesConnected () {
      return this.inoreader_connected || this.feedbin_connected || this.selfhost_connected
    }
  },
  mounted () {
    this.$store.dispatch('loadSettings').then(() => {
      this.keepread = this.$store.state.Setting.keepRead
      this.cronjob = this.$store.state.Setting.cronSettings
      this.theme_option = this.$store.state.Setting.themeOption
      this.setTheme(this.$store.state.Setting.themeOption)
      this.oldestArticles = this.$store.state.Setting.oldestArticles === 'on' ? 'on' : 'off'
      this.disableImages = this.$store.state.Setting.disableImages ? 'on' : 'off'
      this.recentlyRead = this.$store.state.Setting.recentlyReadPreference ? 'on' : 'off'
      this.fullArticleDefault = this.$store.state.Setting.fullArticleDefault ? 'on' : 'off'
      this.contentPreview = this.$store.state.Setting.contentPreview ? 'on' : 'off'
      if (this.$store.state.Setting.proxy) {
        this.proxy.http = this.$store.state.Setting.proxy.http
        this.proxy.https = this.$store.state.Setting.proxy.https
        this.proxy.bypass = this.$store.state.Setting.proxy.bypass
      }
      this.fever_connected = this.$store.state.Setting.fever_connected
      this.selfhost_connected = this.$store.state.Setting.selfhost_connected
      this.inoreader_connected = this.$store.state.Setting.inoreader_connected
      this.instapaper_connected = JSON.parse(JSON.stringify(this.$store.state.Setting.instapaper_connected))
      this.instapaper = JSON.parse(JSON.stringify(this.$store.state.Setting.instapaper))
      this.feedbin_connected = this.$store.state.Setting.feedbin_connected
      this.pocket_connected = JSON.parse(JSON.stringify(this.$store.state.Setting.pocket_connected))
    })
    window.api.ipcRendReceive('pocket-authenticated', (args) => {
      this.$store.dispatch('setPocket', JSON.stringify(args))
      if (args) {
        this.pocket_connected = true
      }
    })

    window.api.ipcRendReceive('inoreader-authenticated', async (args) => {
      const userInfo = await inoreader.getUserInfo(args)
      args.user = userInfo
      this.$store.dispatch('setInoreader', JSON.stringify(args)).then(() => {
        this.inoreader_connected = true
        this.showSync = true
        inoreader.syncArticles(args).then(() => {
          this.$store.dispatch('loadCategories')
          this.$store.dispatch('loadFeeds')
          this.$store.dispatch('loadArticles')
          this.showSync = false
          this.hideModal()
        })
      })
    })
  },
  methods: {
    getTranslatedLabel (val) {
      return this.$options.filters.t(val)
    },
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
    recentlyReadPreferences (preference) {
      this.$store.dispatch('setRecentlyReadPreference', preference)
      this.$toasted.show('Recently Read preference changed.', {
        theme: 'outline',
        position: 'top-center',
        duration: 3000
      })
      this.hideModal()
    },
    saveContentPreviewPreferences (preference) {
      this.$store.dispatch('setContentPreviewPreference', preference).then(() => {
        this.$store.dispatch('loadArticles')
      })
      this.$toasted.show('Content Preview preference changed.', {
        theme: 'outline',
        position: 'top-center',
        duration: 3000
      })
      this.hideModal()
    },
    saveFullArticlePreferences (preference) {
      this.$store.dispatch('setFullArticlePreference', preference)
      this.$toasted.show('Full Article preference changed.', {
        theme: 'outline',
        position: 'top-center',
        duration: 3000
      })
      this.hideModal()
    },
    saveImagePreference (preference) {
      this.$store.dispatch('setImagePreference', preference)
      this.$toasted.show('Image preference changed.', {
        theme: 'outline',
        position: 'top-center',
        duration: 3000
      })
      bus.$emit('change-article-list', { type: null })
      this.hideModal()
    },
    saveSortPreference (sortPreference) {
      this.$store.dispatch('setSortPreference', sortPreference).then(() => {
        this.$store.dispatch('loadSettings')
        this.$toasted.show('Sorting preference changed.', {
          theme: 'outline',
          position: 'top-center',
          duration: 3000
        })
        this.hideModal()
      })
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
      this.$bvModal.hide('preference')
    },
    applyProxy () {
      this.$store.dispatch('setProxy', this.proxy)
      window.electron.restartApp()
    },
    signInPocket () {
      window.electron.loginPocket()
    },
    disconnectPocket () {
      this.$store.dispatch('unsetPocket')
      this.pocket_connected = false
    },
    disconnectInstapaper () {
      this.$store.dispatch('unsetInstapaper')
      this.instapaper_connected = false
    },
    onHiddenInstapaper () {
      this.instapaper.username = null
      this.instapaper.password = null
    },
    hideModalInstapaper () {
      this.$refs.instapaperLogin.hide()
    },
    loginInstapaper () {
      this.instapaper_error = false
      axios.post('https://www.instapaper.com/api/authenticate', {}, {
        auth: {
          username: this.instapaper.username,
          password: this.instapaper.password
        }
      }).then(() => {
        this.$refs.instapaperLogin.hide()
        this.$store.dispatch('setInstapaper', JSON.stringify(this.instapaper))
        this.instapaper_connected = true
      }).catch(() => {
        this.instapaper_error = true
      })
    },
    deleteAllData () {
      db.deleteAllData().then(() => {
        this.$store.dispatch('loadCategories')
        this.$store.dispatch('loadFeeds')
        this.$store.dispatch('loadArticles')
        this.hideModal()
      })
    },
    handleFeverConnect (data) {
      this.fever_connected = data
    },
    handleInoreaderConnect (data) {
      this.inoreader_connected = data
    },
    handleFeedbinConnect (data) {
      this.feedbin_connected = data
    },
    handleSync (data) {
      this.showSync = data
    },
    handleSelfHostConnect (data) {
      this.selfhost_connected = data
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
