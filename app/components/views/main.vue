<template>
  <div>
    <div class="dashboard-header">
      <div class="dashboard-content">
        <h2>{{ title }}</h2>
        <div class="manage-feed" v-if="state === 'feed'" v-on:click="deleteFeed(title)">
          <i class="fa fa-fw fa-trash-o" aria-hidden="true"></i>
        </div>
        <label for="searchbar">
          <input type="text" id="searchbar" class="telescope" placeholder="Search" v-model="searchQuery">
          <i class="fa fa-search"></i>
        </label>
        <div class="manage-feed">
          Mark all as read <i class="fa fa-fw fa-check" aria-hidden="true"></i>
        </div>
        <div class="manage-feed" v-on:click="manageFeed()">
          <i class="fa fa-fw fa-lg fa-cog"></i>
        </div>
      </div>
    </div>
    <div class="dashboard-articles">
      <articlelist :filterquery="searchQuery" :state="state" :title="title" :selectedarticle.sync="articleItem"></articlelist>
    </div>
    <div class="dashboard-article-detail">
      <articledetail :articledetails="articleItem"></articledetail>
    </div>
  </div>
</template>
<script>
import { removeFeed, removeArticle } from '../../vuex/actions'
import {remote} from 'electron'
import jetpack from 'fs-jetpack'
import _ from 'lodash'
const useDataDir = jetpack.cwd(remote.app.getPath('userData') + '/streams/')

export default {
  vuex: {
    getters: {
      feeds: state => state.feeds,
      articles: state => state.articles
    },
    actions: {
      removeFeed,
      removeArticle
    }
  },
  route: {
    data ({ to }) {
      if (to.params.type === 'feed') {
        this.title = to.params.name
        this.state = 'feed'
      } else if (to.params.type === 'article' && to.params.name === 'read') {
        this.state = 'read'
        this.title = 'Read Articles'
      } else if (to.params.type === 'article' && to.params.name === 'unread') {
        this.state = 'unread'
        this.title = 'Unread Articles'
      } else if (to.params.type === 'article' && to.params.name === 'favourites') {
        this.state = 'favourites'
        this.title = 'Favourites'
      } else {
        this.title = 'All Articles'
        this.state = 'all'
      }
    }
  },
  data () {
    return {
      queryData: '',
      articleItem: '',
      count: '',
      title: '',
      state: ''
    }
  },
  computed: {
    getFeed () {
      if (this.state === 'feed') {
        let foundfeed = _.filter(this.feeds, { 'title': this.title })
        return foundfeed[0]
      }
    },
    getArticles () {
      let articlesdata
      if (this.state === 'feed') {
        let foundarticle = _.filter(this.articles, { 'feed': this.title })
        articlesdata = _.sortBy(foundarticle, ['pubDate', 'desc'])
      }
      return articlesdata
    }
  },
  methods: {
    deleteFeed (title) {
      let self = this
      self.removeFeed(this.getFeed._id)
      this.getArticles.forEach(item => {
        jetpack.remove(useDataDir.path(item.file))
        self.removeArticle(item._id)
      })
      return this.$route.router.go({path: '/', replace: true})
    }
  }
}
</script>
