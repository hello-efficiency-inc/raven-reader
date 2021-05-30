<template>
  <div class="row mb-4">
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
        :aria-label="getTranslatedLabel('Connect Self-hosted (Google Reader API)')"
        class="float-right"
        squared
        :disabled="serviceConnected"
      >
        {{ $t('Connect') }}
      </b-button>
      <b-button
        v-if="connected"
        :aria-label="getTranslatedLabel('Disconnect Self-hosted (Google Reader API)')"
        class="float-right"
        variant="danger"
        @click="disconnectSelfhost"
      >
        {{ $t('Disconnect') }}
      </b-button>
    </div>
    <b-modal
      id="greader"
      ref="greaderLogin"
      :title="getTranslatedLabel('Log into Self Hosted RSS Service')"
      centered
      @hidden="onHiddenSelfhost"
    >
      <b-alert
        :show="selfhost_error"
        variant="danger"
      >
        {{ $t('Invalid credentials') }}
      </b-alert>
      <b-form-group id="input-group-1">
        <b-form-input
          id="input-1"
          v-model="selfhosted.endpoint"
          type="email"
          required
          :placeholder="getTranslatedLabel('Enter endpoint')"
        />
      </b-form-group>
      <b-form-group id="input-group-1">
        <b-form-input
          id="input-1"
          v-model="selfhosted.username"
          type="text"
          required
          :placeholder="getTranslatedLabel('Enter username')"
        />
      </b-form-group>
      <b-form-group id="input-group-1">
        <b-form-input
          id="input-1"
          v-model="selfhosted.password"
          type="password"
          required
          :placeholder="getTranslatedLabel('Enter password')"
        />
      </b-form-group>
      <div slot="modal-footer">
        <button
          type="button"
          class="btn btn-secondary mr-2"
          @click="hideSelfhostModal"
        >
          {{ $t('Cancel') }}
        </button>
        <button
          type="button"
          class="btn btn-primary"
          @click="loginSelfHost"
        >
          {{ $t('Login') }}
        </button>
      </div>
    </b-modal>
  </div>
</template>
<script>
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
    getTranslatedLabel (val) {
      return this.$options.filters.t(val)
    },
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
      window.greader.login(`${this.selfhosted.endpoint}/accounts/ClientLogin`, {
        Email: this.selfhosted.username,
        Passwd: this.selfhosted.password
      }).then(async (res) => {
        const matches = res.match(/Auth=(\S+)/)
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
