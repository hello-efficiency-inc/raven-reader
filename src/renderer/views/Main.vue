<template>
  <div class="app-wrapper">
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
            <a class="nav-link" href="#" @click="exportOpml">
              <feather-icon name="external-link"></feather-icon>
              Export Subscriptions
            </a>
          </li>
        </ul>
        <h6 class="sidebar-heading d-flex justify-content-between align-items-center px-3 mt-4 mb-1 text-muted">
          <span>Subscriptions</span>
        </h6>
        <ul class="nav flex-column">
          <li v-for="feed in feeds" class="nav-item d-flex justify-content-between align-items-center pr-2">
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
    <article-detail :id="$route.params.id" :article="articleData" :loading="loading"></article-detail>
  </div>
</template>
<script>
import db from '../services/db'
import { parseArticle } from '../parsers/article'
import cheerio from 'cheerio'
import dayjs from 'dayjs'
import stat from 'reading-time'
import forever from 'async/forever'
import helper from '../services/helpers'
import fs from 'fs'

export default {
  data () {
    return {
      articleData: null,
      articleType: 'all',
      feed: null,
      loading: false
    }
  },
  mounted () {
    this.$store.dispatch('refreshFeeds')
    this.$store.dispatch('loadFeeds')
    this.$store.dispatch('loadArticles')

    // Feed Crawling
    forever(
      (next) => {
        console.log('Refreshing')
        this.$store.dispatch('refreshFeeds')
        setTimeout(() => {
          next()
        }, 60000)
      },
      (err) => {
        console.error(err)
      }
    )
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
      fs.writeFile(`${this.$electron.remote.app.getPath('downloads')}/subscriptions.xml`, helper.exportOpml())
      const notification = new Notification('RSS Reader', {
        body: 'Successfully exported all subscriptions to downloads folder'
      })
      notification.onclick = () => {
        console.log('Notification clicked')
      }
    },
    updateType (newVal) {
      this.articleType = newVal
    },
    typeChange () {
      if (this.$route.params.type) {
        this.articleType = this.$route.params.type
      }
    },
    feedChange () {
      if (this.$route.params.feedid) {
        this.articleType = 'feed'
        this.feed = this.$route.params.feedid
      }
    },
    unsubscribeFeed (id) {
      this.$store.dispatch('deleteFeed', id)
      this.$store.dispatch('deleteArticle', id)
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
          const data = await parseArticle(link)
          if (data) {
            const $ = cheerio.load(data.body.content)
            $('a').addClass('js-external-link')
            data.body.content = $.html()
            data.body.date_published = data.body.date_published ? dayjs(data.body.date_published).format('MMMM D, YYYY') : null
            data.body.favicon = article.meta.favicon
            data.body.sitetitle = article.meta.title
            data.body._id = article._id
            data.body.favourite = article.favourite
            data.body.read = article.read
            data.body.readtime = stat(data.body.content).text
            self.articleData = data.body
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
</style>
