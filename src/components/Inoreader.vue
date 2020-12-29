<template>
  <div class="row mb-4">
    <div class="col">
      <p class="text-left font-bold">
        Inoreader
      </p>
    </div>
    <div class="col">
      <b-button
        v-if="!connected"
        variant="primary"
        aria-label="Connect Inoreader"
        class="float-right"
        squared
        :disabled="serviceConnected"
        @click="signInInoreader"
      >
        Connect
      </b-button>
      <b-button
        v-if="connected"
        aria-label="Disconnect Inoreader"
        class="float-right"
        variant="danger"
        @click="disconnectInoreader"
      >
        Disconnect
      </b-button>
    </div>
  </div>
</template>
<script>
import db from '../services/db'

export default {
  props: {
    connected: {
      type: Boolean,
      default: false
    },
    serviceConnected: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    disconnectInoreader () {
      db.deleteAllSyncAccountSubscriptions('inoreader').then(() => {
        db.deleteArticlesSyncAccount('inoreader').then(() => {
          this.$store.dispatch('unsetInoreader').then(() => {
            this.$store.dispatch('loadSettings')
            this.$store.dispatch('loadFeeds')
            this.$store.dispatch('loadArticles')
            this.$emit('inoreader-connect', false)
            this.$emit('preference-modal-hide')
          })
        })
      })
    },
    signInInoreader () {
      window.electron.loginInoreader()
    }
  }
}
</script>
