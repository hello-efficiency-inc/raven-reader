import Vue from 'vue'
import SubscribeModal from './SubscribeModal'
import SubscribeToolbar from './SubscribeToolbar'
import AppIcon from './AppIcon'
import ArticleToolbar from './ArticleToolbar'
import ArticleDetail from './ArticleDetail'
import ArticleList from './ArticleList'
import ArticleListItem from './ArticleListItem'
import BouncingLoader from './BouncingLoader'
import ImportModal from './ImportModal'
import MarkReadModal from './MarkReadModal'
import EditFeedModal from './EditFeed'
import EditCategoryModal from './EditCategory'
import FeedMix from './FeedMix'
import MenuItems from './MenuItems'
import Subscriptions from './Subscriptions'
import PreferenceWindow from './PreferenceWindowModal'

export default {
  registerComponents () {
    Vue.component('SubscribeToolbar', SubscribeToolbar)
    Vue.component('SubscribeModal', SubscribeModal)
    Vue.component('FeatherIcon', AppIcon)
    Vue.component('ArticleList', ArticleList)
    Vue.component('ArticleItem', ArticleListItem)
    Vue.component('ArticleToolbar', ArticleToolbar)
    Vue.component('ArticleDetail', ArticleDetail)
    Vue.component('Loader', BouncingLoader)
    Vue.component('ImportModal', ImportModal)
    Vue.component('MarkallreadModal', MarkReadModal)
    Vue.component('FeedMix', FeedMix)
    Vue.component('EditFeed', EditFeedModal)
    Vue.component('EditCategory', EditCategoryModal)
    Vue.component('MenuItems', MenuItems)
    Vue.component('Subscriptions', Subscriptions)
    Vue.component('PreferenceWindow', PreferenceWindow)
  }
}
