<template>
<b-modal id="feedbin" ref="feedbin" title="Add Feedbin"  hide-footer centered>
    <b-form @submit.prevent="onSubmit" @reset="onReset">
       <b-alert show variant="danger" v-if="error">{{ errorMessage }}</b-alert>  
      <b-form-group
        id="email-group"
        label="Email"
        label-for="input-1"
      >
        <b-form-input
          id="email"
          v-model="form.email"
          type="email"
          required
          placeholder="Enter email"
        ></b-form-input>
      </b-form-group>

      <b-form-group id="password-group" label="Password" label-for="input-3">
        <b-form-input
          id="password"
          v-model="form.password"
          type="password"
          required
          placeholder="Enter password"
        ></b-form-input>
      </b-form-group>

      <b-button type="submit" variant="primary">Sign in</b-button>
    </b-form>
</b-modal>
</template>
<script>
import axios from 'axios'
import { encrypt } from '../services/encryption'
import { syncFeedbin } from '../services/feedbin'

export default {
  data () {
    return {
      form: {
        email: null,
        password: null
      },
      error: false,
      errorMessage: null
    }
  },
  methods: {
    onSubmit () {
      const self = this
      axios.get('https://api.feedbin.com/v2/authentication.json', {
        auth: {
          username: this.form.email,
          password: this.form.password
        }
      }).then((res) => {
        self.error = false
        self.$store.dispatch('addAccount', {
          type: 'feedbin',
          server: null,
          email: self.form.email,
          password: encrypt(self.form.password),
          access_token: null
        })
        syncFeedbin()
        self.$refs.feedbin.hide()
      }).catch((error) => {
        if (error) {}
        self.error = true
        self.errorMessage = 'Invalid email or password'
      })
    },
    onReset (evt) {
      evt.preventDefault()
      this.form.email = ''
      this.form.password = ''
    }
  }
}
</script>