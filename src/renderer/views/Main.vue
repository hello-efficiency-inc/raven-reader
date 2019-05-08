<template>
  <div class="app-wrapper" :class="{ 'app-darkmode': $store.state.Setting.darkMode === 'on' }">
    <nav class="bg-light sidebar" v-if="true" ref="sidebar">
      <subscribe-toolbar ref="subscribetoolbar"></subscribe-toolbar>
      <perfect-scrollbar class="sidebar-sticky">
        <ul class="nav flex-column">
          <li class="nav-item">
            <router-link class="nav-link feed-mix-link" to="/all" active-class="active">
              <feed-mix feed-id="allFeeds" mark="allFeeds">
                <feather-icon name="list"></feather-icon>
                All Feeds <span class="sr-only">(current)</span>
                <span class="items-counter" v-if="getArticlesCount('','') > 0">{{ getArticlesCount('','') }}</span>
              </feed-mix>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link feed-mix-link" to="/favourites" active-class="active">
              <feed-mix feed-id="favourites" mark="favourites">
                <feather-icon name="star"></feather-icon>
                Favourites
                <span class="items-counter" v-if="getArticlesCount('favourites','') > 0">{{ getArticlesCount('favourites','') }}</span>
              </feed-mix>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link feed-mix-link" to="/unread" active-class="active">
              <feed-mix feed-id="unreadArticles" mark="unreadArticles">
                <feather-icon name="circle"></feather-icon>
                Unread Articles
                <span class="items-counter" v-if="getArticlesCount('unread', '') > 0">{{ getArticlesCount('unread', '') }}</span>
              </feed-mix>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link feed-mix-link" to="/read" active-class="active">
              <feed-mix feed-id="recentlyRead" mark="recentlyRead">
                <feather-icon name="circle" filled></feather-icon>
                Recently Read
                <span class="items-counter" v-if="getArticlesCount('read', '') > 0">{{ getArticlesCount('read', '') }}</span>
              </feed-mix>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link feed-mix-link" to="/saved" active-class="active">
              <feed-mix feed-id="savedArticles" mark="savedArticles">
                <feather-icon name="wifi-off"></feather-icon>
                Saved articles
                <span class="items-counter" v-if="getArticlesCount('saved', '') > 0">{{ getArticlesCount('saved', '') }}</span>
              </feed-mix>
            </router-link>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#" @click="exportOpml">
              <feather-icon name="external-link"></feather-icon>
              Export Subscriptions
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#" v-b-modal.importfeed>
              <feather-icon name="upload"></feather-icon>
              Import Subscriptions
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#" v-b-modal.markallread ref="markallread">
              <feather-icon name="check-square"></feather-icon>
              Mark all as read
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#" v-b-modal.settings>
              <feather-icon name="settings"></feather-icon>
              Settings
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#" v-b-modal.integrations>
              <feather-icon name="package"></feather-icon>
              Integrations
            </a>
          </li>
        </ul>
        <h6 class="sidebar-heading d-flex justify-content-between align-items-center px-3 mt-4 mb-1 text-muted">
          <span>Subscriptions</span>
        </h6>
        <ul class="nav flex-column">
          <li v-for="feed in mapFeeds(feeds)" class="feed nav-item d-flex justify-content-between align-items-center pr-2" v-bind:key="feed.id"
            mark="feed"
            @click="setActiveFeedId(feed)"
            v-bind:class="{ active: feed.isActive }"
          >
            <router-link v-if="feed" class="nav-link" :to="`/feed/${feed.id}`">
              <img v-if="feed.favicon" :src="feed.favicon" height="16" width="16" class="mr-1">
              <p>feed.id {{ feed.id }}</p>
              <p>feed.isActive {{ feed.isActive }}</p>
            </router-link>
            <button @click="unsubscribeFeed(feed.id)" class="btn btn-link"><feather-icon name="x-circle"></feather-icon></button>
          </li>
        </ul>
      </perfect-scrollbar>
    </nav>
    <article-list :type="articleType" :feed="feed" @type-change="updateType" ref="articleList"></article-list>
    <article-detail :id="$route.params.id" :article="articleData" :emptyState="empty" :loading="loading" ref="articleDetail"></article-detail>
    <import-modal></import-modal>
    <settings-modal></settings-modal>
    <markallread-modal></markallread-modal>
    <sync-settings></sync-settings>
  </div>
