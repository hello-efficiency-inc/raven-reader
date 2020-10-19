<template>
  <div class="app-wrapper">
    <vue-topprogress ref="topProgress" color="#22e3ff"></vue-topprogress>
    <nav
      v-if="true"
      ref="sidebar"
      class="sidebar"
    >
      <subscribe-toolbar ref="subscribetoolbar" />
      <perfect-scrollbar class="sidebar-sticky">
        <menu-items />
        <h6
          class="sidebar-heading d-flex justify-content-between align-items-center px-3 mt-4 mb-1 text-muted"
        >
          <span>Subscriptions</span>
        </h6>
        <subscriptions />
      </perfect-scrollbar>
    </nav>
    <article-list
      ref="articleList"
      :type="articleType"
      :feed="feed"
      @type-change="updateType"
    />
    <article-detail
      :id="$route.params.id"
      ref="articleDetail"
      :article="articleData"
      :empty-state="empty"
      :loading="loading"
    />
    <import-modal />
    <settings-modal />
    <markallread-modal />
    <sync-settings />
  </div>
</template>
<script>
/* global __static */
import db from '../services/db'
import { parseArticle } from '../parsers/article'
import cheerio from 'cheerio'
import dayjs from 'dayjs'
import stat from 'reading-time'
import helper from '../services/helpers'
import truncate from 'lodash.truncate'
import cacheService from '../services/cacheArticle'
import articleCount from '../mixins/articleCount'
import setTheme from '../mixins/setTheme'
import dataSets from '../mixins/dataItems'
import bridge from '../services/bridge'
import bus from '../services/bus'

const sortBy = (key, pref) => {
  if (pref === 'asc') {
    return (a, b) => (a[key] > b[key] ? 1 : b[key] > a[key] ? -1 : 0)
  }
  return (a, b) => (a[key] < b[key] ? 1 : b[key] < a[key] ? -1 : 0)
}

