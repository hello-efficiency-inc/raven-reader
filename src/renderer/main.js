import Vue from 'vue'
import axios from 'axios'
import VueAwesome from 'vue-awesome'
import {remote} from 'electron'
import jetpack from 'fs-jetpack'
import fs from 'fs'

import App from './App'
import router from './router'
import store from './store'

Vue.component('icon', VueAwesome)

const useDataDir = jetpack.cwd(remote.app.getAppPath()).cwd(remote.app.getPath('userData'))

const dirFav = jetpack.exists(useDataDir.path('favicons'))
const dirStreams = jetpack.exists(useDataDir.path('streams'))

if (!dirStreams) {
  fs.mkdir(useDataDir.path('streams'))
}

if (!dirFav) {
  fs.mkdir(useDataDir.path('favicons'))
}

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
