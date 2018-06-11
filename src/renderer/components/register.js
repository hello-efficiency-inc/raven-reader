import Vue from 'vue'
import SubscribeModal from './SubscribeModal'
import SubscribeToolbar from './SubscribeToolbar'
import AppIcon from './AppIcon'
import ArticleSearch from './ArticleSearch'
import ArticleDetail from './ArticleDetail'
import ArticleList from './ArticleList'

export default {
  registerComponents () {
    Vue.component('subscribe-toolbar', SubscribeToolbar)
    Vue.component('subscribe-modal', SubscribeModal)
    Vue.component('feather-icon', AppIcon)
    Vue.component('article-search', ArticleSearch)
    Vue.component('article-list', ArticleList)
    Vue.component('article-detail', ArticleDetail)
  }
}
