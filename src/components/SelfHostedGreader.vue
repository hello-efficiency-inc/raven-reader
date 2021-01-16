<template>
  <div class="row">
    <div class="col">
      <p class="text-left font-bold">
        Self-hosted (Google Reader API)
      </p>
    </div>
    <div class="col">
      <b-button
        v-if="!connected"
        v-b-modal.greader
        variant="primary"
        aria-label="Connect Inoreader"
        class="float-right"
        squared
        :disabled="serviceConnected"
      >
        Connect
      </b-button>
      <b-button
        v-if="connected"
        aria-label="Disconnect Inoreader"
        class="float-right"
        variant="danger"
        @click="disconnectSelfhost"
      >
        Disconnect
      </b-button>
    </div>
    <b-modal
      id="greader"
      ref="greaderLogin"
      title="Log into Self Hosted RSS Service"
      centered
      @hidden="onHiddenSelfhost"
    >
      <b-alert
        :show="selfhost_error"
        variant="danger"
      >
        Invalid credentials
      </b-alert>
      <b-form-group id="input-group-1">
        <b-form-input
          id="input-1"
          v-model="selfhosted.endpoint"
          type="email"
          required
          placeholder="Enter endpoint"
        />
      </b-form-group>
      <b-form-group id="input-group-1">
        <b-form-input
          id="input-1"
          v-model="selfhosted.username"
          type="text"
          required
          placeholder="Enter username"
        />
      </b-form-group>
      <b-form-group id="input-group-1">
        <b-form-input
          id="input-1"
          v-model="selfhosted.password"
          type="password"
          required
          placeholder="Enter password"
        />
      </b-form-group>
      <div slot="modal-footer">
        <button
          type="button"
          class="btn btn-secondary mr-2"
          @click="hideSelfhostModal"
        >
          Cancel
        </button>
        <button
          type="button"
          class="btn btn-primary"
          @click="loginSelfHost"
        >
          Login
        </button>
      </div>
    </b-modal>
  </div>
</template>
<script>
import axios from 'axios'
import db from '../services/db'
import greader from '../services/greader'

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
      selfhost_error: false,
      selfhosted: {
        endpoint: null,
        username: null,
        password: null
      }
    }
  },
  methods: {
    onHiddenSelfhost () {
      this.selfhosted.endpoint = null
      this.selfhosted.username = null
      this.selfhosted.password = null
    },
    hideSelfhostModal () {
      this.$refs.greaderLogin.hide()
    },
    disconnectSelfhost () {
      db.deleteAllSyncAccountSubscriptions('greader').then(() => {
        db.deleteArticlesSyncAccount('greader').then(() => {
          this.$store.dispatch('unsetSelfhost').then(() => {
            db.deleteCategoryBySource('greader').then(() => {
              this.$store.dispatch('loadSettings')
              this.$store.dispatch('loadCategories')
              this.$store.dispatch('loadFeeds')
              this.$store.dispatch('loadArticles')
              this.$emit('selfhost-connected', false)
              this.$emit('preference-modal-hide')
            })
          })
        })
      })
    },
    loginSelfHost () {
      this.selfhost_error = false
      const urlencoded = new URLSearchParams()
      urlencoded.append('Email', this.selfhosted.username)
      urlencoded.append('Passwd', this.selfhosted.password)
      axios.post(`${this.selfhosted.endpoint}/accounts/ClientLogin`, urlencoded)
        .then(async (res) => {
          const matches = res.data.match(/Auth=(\S+)/)
          const data = JSON.parse(JSON.stringify(this.selfhosted))
          data.auth = matches[1]
          data.userinfo = await greader.getUserInfo(data)
          this.$store.dispatch('setSelfhost', data).then(() => {
            this.hideSelfhostModal()
            this.$emit('selfhost-connected', true)
            this.$emit('selfhost-sync', true)
            greader.syncItems(data).then(() => {
              this.$store.dispatch('loadCategories')
              this.$store.dispatch('loadFeeds')
              this.$store.dispatch('loadArticles')
              this.$emit('selfhost-sync', false)
              this.$emit('preference-modal-hide')
            })
          })
        }).catch(() => {
          this.selfhost_error = true
        })
    }
  }
}
</script>
