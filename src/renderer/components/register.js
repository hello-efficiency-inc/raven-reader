import Vue from 'vue'
import NewsList from './NewsListItem'

export default {
  registerComponents () {
    Vue.component('news-list', NewsList)
  }
}