</template>
<script>
import db from '../services/db'
import { parseArticle } from '../parsers/article'
import cheerio from 'cheerio'
import dayjs from 'dayjs'
import stat from 'reading-time'
import scheduler from 'node-schedule'
import log from 'electron-log'
import helper from '../services/helpers'
import notifier from 'node-notifier'
import fs from 'fs'
import path from 'path'
import _ from 'lodash'
import cacheService from '../services/cacheArticle'
// import * as Mousetrap from 'Mousetrap'

export default {
  data () {
    return {
      articleData: null,
      articleType: 'all',
      empty: null,
      feed: null,
      loading: false
    }
  },
  beforeRouteUpdate (to, from, next) {
    if (to.params.id) {
      this.$electron.ipcRenderer.send('article-selected')
    }
    next()
  },
  mounted () {
    const self = this
    this.$refs.articleList.$refs.statusMsg.innerText = 'Syncing...'
    this.$store.dispatch('refreshFeeds')
    this.$store.dispatch('loadFeeds')
    this.$store.dispatch('loadArticles')
    this.$store.dispatch('checkOffline')
    if (self.$electronstore.get('inoreader_token')) {
      helper.syncInoReader()
    }

    this.$electron.ipcRenderer.on('Add subscription', (event, args) => {
      self.$refs.subscribetoolbar.$refs.subscribefeed.click()
    })

    this.$electron.ipcRenderer.on('Next item', (event, args) => {
      if (self.$route.params.id) {
        const index = _.findIndex(self.$store.getters.filteredArticles, { '_id': self.$route.params.id })
        if (index !== (self.$store.getters.filteredArticles.length - 1)) {
          const nextArticle = self.$store.getters.filteredArticles[index + 1]
          self.$router.push({ name: 'article-page', params: { id: nextArticle._id } })
        }
      } else {
        self.$router.push({ name: 'article-page', params: { id: self.$store.getters.filteredArticles[0]._id } })
      }
    })

    this.$electron.ipcRenderer.on('Previous item', (event, args) => {
      if (self.$route.params.id) {
        const index = _.findIndex(self.$store.getters.filteredArticles, { '_id': self.$route.params.id })
        if (index > 0) {
          const prevArticle = self.$store.getters.filteredArticles[index - 1]
          self.$router.push({ name: 'article-page', params: { id: prevArticle._id } })
        }
      } else {
        const articleLength = self.$store.getters.filteredArticles.length
        console.log(articleLength)
        self.$router.push({ name: 'article-page', params: { id: self.$store.getters.filteredArticles[articleLength - 1]._id } })
      }
    })

    this.$electron.ipcRenderer.on('Save offline', (events, args) => {
      if (self.$route.params.id) {
        self.$refs.articleDetail.$refs.articleToolbar.$refs.saveoffline.click()
      }
    })

    this.$electron.ipcRenderer.on('Toggle favourite', (events, args) => {
      if (self.$route.params.id) {
        self.$refs.articleDetail.$refs.articleToolbar.markFavourite()
      }
    })

    this.$electron.ipcRenderer.on('Toggle read', (events, args) => {
      if (self.$route.params.id) {
        self.$refs.articleDetail.$refs.articleToolbar.markRead()
      }
    })

    this.$electron.ipcRenderer.on('Mark all read', (events, args) => {
      self.$refs.markallread.click()
    })

    this.$electron.ipcRenderer.on('View in browser', (events, args) => {
      if (self.$route.params.id) {
        self.$refs.articleDetail.$refs.articleToolbar.$refs.openlink.click()
      }
    })

    this.$electron.ipcRenderer.on('onlinestatus', (event, status) => {
      self.$store.dispatch('setOffline', status)
    })

    // Sync Updates
    scheduler.scheduleJob('*/5 * * * *', async function () {
      if (typeof self.$electronstore.get('inoreader_token') !== 'undefined') {
        this.$refs.articleList.$refs.statusMsg.innerText = 'Syncing...'
        await helper.syncInoReader()
        log.info('Syncing inoreader')
      }
    })
    // Feed Crawling
    const job = scheduler.scheduleJob(self.$store.state.Setting.cronSettings, () => {
      const feeds = self.$store.state.Feed.feeds
      if (feeds.length === 0) {
        log.info('No feeds to process')
      } else {
        this.$refs.articleList.$refs.statusMsg.innerText = 'Syncing...'
        log.info(`Processing ${feeds.length} feeds`)
        helper.subscribe(feeds, null, true, false)
        self.$store.dispatch('loadArticles')
      }
    })

    if (this.$store.state.Setting.offline) {
      job.reschedule()
    }
    // On delete stop Crawler Job
    this.$on('delete', (msg) => {
      if (msg === 'yes') {
        log.info('Job is cancelled')
        job.reschedule()
      }
    })
  },
  watch: {
    // call again the method if the route changes
    '$route.params.feedid': 'feedChange',
    '$route.params.type': 'typeChange',
    '$route.params.id': 'fetchData',
    allUnread: 'unreadChange'
  },
  computed: {
    feeds () {
      return this.$store.state.Feed.feeds
    },
    activeFeedId () {
      return this.$store.getters.activeFeedId
    }
  },
  methods: {
    mapFeeds (feeds) {
      return feeds.map(feed => ({ ...feed, isActive: this.isFeedActive(feed) }))
    },
    // TODO: Source this method out
    isFeedActive (feed) {
      return !!feed && feed.id !== undefined && feed.id === this.activeFeedId
    },
    // TODO: Source this method out
    setActiveFeedId (feed) {
      return this.$store.dispatch('setActiveFeedId', feed)
    },
    getArticlesCount (type, feedid) {
      let articles = this.$store.state.Article.articles
      if (feedid !== '') {
        articles = articles.filter(article => article.feed_id === feedid)
      }
      if (type === 'read') {
        return articles.filter(article => article.read).length
      } else if (type === 'unread') {
        return articles.filter(article => !article.read).length
      } else if (type === 'favourites') {
        return articles.filter(article => article.favourite).length
      } else if (type === 'saved') {
        return articles.filter(article => article.offline).length
      } else {
        // all
        return articles.length
      }
    },
    exportOpml () {
      const xmlData = helper.exportOpml()
      const self = this
      fs.unlink(`${self.$electron.remote.app.getPath('downloads')}/subscriptions.xml`, (err) => {
        if (err && err.code !== 'ENOENT') throw err
        fs.writeFile(`${self.$electron.remote.app.getPath('downloads')}/subscriptions.xml`, xmlData, { flag: 'w', encoding: 'utf8' }, (err) => {
          if (err) throw err
          console.log('XML Saved')
        })
      })
      notifier.notify({
        icon: path.join(__static, '/logo_icon.png'),
        title: 'Feeds exported',
        message: `All feeds are exported as opml in downloads folder.`,
        sound: true
      })
    },
    updateType (newVal) {
      this.articleType = newVal
    },
    typeChange () {
      if (this.$route.params.type) {
        this.articleType = this.$route.params.type
        this.$store.dispatch('changeType', this.$route.params.type)
      }
    },
    feedChange () {
      if (this.$route.params.feedid) {
        this.articleType = 'feed'
        this.$store.dispatch('setFeed', this.$route.params.feedid)
        this.$store.dispatch('changeType', 'feed')
      }
    },
    unsubscribeFeed (id) {
      this.$emit('delete', 'yes')
      this.$store.dispatch('deleteFeed', id)
    },
    prepareArticleData (data, article) {
      const self = this
      self.empty = false
      const $ = cheerio.load(data.content)
      $('a').addClass('js-external-link')
      data.content = $.text().trim() === '' ? article.description : $.html()
      data.date_published = data.date_published ? dayjs(data.date_published).format('MMMM D, YYYY') : null
      data.favicon = article.favicon
      data.sitetitle = _.truncate(article.feed_title, 20)
      data._id = article._id
      data.favourite = article.favourite
      data.read = article.read
      data.offline = article.offline
      data.readtime = stat(data.content).text
      self.articleData = data
      self.loading = false
    },
    unreadChange () {
      // unread changed, sort feeds by unread count
      if (!this.feeds) {
        return
      }
      let feedsCopy = this.feeds.map((item) => {
        item.unread = this.getArticlesCount('unread', item.id)
        return item
      })
      feedsCopy = _.orderBy(feedsCopy, ['unread'], ['desc'])
      this.$store.dispatch('orderFeeds', feedsCopy)
    },
    fetchData () {
      const self = this
      if (this.$route.params.id) {
        this.$store.dispatch('markAction', {
          type: 'READ',
          id: this.$route.params.id
        })
        self.articleData = null
        self.loading = true
        db.fetchArticle(this.$route.params.id, async function (article) {
          let data
          if (self.$store.state.Setting.offline) {
            data = await cacheService.getCachedArticleData(article._id, article.link)
          } else {
            try {
              data = await parseArticle(article.link)
            } catch (e) {
              console.log(e)
            }
          }
          if (self.$store.state.Setting.offline && data) {
            self.prepareArticleData(data, article)
          } else if (!self.$store.state.Setting.offline && data) {
            self.prepareArticleData(data, article)
          } else {
            console.log('EMPTY')
            article.content = null
            article.url = article.link
            self.articleData = article
            self.empty = true
            self.loading = false
          }
        })
      }
    }
  }
}
</script>
<style lang="scss">
.feed {
  &.active {
    // TODO: Put this color/this class to e.g. an SCSS-constant
    background-color: gray;
    border-radius: 0.3rem;
  }
}

