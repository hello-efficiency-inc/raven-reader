<template>
  <b-modal id="settings" ref="settings" title="Settings" hide-footer centered>
    <b-form-group label="Set refresh interval for news feed">
      <b-form-select v-model="cronjob" :options="cron_options" size="sm" @change="saveCronjob"/>
    </b-form-group>
    <b-form-group label="Oldest articles first">
      <b-form-radio-group id="btnradios1"
      buttons
      button-variant="outline-primary"
      size="sm"
      v-model="oldestArticles"
      :options="options"
      name="sortPref" @input="saveSortPreference"/>
    </b-form-group>
    <b-form-group label="Turn on dark mode">
      <b-form-radio-group id="btnradios2"
      buttons
      button-variant="outline-primary"
      size="sm"
      v-model="darkMode"
      :options="options"
      name="darkTheme" @change="saveAppearance"/>
    </b-form-group>
    <h5>Proxy Settings</h5>
    <b-form-group label="Web Server (HTTP):">
      <b-form-input v-model="proxy.http"
      type="text"></b-form-input>
    </b-form-group>
    <b-form-group label="Secure Web Server (HTTPS):">
      <b-form-input v-model="proxy.https"
      type="text"></b-form-input>
    </b-form-group>
    <b-form-group label="Bypass proxy settings for these hosts & domains:">
      <b-form-textarea v-model="proxy.bypass"
      :rows="3"
      :max-rows="6"></b-form-textarea>
    </b-form-group>
    <b-button @click="applyProxy">Apply proxy & restart</b-button>
  </b-modal>
</template>
<script>
export default {
  data () {
    return {
      cronjob: null,
      darkMode: 'off',
      oldestArticles: 'off',
      cron_options: [
        { value: null, text: 'Please select an option' },
        { value: '* * * * *', text: 'Every minute' },
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
      proxy: {
        http: '',
        https: '',
        bypass: ''
      }
    }
  },
  mounted () {
    this.$store.dispatch('loadSettings')
    this.cronjob = this.$store.state.Setting.cronSettings
    this.darkMode = this.$store.state.Setting.darkMode
    this.oldestArticles = this.$store.state.Setting.oldestArticles
    if (this.$store.state.Setting.proxy) {
      this.proxy.http = this.$store.state.Setting.proxy.http
      this.proxy.https = this.$store.state.Setting.proxy.https
      this.proxy.bypass = this.$store.state.Setting.proxy.bypass
    }
  },
  methods: {
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
    saveAppearance (darkMode) {
      this.$store.dispatch('setDarkMode', darkMode)
      this.$toasted.show('Changed appearance settings to dark mode.', {
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
