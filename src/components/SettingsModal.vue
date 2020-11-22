<template>
  <b-modal
    id="settings"
    ref="settings"
    title="Settings"
    hide-footer
    scrollable
    centered
  >
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
    <h5>Proxy Settings</h5>
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
      Apply proxy & restart
    </b-button>
  </b-modal>
</template>
<script>
import setTheme from '../mixins/setTheme'
export default {
  mixins: [
    setTheme
  ],
  data () {
    return {
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
      this.$refs.settings.hide()
    },
    applyProxy () {
      this.$store.dispatch('setProxy', this.proxy)
      this.$electron.remote.app.relaunch()
      this.$electron.remote.app.exit(0)
    }
  }
}
</script>
