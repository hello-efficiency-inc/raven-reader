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
        aria-label="Connect Feedbin"
        class="float-right"
        squared
      >
        Connect
      </b-button>
      <b-button
        v-if="connected"
        aria-label="Edit Feedbin"
        variant="primary"
        class="float-right ml-2"
        squared
        @click="editFeedbin"
      >
        Edit
      </b-button>
      <b-button
        v-if="connected"
        aria-label="Disconnect Feedbin"
        class="float-right"
        variant="danger"
        @click="disconnectFeedbin"
      >
        Disconnect
      </b-button>
    </div>
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
          placeholder="Enter endpoint"
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
            this.$refs.preference.hide()
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
        this.hideFeedbinModal()
        this.$store.dispatch('setFeedbin', JSON.stringify(this.feedbin)).then(() => {
          this.$emit('feedbin-connected', true)
          this.$emit('feedbin-sync', true)
          const promise = Promise.all([
            feedbin.getUnreadEntries(this.feedbin),
            feedbin.getStarredEntries(this.feedbin),
            feedbin.getEntries(this.feedbin)
          ])
          promise.then((res) => {
            const [unread, starred, entries] = res
            const mapped = feedbin.transformEntriesAndFeed(unread, starred, entries)
            feedbin.syncItems(this.$store.state.Setting.feedbin, mapped).then(() => {
              this.$store.dispatch('loadFeeds')
              this.$store.dispatch('loadArticles')
              this.$emit('feedbin-sync', false)
              this.$refs.preference.hide()
            })
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
