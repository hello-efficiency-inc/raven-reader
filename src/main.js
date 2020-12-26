import Vue from 'vue'
import axios from 'axios'
import BootstrapVue from 'bootstrap-vue'
import PerfectScrollbar from 'vue2-perfect-scrollbar'
import SocialSharing from 'vue-social-sharing'
import Toasted from 'vue-toasted'
import vClickOutside from 'v-click-outside'
import vueTopprogress from 'vue-top-progress'
import VueContext from 'vue-context'
import VuePlyr from 'vue-plyr'
import App from './App.vue'
import router from './router'
import store from './store'
import Register from './components/register'

import './external_links.js'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import 'vue2-perfect-scrollbar/dist/vue2-perfect-scrollbar.css'
import 'vue-plyr/dist/vue-plyr.css'

Vue.config.productionTip = false

// // nodejs global proxy
const proxy = window.electronstore.getProxySettings()
if (proxy) {
  if (proxy.http) {
    process.env.http_proxy = proxy.http
  }
  if (proxy.https) {
    process.env.https_proxy = proxy.https
  }
  window.globalagent.createGlobalProxyAgent({
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
Vue.use(vClickOutside)
Vue.use(VuePlyr)
Vue.use(vueTopprogress)
Vue.use(VueContext)

Register.registerComponents()

Vue.http = Vue.prototype.$http = axios

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
