<template>
  <div class="app-wrapper" :class="{ 'app-darkmode': $store.state.Setting.darkMode === 'on' }">
    <nav class="bg-light sidebar">
      <subscribe-toolbar></subscribe-toolbar>
      <div class="sidebar-sticky">
        <ul class="nav flex-column">
          <li class="nav-item">
            <router-link class="nav-link" to="/all" active-class="active">
              <feather-icon name="list"></feather-icon>
              All Feeds <span class="sr-only">(current)</span>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/favourites" active-class="active">
              <feather-icon name="star"></feather-icon>
              Favourites
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/unread" active-class="active">
              <feather-icon name="circle"></feather-icon>
              Unread Articles
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/read" active-class="active">
              <feather-icon name="circle" filled></feather-icon>
              Recently Read
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/saved" active-class="active">
              <feather-icon name="wifi-off"></feather-icon>
              Saved articles
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
            <a class="nav-link" href="#" v-b-modal.markallread>
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
          <li v-for="feed in feeds" class="nav-item d-flex justify-content-between align-items-center pr-2" v-bind:key="feed.id">
            <router-link v-if="feed" class="nav-link" :to="`/feed/${feed.id}`">
              <img v-if="feed.favicon" :src="feed.favicon" height="16" width="16" class="mr-1">
              {{ feed.title }}
            </router-link>
            <button @click="unsubscribeFeed(feed.id)" class="btn btn-link"><feather-icon name="x-circle"></feather-icon></button>
          </li>
        </ul>
      </div>
    </nav>
    <article-list :type="articleType" :feed="feed" @type-change="updateType"></article-list>
    <article-detail :id="$route.params.id" :article="articleData" :emptyState="empty" :loading="loading"></article-detail>
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
import cacheService from '../services/cacheArticle'

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
  mounted () {
    const self = this
    this.$store.dispatch('refreshFeeds')
    this.$store.dispatch('loadFeeds')
    this.$store.dispatch('loadArticles')
    this.$store.dispatch('checkOffline')

    this.$electron.ipcRenderer.on('onlinestatus', (event, status) => {
      self.$store.dispatch('setOffline', status)
    })

    // Feed Crawling
    const job = scheduler.scheduleJob(self.$store.state.Setting.cronSettings, () => {
      const feeds = self.$store.state.Feed.feeds
      if (feeds.length === 0) {
        log.info('No feeds to process')
      } else {
        log.info(`Processing ${feeds.length} feeds`)
        helper.subscribe(feeds, null, true, false)
        self.$store.dispatch('loadArticles')
      }
    })

    if (this.$store.state.Setting.offline) {
      job.cancel()
    }
    // On delete stop Crawler Job
    this.$on('delete', (msg) => {
      if (msg === 'yes') {
        log.info('Job is cancelled')
        job.cancel()
      }
    })
  },
  watch: {
    // call again the method if the route changes
    '$route.params.feedid': 'feedChange',
    '$route.params.type': 'typeChange',
    '$route.params.id': 'fetchData'
  },
  computed: {
    feeds () {
      return this.$store.state.Feed.feeds
    }
  },
  methods: {
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
      data.content = $.html()
      data.date_published = data.date_published ? dayjs(data.date_published).format('MMMM D, YYYY') : null
      data.favicon = article.meta.favicon
      data.sitetitle = article.meta.title
      data._id = article._id
      data.favourite = article.favourite
      data.read = article.read
      data.offline = article.offline
      data.readtime = stat(data.content).text
      self.articleData = data
      self.loading = false
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
          const link = article.origlink !== null ? article.origlink : article.link
          let data
          if (self.$store.state.Setting.offline) {
            data = await cacheService.getCachedArticleData(article._id, link)
            console.log(data)
          } else {
            data = await parseArticle(link)
          }
          if (self.$store.state.Setting.offline && data) {
            self.prepareArticleData(data, article)
          } else if (!self.$store.state.Setting.offline && data.statusCode === 200) {
            self.prepareArticleData(data.body, article)
          } else {
            console.log('EMPTY')
            article.content = null
            article.url = link
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
</style>
