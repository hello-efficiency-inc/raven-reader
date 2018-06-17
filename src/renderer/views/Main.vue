<template>
  <div class="app-wrapper">
    <nav class="bg-light sidebar">
      <subscribe-toolbar></subscribe-toolbar>
      <div class="sidebar-sticky">
        <ul class="nav flex-column">
          <li class="nav-item">
            <a class="nav-link" href="#">
              <feather-icon name="list"></feather-icon>
              All Feeds <span class="sr-only">(current)</span>
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#">
              <feather-icon name="star"></feather-icon>
              Favourites
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#">
              <feather-icon name="archive"></feather-icon>
              Archives
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#">
              <feather-icon name="circle"></feather-icon>
              Unread Articles
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#">
              <feather-icon name="circle" filled></feather-icon>
              Recently Read
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#">
              <feather-icon name="settings"></feather-icon>
              Settings
            </a>
          </li>
        </ul>
        <h6 class="sidebar-heading d-flex justify-content-between align-items-center px-3 mt-4 mb-1 text-muted">
          <span>Subscriptions</span>
        </h6>
        <ul class="nav flex-column">
          <li v-for="feed in feeds" class="nav-item">
            <a class="nav-link" href="#">
              <img :src="feed.favicon" height="16" width="16" class="mr-1">
              {{ feed.title }}
            </a>
          </li>
        </ul>
      </div>
    </nav>
    <article-list></article-list>
    <article-detail :id="$route.params.id" :article="articleData"></article-detail>
  </div>
</template>
<script>
import db from '../services/db'
import { parseArticle } from '../parsers/article'
import dayjs from 'dayjs'
import stat from 'reading-time'

export default {
  data () {
    return {
      articleData: null
    }
  },
  mounted () {
    this.$store.dispatch('loadFeeds')
    this.$store.dispatch('loadArticles')
  },
  beforeRouteUpdate (to, from, next) {
    const self = this
    this.$store.dispatch('markRead', to.params.id)
    db.fetchArticle(to.params.id, async function (article) {
      const link = article.origlink ? article.origlink : article.link
      const data = await parseArticle(link)
      data.body.date_published = data.body.date_published ? dayjs(data.body.date_published).format('MMMM D, YYYY') : null
      data.body.favicon = article.meta.favicon
      data.body.sitetitle = article.meta.title
      data.body._id = article._id
      data.body.favourite = article.favourite
      data.body.read = article.read
      data.body.readtime = stat(data.body.content).text
      self.articleData = data.body
    })
    next()
  },
  computed: {
    feeds () {
      return this.$store.state.Feed.feeds
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