.app-wrapper {
  display: flex;
  height: 100%;
  align-items: flex-start;
}

.app-darkmode {
  .sidebar {
    background: #373737 !important;
    border-right: 1px solid black;
    box-shadow: none;

    .btn-subscribe {
      color: white;
    }

    .subscribe-toolbar {
      border-bottom-color: #000;
    }

    .nav-link {
      color: #fff !important;

      &.feed-mix-link {
        padding: initial;
      }
      & .feed-mix {
        padding: 0.5rem 1rem;

        &.active {
          // TODO: Put this color/this class to e.g. an SCSS-constant
          background-color: gray;
          border-radius: 0.3rem;
        }
      }
    }

    .sidebar-heading {
      color: #979797 !important;
    }

    &::after {
      background: none;
    }
  }

  .articles-list {
    border-right-color: #000;

    .search-form {
      border-bottom-color: #000;
      .feathre {
        color: #c8cacc;
      }

      .form-control {
        background: #373737 !important;
        color: #c8cacc !important;
      }
    }
    .articles-inner .search-form,
    .articles-inner .articles,
    .articles-inner .list-group-item {
      background: #373737 !important;
      color: white;
    }
    .articles-inner .list-group-item {
      background: #373737 !important;
      border-bottom-color: #000;
    }

    &::after {
      background: none;
    }
  }

  .article-detail {
    background: #373737 !important;
  }

  .article-toolbar {
    background: #373737 !important;
    border-bottom-color: #000;

    .article-buttons,
    .site-info {
      background: #373737 !important;
      span {
        color: white;
      }
      .feather {
        color: white;
      }

      .feather-filled {
        fill: #fff;
      }

      .feather-success {
        color: green;
      }
    }
  }

  .article-inner {
    color: white;
  }

  .article-contentarea {
    background: #373737 !important;
    h1,
    h2 {
      color: white;
      small {
        color: #c8cacc;
      }
    }

    ul {
      color: white;
    }

    address,
    figure,
    blockquote,
    h3,
    h4 {
      color: white;
    }
    b {
      color: white;
    }
    p {
      color: #c8cacc;
    }
  }

  .feather-filled {
    fill: #fff;
  }
}

.items-counter {
  float:right;
}
.items-counter-feed {
  padding-right: 10px;
}
</style>
