import Vue from 'vue'
import axios from 'axios'
import BootstrapVue from 'bootstrap-vue'
import Register from './components/register'
import PerfectScrollbar from 'vue2-perfect-scrollbar'
import SocialSharing from 'vue-social-sharing'
import Toasted from 'vue-toasted'
import {
  createGlobalProxyAgent
} from 'global-agent'

import App from './App'
import router from './router'
import store from './store'
import SettingsStore from 'electron-store'

import './helper/external_links.js'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import 'vue2-perfect-scrollbar/dist/vue2-perfect-scrollbar.css'

// nodejs global proxy
const settingsStore = new SettingsStore()
const proxy = settingsStore.get('settings.proxy') ? settingsStore.get('settings.proxy') : null
if (proxy) {
  if (proxy.http) {
    process.env.http_proxy = proxy.http
  }
  if (proxy.https) {
    process.env.https_proxy = proxy.https
  }
  createGlobalProxyAgent({
    environmentVariableNamespace: '',
    forceGlobalAgent: true
  })
}

// ignore ssl error
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

Vue.use(BootstrapVue)
Vue.use(Toasted)
Vue.use(PerfectScrollbar)
Vue.use(SocialSharing)

Register.registerComponents()

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.prototype.$electronstore = settingsStore
Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app')
