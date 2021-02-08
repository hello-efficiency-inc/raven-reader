<template>
  <div class="row mb-4">
    <div class="col">
      <p class="text-left font-bold">
        Feedbin
      </p>
    </div>
    <div class="col">
      <b-button
        v-if="!connected"
        v-b-modal.feedbin
        :disabled="serviceConnected"
        variant="primary"
        :aria-label="getTranslatedLabel('Connect Feedbin')"
        class="float-right"
        squared
      >
        {{ $t('Connect') }}
      </b-button>
      <b-button
        v-if="connected"
        :aria-label="getTranslatedLabel('Edit Feedbin')"
        variant="primary"
        class="float-right ml-2"
        squared
        @click="editFeedbin"
      >
        {{ $t('Edit') }}
      </b-button>
      <b-button
        v-if="connected"
        :aria-label="getTranslatedLabel('Disconnect Feedbin')"
        class="float-right"
        variant="danger"
        @click="disconnectFeedbin"
      >
        {{ $t('Disconnect') }}
      </b-button>
    </div>
    <b-modal
      id="feedbin"
      ref="feedbinLogin"
      :title="getTranslatedLabel('Log into Feedbin')"
      centered
      @hidden="onHiddenFeedbin"
    >
      <b-alert
        :show="feedbin_error"
        variant="danger"
      >
        {{ $t('Invalid credentials') }}
      </b-alert>
      <b-form-group id="input-group-1">
        <b-form-input
          id="input-1"
          v-model="feedbin.endpoint"
          type="email"
          required
          :placeholder="getTranslatedLabel('Enter endpoint')"
        />
      </b-form-group>
      <b-form-group id="input-group-1">
        <b-form-input
          id="input-1"
          v-model="feedbin.email"
          type="email"
          required
          :placeholder="getTranslatedLabel('Enter email')"
        />
      </b-form-group>
      <b-form-group id="input-group-1">
        <b-form-input
          id="input-1"
          v-model="feedbin.password"
          type="password"
          required
          :placeholder="getTranslatedLabel('Enter password')"
        />
      </b-form-group>
      <div slot="modal-footer">
        <button
          type="button"
          class="btn btn-secondary mr-2"
          @click="hideFeedbinModal"
        >
          {{ $t('Cancel') }}
        </button>
        <button
          type="button"
          class="btn btn-primary"
          @click="loginFeedbin"
        >
          {{ $t('Login') }}
        </button>
      </div>
    </b-modal>
  </div>
</template>
<script>
import db from '../services/db'
import feedbin from '../services/feedbin'
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
  data () {
    return {
      feedbin_error: false,
      feedbin: {
        endpoint: 'https://api.feedbin.com/v2/',
        email: null,
        password: null
      }
    }
  },
  methods: {
    getTranslatedLabel (val) {
      return this.$options.filters.t(val)
    },
    onHiddenFeedbin () {
      this.feedbin.email = null
      this.feedbin.password = null
    },
    hideFeedbinModal () {
      this.$refs.feedbinLogin.hide()
    },
    editFeedbin () {
      this.feedbin = this.$store.state.Setting.feedbin
      this.$refs.feedbinLogin.show()
    },
    disconnectFeedbin () {
      db.deleteAllSyncAccountSubscriptions('feedbin').then(() => {
        db.deleteArticlesSyncAccount('feedbin').then(() => {
          this.$store.dispatch('unsetFeedbin').then(() => {
            this.$store.dispatch('loadSettings')
            this.$store.dispatch('loadFeeds')
            this.$store.dispatch('loadArticles')
            this.$emit('feedbin-connected', false)
            this.$emit('preference-modal-hide')
          })
        })
      })
    },
    loginFeedbin () {
      this.feedbin_error = false
      const creds = `${this.feedbin.email}:${this.feedbin.password}`
      const headers = new Headers()
      headers.set('Authorization', `Basic ${btoa(creds)}`)
      headers.set('Content-Type', 'application/json; charset=utf-8')
      fetch(`${this.feedbin.endpoint}authentication.json`, {
        method: 'GET',
        headers: headers
      }).then(() => {
        this.$store.dispatch('setFeedbin', JSON.stringify(this.feedbin)).then(() => {
          this.hideFeedbinModal()
          this.$emit('feedbin-connected', true)
          this.$emit('feedbin-sync', true)
          feedbin.syncItems(JSON.parse(this.$store.state.Setting.feedbin)).then(() => {
            this.$store.dispatch('loadFeeds')
            this.$store.dispatch('loadArticles')
            this.$emit('feedbin-sync', false)
            this.$emit('preference-modal-hide')
          })
          this.$store.dispatch('loadSettings')
        })
      }).catch(() => {
        this.feedbin_error = true
      })
    }
  }
}
</script>
