<template>
  <div class="row">
    <div class="col">
      <p class="text-left font-bold">
        Fever
      </p>
    </div>
    <div class="col">
      <b-button
        v-if="!connected"
        v-b-modal.fever
        variant="primary"
        aria-label="Connect Fever"
        class="float-right"
        squared
        :disabled="serviceConnected"
      >
        Connect
      </b-button>
      <b-button
        v-if="connected"
        aria-label="Disconnect Fever"
        class="float-right"
        variant="danger"
        @click="disconnectFever"
      >
        Disconnect
      </b-button>
    </div>
    <b-modal
      id="fever"
      ref="feverLogin"
      title="Log into Fever"
      centered
      @hidden="onHiddenFever"
    >
      <b-alert
        :show="fever_error"
        variant="danger"
      >
        Invalid credentials
      </b-alert>
      <b-form-group id="input-group-1">
        <b-form-input
          id="input-1"
          v-model="fever.endpoint"
          type="email"
          required
          placeholder="Enter endpoint"
        />
      </b-form-group>
      <b-form-group id="input-group-1">
        <b-form-input
          id="input-1"
          v-model="fever.username"
          type="text"
          required
          placeholder="Enter username"
        />
      </b-form-group>
      <b-form-group id="input-group-1">
        <b-form-input
          id="input-1"
          v-model="fever.password"
          type="password"
          required
          placeholder="Enter password"
        />
      </b-form-group>
      <div slot="modal-footer">
        <button
          type="button"
          class="btn btn-secondary mr-2"
          @click="hideFeverModal"
        >
          Cancel
        </button>
        <button
          type="button"
          class="btn btn-primary"
          @click="loginFever"
        >
          Login
        </button>
      </div>
    </b-modal>
  </div>
</template>
<script>
import md5 from 'md5'
import axios from 'axios'
import db from '../services/db'
import fever from '../services/fever'

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
      fever_error: false,
      fever: {
        endpoint: null,
        username: null,
        password: null,
        hash: null
      }
    }
  },
  methods: {
    onHiddenFever () {
      this.fever.endpoint = null
      this.fever.username = null
      this.fever.password = null
    },
    hideFeverModal () {
      this.$refs.feverLogin.hide()
    },
    disconnectFever () {
      db.deleteAllSyncAccountSubscriptions('fever').then(() => {
        db.deleteArticlesSyncAccount('fever').then(() => {
          this.$store.dispatch('unsetFever').then(() => {
            db.deleteCategoryBySource('fever').then(() => {
              this.$store.dispatch('loadSettings')
              this.$store.dispatch('loadCategories')
              this.$store.dispatch('loadFeeds')
              this.$store.dispatch('loadArticles')
              this.$emit('fever-connected', false)
              this.$emit('preference-modal-hide')
            })
          })
        })
      })
    },
    loginFever () {
      this.fever_error = false
      const formData = new FormData()
      const hash = md5(`${this.fever.username}:${this.fever.password}`)
      formData.append('api_key', hash)
      const data = JSON.parse(JSON.stringify(this.fever))
      data.hash = hash
      axios.post(`${this.fever.endpoint}?api`, formData)
        .then(async (res) => {
          if (!res.data.auth) {
            this.fever_error = true
          } else {
            this.$store.dispatch('setFever', data).then(() => {
              this.hideFeverModal()
              this.$emit('fever-connected', true)
              this.$emit('fever-sync', true)
              fever.syncItems(data).then(() => {
                this.$store.dispatch('loadFeeds')
                this.$store.dispatch('loadArticles')
                this.$emit('fever-sync', false)
                this.$emit('preference-modal-hide')
              })
            })
          }
        })
    }
  }
}
</script>
