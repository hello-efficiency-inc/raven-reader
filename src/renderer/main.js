import Vue from 'vue'
import axios from 'axios'
import Toast from 'vue-easy-toast'
import BootstrapVue from 'bootstrap-vue'
import Register from './components/register'

import App from './App'
import router from './router'
import store from './store'

import './helper/external_links.js'
import 'bootstrap-vue/dist/bootstrap-vue.css'

Vue.use(BootstrapVue)
Vue.use(Toast)

Register.registerComponents()

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
