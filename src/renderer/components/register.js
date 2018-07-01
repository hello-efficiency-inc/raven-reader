import Vue from 'vue'
import SubscribeModal from './SubscribeModal'
import SubscribeToolbar from './SubscribeToolbar'
import AppIcon from './AppIcon'
import ArticleToolbar from './ArticleToolbar'
import ArticleDetail from './ArticleDetail'
import ArticleList from './ArticleList'
import ArticleListItem from './ArticleListItem'

export default {
  registerComponents () {
    Vue.component('subscribe-toolbar', SubscribeToolbar)
    Vue.component('subscribe-modal', SubscribeModal)
    Vue.component('feather-icon', AppIcon)
    Vue.component('article-list', ArticleList)
    Vue.component('article-item', ArticleListItem)
    Vue.component('article-toolbar', ArticleToolbar)
    Vue.component('article-detail', ArticleDetail)
  }
}
