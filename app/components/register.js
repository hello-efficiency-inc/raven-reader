import Vue from 'vue'
import Sidebar from './partials/sidebar.vue'
import ArticleDetail from './partials/articledetail.vue'
import Modal from './partials/modal.vue'
import PulseLoader from 'vue-spinner/src/PulseLoader'
import { Multiselect } from 'vue-multiselect'

export default {
  registerAllGlobalComponents () {
    Vue.component('sidebar', Sidebar)
    Vue.component('v-modal', Modal)
    Vue.component('articledetail', ArticleDetail)
    Vue.component(PulseLoader)
    Vue.component('multiselect', Multiselect)
  }
}
