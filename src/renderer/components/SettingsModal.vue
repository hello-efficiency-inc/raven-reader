<template>
  <b-modal id="settings" ref="settings" title="Settings" centered>
    <b-form-group label="Set refresh interval for news feed">
      <b-form-select v-model="cronjob" :options="cron_options" size="sm" />
    </b-form-group>
    <b-form-group label="Turn on dark mode">
    <b-form-radio-group id="btnradios2"
                        buttons
                        button-variant="outline-primary"
                        size="sm"
                        v-model="darkMode"
                        :options="options"
                        name="darkTheme"/>
  </b-form-group>
    <div slot="modal-footer">
      <button type="button" class="btn btn-secondary" @click="hideModal">Close</button>
    </div>
  </b-modal>
</template>
<script>
export default {
  data () {
    return {
      cronjob: null,
      darkMode: false,
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
        { text: 'On', value: true },
        { text: 'Off', value: false }
      ]
    }
  },
  mounted () {
    this.cronjob = this.$store.state.Setting.cronSettings
    this.darkMode = this.$store.state.Setting.darkMode
  },
  watch: {
    cronjob (newCron) {
      this.$store.dispatch('setCronJob', newCron)
      this.$toast('Settings for cronjob successfully saved.', {
        className: 'et-info',
        horizontalPosition: 'center'
      })
      this.hideModal()
    },
    darkMode (newMode) {
      this.$store.dispatch('setDarkMode', newMode)
      this.$toast('Changed appearance settings to dark mode', {
        className: 'et-info',
        horizontalPosition: 'center'
      })
      this.hideModal()
    }
  },
  methods: {
    hideModal () {
      this.$refs.settings.hide()
    }
  }
}
</script>
