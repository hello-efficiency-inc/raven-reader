<template>
  <b-modal id="settings" ref="settings" title="Settings" hide-footer centered>
    <b-form-group label="Set refresh interval for news feed">
      <b-form-select v-model="cronjob" :options="cron_options" size="sm" @change="saveCronjob"/>
    </b-form-group>
    <b-form-group label="Choose appearance">
      <b-form-select v-model="theme_option" :options="themeOptions" size="sm" @change="saveAppearance" />
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
      theme_option: null,
      darkMode: 'off',
      oldestArticles: 'off',
      cron_options: [
        { value: null, text: 'Please select an option' },
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
        { value: null, text: 'Default' },
        { text: 'Dark', value: 'dark' },
        { text: 'Sunset', value: 'sunset' }
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
    setTheme (themeValue) {
      switch (themeValue) {
        case 'dark':
          this.toggleBodyClass(false, 'app-sunsetmode')
          this.toggleBodyClass(true, 'app-darkmode')
          break
        case 'sunset':
          this.toggleBodyClass(false, 'app-darkmode')
          this.toggleBodyClass(true, 'app-sunsetmode')
          break
        case null:
          this.toggleBodyClass(false, 'app-darkmode')
          this.toggleBodyClass(false, 'app-sunsetmode')
      }
    },
    toggleBodyClass (addClass, className) {
      const el = document.body
      if (addClass) {
        el.classList.add(className)
      } else {
        el.classList.remove(className)
      }
    },
    saveCronjob (cronValue) {
      this.$store.dispatch('setCronJob', cronValue)
      this.$breadstick.notify('Settings for cronjob successfully saved.', {
        position: 'top',
        duration: 3000
      })
      this.hideModal()
    },
    saveSortPreference (sortPreference) {
      this.$store.dispatch('setSortPreference', sortPreference)
      this.$breadstick.notify('Sorting preference changed.', {
        position: 'top',
        duration: 3000
      })
      this.hideModal()
    },
    saveAppearance (theme) {
      this.$store.dispatch('setThemeOption', theme)
      this.setTheme(theme)
      this.$breadstick.notify('Changed appearance settings.', {
        position: 'top',
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