export default {
  mixins: [
    articleCount,
    setTheme,
    dataSets
  ],
  data () {
    return {
      feed: null,
      articleData: null,
      articleType: 'all',
      empty: null,
      loading: false
    }
  },
  beforeRouteUpdate (to, from, next) {
    if (to.params.id) {
      this.$electron.ipcRenderer.send('article-selected')
    }
    bus.$emit('reset-articlelist-count')
    next()
  },
  watch: {
    $route (to, from) {
      this.$refs.topProgress.start()
      switch (to.name) {
        case 'feed-page':
          this.articleData = null
          if (this.$route.params.feedid) {
            this.articleType = 'feed'
            this.$store.dispatch('changeType', {
              type: 'feed',
              category: null,
              search: null,
              feed: this.$route.params.feedid
            }).then(() => {
              this.$refs.topProgress.done()
            })
          }
          break
        case 'category-page':
          this.articleData = null
          this.articleType = 'category'
          this.$store.dispatch('changeType', {
            type: 'feed',
            category: this.$route.params.category,
            feed: null,
            search: null
          }).then(() => {
            this.$refs.topProgress.done()
          })
          break
        case 'type-page':
          if (this.$route.params.type) {
            this.articleData = null
            this.articleType = this.$route.params.type
            this.$store.dispatch('changeType', {
              type: this.$route.params.type,
              category: null,
              feed: null,
              search: null
            }).then(() => {
              this.$refs.topProgress.done()
            })
          }
          break
        case 'article-page':
          this.fetchData()
          break
      }
    },
    allUnread: 'unreadChange'
  },
  mounted () {
    this.$refs.articleList.$refs.statusMsg.innerText = 'Syncing...'
    this.$store.dispatch('initializeDB').then(async () => {
      await this.$store.dispatch('refreshFeeds')
      await this.$store.dispatch('loadCategories')
      await this.$store.dispatch('loadFeeds')
      await this.$store.dispatch('loadArticles')
      // this.$store.dispatch('removeOldReadItems')
    })
    this.$store.dispatch('checkOffline')

    // Register event listeners
    bridge([
      'Add subscription',
      'Dark mode',
      'Next item',
      'Previous item',
      'Save offline',
      'Mark all read',
      'View in browser',
      'Import subscriptions',
      'Export subscriptions',
      'Toggle read',
      'Toggle favourite',
      'onlinestatus',
      'Settings'
    ], this)

    this.runPruneCronJob()
    this.runArticleCronJob()

    window.electron.remote.powerMonitor.on('resume', () => {
      window.log.info('Power resumed')
      this.$store.dispatch('refreshFeeds')
      this.runPruneCronJob().reschedule()
      this.runArticleCronJob().reschedule()
    })

    if (this.$store.state.Setting.offline) {
      this.runPruneCronJob().reschedule()
    }
    // On delete stop Crawler Job
    this.$on('delete', msg => {
      if (msg === 'yes') {
        window.log.info('Job is cancelled')
        this.runPruneCronJob().reschedule()
      }
    })
  },
  destroyed () {
    window.electron.ipcRenderer.removeAllListeners()
  },
  methods: {
    runPruneCronJob () {
      // const self = this
      const schedule = window.nodescheduler
      return schedule.scheduleJob('*/5 * * * *', () => {
        window.log.info('Pruning old read items')
        // self.$store.dispatch('removeOldReadItems')
      })
    },
    runArticleCronJob () {
      const self = this
      // Feed Crawling
      const schedule = window.nodescheduler
      return schedule.scheduleJob(
        self.$store.state.Setting.cronSettings,
        () => {
          const feeds = self.$store.state.Feed.feeds
          if (feeds.length === 0) {
            window.log.info('No feeds to process')
          } else {
            this.$refs.articleList.$refs.statusMsg.innerText = 'Syncing...'
            window.log.info(`Processing ${feeds.length} feeds`)
            helper.subscribe(feeds, null, true).then(() => {
              bus.$emit('sync-complete')
            })
          }
        }
      )
    },
    exportOpml () {
      const xmlData = helper.exportOpml()
      const self = this
      window.fs.unlink(
        `${self.$electron.remote.app.getPath('downloads')}/subscriptions.xml`,
        err => {
          if (err && err.code !== 'ENOENT') throw err
          window.fs.writeFile(
            `${self.$electron.remote.app.getPath(
              'downloads'
            )}/subscriptions.xml`,
            xmlData,
            { flag: 'w', encoding: 'utf8' },
            err => {
              if (err) throw err
              console.log('XML Saved')
            }
          )
        }
      )
      window.notifier.notify({
        icon: window.path.join(__static, '/logo_icon.png'),
        title: 'Feeds exported',
        message: 'All feeds are exported as opml in downloads folder.',
        sound: true
      })
    },
    updateType (newVal) {
      this.articleType = newVal
    },
    prepareArticleData (data, article) {
      const self = this
      self.empty = false
      if (!article.articles.podcast) {
        const $ = cheerio.load(data.content)
        $('a').addClass('js-external-link')
        $('img').addClass('img-fluid')
        $('iframe')
          .parent()
          .addClass('embed-responsive embed-responsive-16by9')
        data.content = $.text().trim() === '' ? article.articles.description : $.html()
        data.contentAlt = article.articles.content
      }
      if (article.articles.podcast) {
        data.author = article.articles.itunes.author
        data.itunes.image = article.articles.itunes.image
          ? article.articles.itunes.image
          : article.feeds.favicon
      }
      data.date_published = data.date_published
        ? dayjs(data.date_published).format('MMMM D, YYYY')
        : null
      data.favicon = article.feeds.favicon
      data.fulltitle = article.feeds.fulltitle
      data.sitetitle = truncate(article.feeds.title, 20)
      data.feed_uuid = article.feeds.uuid
      data.category = article.articles.category
      data.podcast = article.articles.podcast
      data.feed_url = article.feeds.xmlurl
      data.feed_link = article.feeds.link
      data._id = article.articles.uuid
      data.link = article.articles.link
      data.favourite = article.articles.favourite
      data.read = article.articles.read
      data.offline = article.articles.offline
      data.readtime =
        data.content && !data.podcast ? stat(data.content).text : ''
      self.articleData = data
      self.loading = false
      this.$refs.topProgress.done()
    },
    unreadChange () {
      // unread changed, sort feeds by unread count
      if (!this.feeds) {
        return
      }
      let feedsCopy = this.feeds.map(item => {
        item.unread = this.getArticlesCount('unread', item.id)
        return item
      })
      feedsCopy = feedsCopy.concat().sort(sortBy('unread', 'desc'))
      this.$store.dispatch('orderFeeds', feedsCopy)
    },
    fetchData () {
      const self = this
      if (this.$route.params.id) {
        self.articleData = null
        self.loading = true
        db.fetchArticle(this.$route.params.id).then(async function (article) {
          const articleItem = JSON.parse(JSON.stringify(article[0]))
          let data
          self.$store.dispatch('markAction', {
            type: 'READ',
            id: self.$route.params.id,
            podcast: articleItem.articles.podcast
          }).then(() => self.$store.dispatch('loadArticles'))
          try {
            if (!articleItem.articles.podcast) {
              data = self.$store.state.Setting.offline ? await cacheService.getCachedArticleData(
                articleItem.articles.id,
                articleItem.articles.link
              ) : await parseArticle(articleItem.articles.link)
              if (data) {
                self.prepareArticleData(data, articleItem)
              } else {
                articleItem.articles.content = null
                articleItem.articles.url = articleItem.articles.link
                self.articleData = articleItem
                self.empty = true
                self.loading = false
              }
            } else {
              self.prepareArticleData(articleItem.articles, articleItem)
            }
          } catch (e) {
            window.log.info(e)
            console.log(articleItem)
            articleItem.content = null
            articleItem.url = articleItem.articles.link
            self.articleData = articleItem
            self.empty = true
            self.loading = false
            self.$refs.topProgress.done()
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

// Default color mode
:root {
  --background-color: inherit;
  --border-color: rgba(0, 0, 0, 0.1);
  --text-color: inherit;
  --after-background: none;
  --active-item-background-color: #e8e8e8;

  & .sidebar {
    --background-color: #f8f9fa;
    --btn-subscribe-color: #212529;
    --nav-link-color: var(--text-color);
    --heading-color: #6c757d;
  }
}

.app-nightmode {
  --nightmode-background: 0, 0, 0;
  --background-color: rgba(var(--nightmode-background), 1);
  --border-color: #242424;
  --text-color: #fff;
  --input-color: 89, 91, 93;
  --active-item-background-color: #504e4e;

  .export-link,
  .category-link {
    svg {
      color: #fff;
    }
  }

  & .sidebar {
    --background-color: rgba(var(--nightmode-background), 1);
    --btn-subscribe-color: var(--text-color);
    --nav-link-color: var(--text-color);
    --heading-color: #979797;
  }
}

// Dark color mode
.app-darkmode {
  --darkmode-background: 55, 55, 55;
  --background-color: rgba(var(--darkmode-background), 1);
  --border-color: black;
  --text-color: white;
  --input-color: 89, 91, 93;
  --active-item-background-color: #504e4e;

  .export-link,
  .category-link {
    svg {
      color: #fff;
    }
  }

  & .sidebar {
    --background-color: rgba(var(--darkmode-background), 1);
    --btn-subscribe-color: var(--text-color);
    --nav-link-color: var(--text-color);
    --heading-color: #979797;
  }
}

.app-sunsetmode {
  --sunset-background: 227, 225, 217;
  --background-color: rgba(var(--sunset-background), 1);
  --border-color: #cccbc3;
  --text-color: rgb(46, 45, 44);
  --input-color: 204, 203, 195;
  --active-item-background-color: #5b5a57;

  .category-link {
    svg {
      color: #000;
    }
  }

  & .sidebar {
    --background-color: rgba(var(--sunset-background), 1);
    --btn-subscribe-color: var(--text-color);
    --nav-link-color: var(--text-color);
    --heading-color: #979797;

    .feed {
      &.active {
        background-color: var(--active-item-background-color);
        color: #fff;
        border-radius: 0;

        .category-link {
          svg {
            color: #fff;
          }
        }

        .nav-link {
          color: #fff !important;
        }
      }
    }

    .nav {
      .active {
        a {
          color: #fff !important;
        }
      }
    }

    .nav-link {
      & .feed-mix {
        padding: 0.5rem 1rem;

        &:hover,
        &.active {
          background-color: var(--active-item-background-color);
          border-radius: 0;
          color: #fff;
        }
      }
    }
  }
}

.app-nightmode {
  textarea,
  select.custom-select,
  input[type="text"],
  input[type="password"],
  input[type="datetime"],
  input[type="datetime-local"],
  input[type="date"],
  input[type="month"],
  input[type="time"],
  input[type="week"],
  input[type="number"],
  input[type="email"],
  input[type="url"],
  input[type="search"],
  input[type="file"],
  .custom-file-label,
  input[type="tel"],
  input[type="color"] {
    background: rgba(var(--input-color), 0.2)
      url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='4' height='5' viewBox='0 0 4 5'%3e%3cpath fill='%23343a40' d='M2 0L0 2h4zm0 5L0 3h4z'/%3e%3c/svg%3e")
      no-repeat right 0.75rem center/8px 10px;
    color: var(--text-color);
    border: 0;

    &:focus {
      background: rgba(var(--input-color), 0.2)
        url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='4' height='5' viewBox='0 0 4 5'%3e%3cpath fill='%23343a40' d='M2 0L0 2h4zm0 5L0 3h4z'/%3e%3c/svg%3e")
        no-repeat right 0.75rem center/8px 10px;
      color: var(--text-color);
    }
  }

  .modal-content {
    background: #16161d;
    color: var(--text-color);
  }

  .modal-header,
  .modal-footer {
    border-color: #16161d;
    .close {
      color: var(--text-color);
    }
  }
}

.app-sunsetmode,
.app-darkmode {
  textarea,
  select.custom-select,
  input[type="text"],
  input[type="password"],
  input[type="datetime"],
  input[type="datetime-local"],
  input[type="date"],
  input[type="month"],
  input[type="time"],
  input[type="week"],
  input[type="number"],
  input[type="email"],
  input[type="url"],
  input[type="search"],
  input[type="file"],
  .custom-file-label,
  input[type="tel"],
  input[type="color"] {
    background: rgba(var(--input-color), 0.8)
      url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='4' height='5' viewBox='0 0 4 5'%3e%3cpath fill='%23343a40' d='M2 0L0 2h4zm0 5L0 3h4z'/%3e%3c/svg%3e")
      no-repeat right 0.75rem center/8px 10px;
    color: var(--text-color);
    border: 0;

    &:focus {
      background: rgba(var(--input-color), 0.8)
        url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='4' height='5' viewBox='0 0 4 5'%3e%3cpath fill='%23343a40' d='M2 0L0 2h4zm0 5L0 3h4z'/%3e%3c/svg%3e")
        no-repeat right 0.75rem center/8px 10px;
      color: var(--text-color);
    }
  }

  .modal-content {
    background: var(--background-color);
    color: var(--text-color);
  }

  .modal-header,
  .modal-footer {
    border-color: var(--border-color);
    .close {
      color: var(--text-color);
    }
  }
}

.sidebar {
  background-color: var(--background-color);
  border-right-width: 1px;
  border-right-style: solid;
  border-right-color: var(--border-color);
  box-shadow: none;

  .btn-subscribe {
    color: var(--btn-subscribe-color);
  }

  .subscribe-toolbar {
    border-bottom-color: var(--border-color);
  }

  .feed {
    &.active {
      background-color: var(--active-item-background-color);
      border-radius: 0;
    }
  }

  .nav-link {
    -webkit-user-select: none;
    flex: 1 1 auto;

    &.feed-mix-link {
      padding: initial;
    }

    color: var(--nav-link-color) !important;

    & .feed-mix {
      padding: 0.5rem 1rem;

      &.active {
        background-color: var(--active-item-background-color);
        border-radius: 0.3rem;
      }
    }
  }

  .feed-counter {
    flex: 0 1 auto;
    color: var(--text-color);
  }

  .sidebar-heading {
    color: var(--heading-color);
  }

  &::after {
    background: var(--after-background);
  }
}

.feather-filled {
  fill: var(--text-color);
}

.items-counter {
  float: right;
}
.items-counter-feed {
  padding-right: 10px;
}

.ctx-menu-container {
  box-shadow: none !important;

  ul {
    background-color: var(--background-color) !important;
    border-color: #000;
    box-shadow: none;

    li {
      color: var(--text-color) !important;
      cursor: pointer;
      padding-bottom: 5px;

      &:hover {
        background: var(--active-item-background-color);
      }
    }
  }
}

.category-link.collapsed {
  svg {
    transform: rotate(0deg);
  }
}

.category-link {
  svg {
    transform: rotate(90deg);
    color: #000;
    transition: transform 0.15s linear;
  }
}
</style>
