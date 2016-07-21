<template>
  <div class="dashboard">
    <div class="dashboard-sidebar">
      <div class="sidebar-header">
        <h3 class="sidebar-header-text">Articles</h3>
      </div>
      <ul class="dashboard-list">
        <li class="dashboard-list-item" v-on:click="allArticles()">
          <i class="fa fa-fw fa-list"></i> All
        </li>
        <!-- <li class="dashboard-list-item" v-on:click="tags()">
          <i class="fa fa-fw fa-tags"></i> Tags
        </li> -->
        <li class="dashboard-list-item" v-on:click="favourites()">
          <i class="fa fa-fw fa-star-o"></i> Favourites
        </li>
        <li class="dashboard-list-item" v-on:click="readArticles()">
          <i class="fa fa-fw fa-check"></i> Read Articles
        </li>
        <li class="dashboard-list-item" v-on:click="unreadArticles()">
          <i class="fa fa-fw fa-history"></i> Unread Articles
        </li>
      </ul>
      <div class="sidebar-header">
        <h3 class="sidebar-header-text">Feeds</h3>
        <button v-bind:disabled="offline" @click="showModal = true" class="btn-add-feed" type="button"><i class="fa fa-plus"></i></button>
      </div>
      <ul class="dashboard-list">
        <li v-on:click="goFeed(feed.orgtitle ? feed.orgtitle : feed.title)" v-for="feed in feeds" class="dashboard-list-item">
          <img v-if="feed.favicon !== null" v-bind:src="feed.favicon" width="20" height="20" alt="{{ feed.title }}"/>
          <i class="fa fa-fw fa-rss" v-if="feed.favicon === null"></i>
          {{ feed.title }}
          <span class="tagged-count">{{ feed.count }}</span>
        </li>
      </ul>
    </div>
  </div>
  <v-modal :show.sync="showModal">
    <h3 slot="header">Add Article</h3>
    <p slot="body">Type or copy/paste link to website you want to subscribe to (It could b URL to entire site, or direct link to RSS file).</p>
    <div slot="body" class="add-feed-input">
      <input v-bind:disabled="offline" type="url" class="form-control" v-model="feedurl" v-on:keyup.enter="addFeedData()" placeholder="Put link here">
    </div>
    <div slot="body" v-if="offline" class="alert danger">
      <p>You're currently offline</p>
    </div>
    <div slot="body" v-if="alertmessage" class="alert danger">
      <p>{{ alertmessage }}</p>
    </div>
    <p slot="footer">
      <button v-bind:disabled="offline || processed" type="button" class="add-button" @click="addFeedData()">Add</button>
      <button type="button" class="add-button" @click="showModal = false">Cancel</button>
    </p>
  </v-modal>
</template>
<script>
import Feed from '../../helpers/feeds'
import Favicon from '../../helpers/favicon'
import queue from '../../helpers/queue'
import service from '../../helpers/services'
import { addArticles, addFeed } from '../../vuex/actions'
import _ from 'lodash'
import async from 'async'

export default {
  vuex: {
    getters: {
      offline: state => state.offline,
      feeds: state => state.feeds
    },
    actions: {
      addArticles,
      addFeed
    }
  },
  computed: {
    feedData () {
      return this.feeds.map(item => {
        if (item.title.length >= 20) {
          item.origtitle = item.title
        }
        item.title = _.truncate(item.title, { length: 20 })
        return item
      })
    }
  },
  data () {
    return {
      feedurl: '',
      alertmessage: '',
      showModal: false,
      processed: false
    }
  },
  methods: {
    allArticles () {
      return this.$route.router.go({path: '/', replace: true})
    },
    tags () {
      return this.$route.router.go({path: '/tags', replace: true})
    },
    favourites () {
      return this.$route.router.go({path: '/article/favourites'})
    },
    goFeed (title) {
      return this.$route.router.go({path: '/feed/' + title})
    },
    readArticles () {
      return this.$route.router.go({path: '/article/read'})
    },
    unreadArticles () {
      return this.$route.router.go({path: '/article/unread'})
    },
    fetchFeed (callback) {
      let feed = new Feed(this.feedurl)
      feed.init().then(result => {
        if (result === null) {
          let error = 'Sorry. I couldn\'t figure out any RSS feed on this address. Try to find link to RSS feed on that site by yourself and paste it here.'
          callback(error)
        } else {
          callback(null, result)
        }
      }, err => {
        if (err) {}
        let error = 'Sorry. Unfortunately this website is not supported.'
        callback(error)
      })
    },
    checkFeed (data, callback) {
      service.checkFeed(data.meta.title, count => {
        if (count === 0) {
          callback(null, data)
        } else {
          callback('Feed exists')
        }
      })
    },
    fetchIcon (data, callback) {
      let favicon = new Favicon(data.meta.link)
      favicon.init().then(result => {
        let path
        if (result !== null) {
          path = queue.queueTask('favicon', result)
        } else {
          path = null
        }
        data.meta.favicon = path
        data.meta.count = data.articles.length
        callback(null, data)
      })
    },
    addFeedItem (data, callback) {
      this.addFeed(data.meta, result => {
        data.meta = result
        callback(null, data)
      })
    },
    addArticleItems (data, callback) {
      data.articles.map(item => {
        let htmlFilename = queue.queueTask('html', item.link)
        item.feed = data.meta.title
        item.feed_id = data.meta._id
        item.file = htmlFilename
        item.favicon = data.meta.favicon
        return item
      })
      this.addArticles(data.articles)
      callback(null, 'done')
    },
    addFeedData () {
      let self = this
      this.processed = true
      async.waterfall([
        this.fetchFeed,
        this.checkFeed,
        this.fetchIcon,
        this.addFeedItem,
        this.addArticleItems
      ], (err, result) => {
        if (!err) {
          self.processed = false
          self.showModal = false
          this.feedurl = ''
        } else {
          self.alert = true
          self.alertmessage = err
          self.processed = false
        }
      })
    }
  }
}
</script>
