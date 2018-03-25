import Vue from 'vue'
import axios from 'axios'
import Vuetify from 'vuetify'
import jetpack from 'fs-jetpack'
import fs from 'fs'
import VueTimeago from 'vue-timeago'
import { remote } from 'electron'
import 'vuetify/dist/vuetify.css'

import App from './App'
import router from './router'
import store from './store'
import Register from './components/register'

const useDataDir = jetpack.cwd(remote.app.getAppPath()).cwd(remote.app.getPath('userData'))

const hasStreamDir = jetpack.exists(useDataDir.path('streams'))
const hasFav = jetpack.exists(useDataDir.path('favicons'))

Register.registerComponents()

if (!hasStreamDir) {
  fs.mkdir(useDataDir.path('streams'))
}

if (!hasFav) {
  fs.mkdir(useDataDir.path('favicons'))
}

Vue.use(Vuetify, {
  theme: {
    primary: '#283593',
    secondary: '#1E88E5',
    accent: '#9c27b0',
    error: '#f44336',
    warning: '#ffeb3b',
    info: '#2196f3',
    success: '#4caf50'
  }
})
Vue.use(VueTimeago, {
  name: 'timeago', // component name, `timeago` by default
  locale: 'en-US',
  locales: {
    'en-US': require('vue-timeago/locales/en-US.json')
  }
})
if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app')
