<template>
  <div>
    <div class="main-splash">
      <div>
        <div
          v-if="loading"
          class="lds-ripple"
        >
          <div /><div />
        </div>
        <div v-if="!loading">
          <img
            id="logo"
            key="mainpage"
            src="static/raven-logo.svg"
            alt="Raven Reader"
          >
          <p>All your articles in one place. Beautiful.</p>
          <p>Please enter license key to get started.</p>
          <div class="form-group">
            <b-form-input
              id="email"
              v-model.trim="licenseKey"
              type="text"
              :state="licenseError"
              aria-describedby="license licenseFeedback"
              placeholder="License Key"
              required
            />
            <b-form-invalid-feedback id="licenseFeedback">
              {{ licenseErrorMessage }}
            </b-form-invalid-feedback>
          </div>
          <p class="text-center">
            <button
              class="btn btn--brand"
              tag="button"
              @click="submitLicenseKey"
            >
              Submit
            </button>
          </p>
          <p class="text-center">
            Don't have license key? <a
              href="https://gum.co/ravenreader"
              class="js-external-link"
            >Click here</a> to purchase.
          </p>
          <p v-if="$route.query.check">
            <router-link to="/">
              Back to app
            </router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import axios from 'axios'
import crypto from 'crypto'
import { machineIdSync } from 'node-machine-id'
import os from 'os'
import dayjs from 'dayjs'
import { TEST_LICENSE_KEY, API_DOMAIN } from '../config'

export default {
  data () {
    return {
      licenseKey: null,
      licenseError: true,
      licenseKeyExpiring: false,
      licenseExpired: false,
      licenseErrorMessage: null,
      loading: true
    }
  },
  mounted () {
    console.log(this.$route.query.check)
    if (typeof this.$route.query.check === 'undefined') {
      this.checkLicenseKey()
    } else {
      this.loading = false
    }
  },
  methods: {
    async checkLicenseKey () {
      const licenseKey = this.$electronstore.get('license_key')
      if (licenseKey === TEST_LICENSE_KEY) {
        this.$electronstore.set('license_key', licenseKey)
        this.$electron.ipcRenderer.send('license-added')
        this.$router.push('/')
      } else {
        try {
          const checkLicenseKey = await axios.get(`${API_DOMAIN}/license/verify?license_key=${licenseKey}`)
          if (checkLicenseKey.data.data.success) {
            var subscribedAt = dayjs(checkLicenseKey.data.data.purchase.created_at)
            var expiresAt = dayjs(checkLicenseKey.data.data.purchase.created_at).add(1, 'year')
            var days = expiresAt.diff(subscribedAt, 'day')
            this.licenseKeyExpiring = days > 0 && days <= 30
            this.licenseKeyExpired = days === 0
            this.loading = false
            this.$router.push('/')
          } else {
            this.loading = false
          }
        } catch (e) {
          if (!this.$electronstore.get('trial_start') && !this.$electronstore.get('trial_expire')) {
            this.$electronstore.set('trial_start', dayjs().valueOf())
            this.$electronstore.set('trial_expire', dayjs().add(7, 'day').valueOf())
            this.loading = false
            this.$router.push('/')
          } else if (dayjs().unix() < this.$electronstore.get('trial_expire')) {
            this.$router.push('/')
          }
          this.loading = false
        }
      }
    },
    async activateMachine (key, machineId, data) {
      const activateMachine = await axios.post(`${API_DOMAIN}/license/activate`, {
        email: data.purchase.email,
        license_key: key,
        sales_id: data.purchase.id,
        machine_id: machineId,
        product_type: 'Raven Reader',
        platform: os.platform()
      })
      if (activateMachine.data.data.success) {
        this.$electronstore.set('license_key', key)
        this.licenseError = false
        this.$electron.ipcRenderer.send('license-added')
        this.$router.push('/')
      }
    },
    async submitLicenseKey () {
      const machine = machineIdSync({ original: true })
      const machineId = crypto.createHash('sha512').update(machine).digest('hex')
      if (this.licenseKey !== TEST_LICENSE_KEY) {
        var checkLicenseKey = await axios.get(`${API_DOMAIN}/license/verify?license_key=${this.licenseKey}`)
      } else {
        this.$electronstore.set('license_key', this.licenseKey)
        this.licenseError = true
        this.$electron.ipcRenderer.send('license-added')
        this.$router.push('/')
      }
      if (checkLicenseKey.data.data.success) {
        var subscribedAt = dayjs(checkLicenseKey.data.data.purchase.created_at)
        var expiresAt = dayjs(checkLicenseKey.data.data.purchase.created_at).add(1, 'year')
        var days = expiresAt.diff(subscribedAt, 'day')
        this.licenseKeyExpiring = days > 0 && days <= 30
        this.licenseKeyExpired = days === 0

        try {
          const machineVerify = await axios.get(`${API_DOMAIN}/machine/verify?license_key=${this.licenseKey}&machine_id=${machineId}`)
          if (!machineVerify.data.data.exists && machineVerify.data.data.machines < 3) {
            this.activateMachine(this.licenseKey, machineId, checkLicenseKey.data.data)
          } else if (!machineVerify.data.data.exists && machineVerify.data.data.machines === 3) {
            this.licenseErrorMessage = 'License key usage exceeded.'
            this.licenseError = false
          } else {
            this.$electronstore.set('license_key', this.licenseKey)
            this.licenseError = true
            this.$router.push('/')
          }
        } catch (e) {
          this.activateMachine(this.licenseKey, machineId, checkLicenseKey.data.data)
        }
      }
    }
  }
}
</script>
<style lang="scss">
.app-darkmode {
  .main-splash {
    background: rgb(55, 55, 55);
    color: #fff;
  }
  .lds-ripple div {
    border-color: #fff;
  }
}
.main-splash {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-width: 100vw;
  min-height: 100vh;
  .choose-app {
    color: #000;
    font-weight: 800;
  }
  p {
    font-size: 20px;
    color: #000808;
    text-align: center;
    margin-top: 30px;
    margin-bottom: 30px;
  }
}
.lds-ripple {
  display: inline-block;
  position: relative;
  width: 64px;
  height: 64px;
}
.lds-ripple div {
  position: absolute;
  border: 4px solid #000;
  opacity: 1;
  border-radius: 50%;
  animation: lds-ripple 1s cubic-bezier(0, 0.2, 0.8, 1) infinite;
}
.lds-ripple div:nth-child(2) {
  animation-delay: -0.5s;
}
@keyframes lds-ripple {
  0% {
    top: 28px;
    left: 28px;
    width: 0;
    height: 0;
    opacity: 1;
  }
  100% {
    top: -1px;
    left: -1px;
    width: 58px;
    height: 58px;
    opacity: 0;
  }
}

.btn--brand {
  border-radius: 100px !important;
  background-color: #22e3ff !important;
  border-color: #22e3ff !important;
  color: #fff !important;
  text-transform: uppercase;
  padding: 15px 50px !important;
  font-weight: 700 !important;
}
</style>
