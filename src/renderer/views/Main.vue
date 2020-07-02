<template>
  <div class="app-wrapper">
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
import truncate from 'lodash.truncate'
import cacheService from '../services/cacheArticle'
import articleCount from '../mixins/articleCount'
import dataSets from '../mixins/dataItems'

const sortBy = (key, pref) => {
  if (pref === 'asc') {
    return (a, b) => (a[key] > b[key] ? 1 : b[key] > a[key] ? -1 : 0)
  }
  return (a, b) => (a[key] < b[key] ? 1 : b[key] < a[key] ? -1 : 0)
}

export default {
  mixins: [
    articleCount,
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
    next()
  },
  watch: {
    $route (to, from) {
      switch (to.name) {
        case 'feed-page':
          if (this.$route.params.feedid) {
            this.articleType = 'feed'
            this.$store.dispatch('setFeed', this.$route.params.feedid)
            this.$store.dispatch('setCategory', null)
            this.$store.dispatch('changeType', 'feed')
          }
          break
        case 'category-page':
          this.articleType = 'category'
          this.$store.dispatch('setCategory', this.$route.params.category)
          this.$store.dispatch('setFeed', null)
          this.$store.dispatch('changeType', 'feed')
          break
        case 'type-page':
          if (this.$route.params.type) {
            this.articleType = this.$route.params.type
            this.$store.dispatch('changeType', this.$route.params.type)
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
    const self = this
    this.$refs.articleList.$refs.statusMsg.innerText = 'Syncing...'
    this.$store.dispatch('refreshFeeds')
    this.$store.dispatch('loadCategories')
    this.$store.dispatch('loadFeeds')
    this.$store.dispatch('loadArticles')
    this.$store.dispatch('checkOffline')
    this.$store.dispatch('removeOldReadItems')

    this.$electron.ipcRenderer.on('Add subscription', (event, args) => {
      if (self.$refs.subscribetoolbar) {
        self.$refs.subscribetoolbar.$refs.subscribefeed.click()
      }
    })

    this.$electron.ipcRenderer.on('Dark mode', (event, args) => {
      this.$store.dispatch('setDarkMode', args.darkmode ? 'on' : 'off')
    })

    this.$electron.ipcRenderer.on('Next item', (event, args) => {
      if (self.$route.params.id) {
        const index = self.$store.getters.filteredArticles.findIndex(
          item => item._id === self.$route.params.id
        )
        if (index !== self.$store.getters.filteredArticles.length - 1) {
          const nextArticle = self.$store.getters.filteredArticles[index + 1]
          self.$router.push({
            name: 'article-page',
            params: { id: nextArticle._id }
          })
        }
      } else {
        self.$router.push({
          name: 'article-page',
          params: { id: self.$store.getters.filteredArticles[0]._id }
        })
      }
    })

    this.$electron.ipcRenderer.on('Previous item', (event, args) => {
      if (self.$route.params.id) {
        const index = self.$store.getters.filteredArticles.findIndex(
          item => item._id === self.$route.params.id
        )
        if (index > 0) {
          const prevArticle = self.$store.getters.filteredArticles[index - 1]
          self.$router.push({
            name: 'article-page',
            params: { id: prevArticle._id }
          })
        }
      } else {
        const articleLength = self.$store.getters.filteredArticles.length
        self.$router.push({
          name: 'article-page',
          params: {
            id: self.$store.getters.filteredArticles[articleLength - 1]._id
          }
        })
      }
    })

    this.$electron.ipcRenderer.on('Save offline', (events, args) => {
      if (self.$route.params.id) {
        if (self.$refs.articleDetail) {
          self.$refs.articleDetail.$refs.articleToolbar.$refs.saveoffline.click()
        }
      }
    })

    this.$electron.ipcRenderer.on('Toggle favourite', (events, args) => {
      if (self.$route.params.id) {
        if (self.$refs.articleDetail) {
          self.$refs.articleDetail.$refs.articleToolbar.markFavourite()
        }
      }
    })

    this.$electron.ipcRenderer.on('Toggle read', (events, args) => {
      if (self.$route.params.id) {
        if (self.$refs.articleDetail) {
          self.$refs.articleDetail.$refs.articleToolbar.markRead()
        }
      }
    })

    this.$electron.ipcRenderer.on('Settings', (events, args) => {
      self.$bvModal.show('settings')
    })

    this.$electron.ipcRenderer.on('Import subscriptions', (events, args) => {
      self.$bvModal.show('importfeed')
    })

    this.$electron.ipcRenderer.on('Export subscriptions', (events, args) => {
      self.exportOpml()
    })

    this.$electron.ipcRenderer.on('Mark all read', (events, args) => {
      self.$refs.markallread.click()
    })

    this.$electron.ipcRenderer.on('View in browser', (events, args) => {
      if (self.$route.params.id) {
        if (self.$refs.articleDetail) {
          self.$refs.articleDetail.$refs.articleToolbar.$refs.openlink.click()
        }
      }
    })

    this.$electron.ipcRenderer.on('onlinestatus', (event, status) => {
      self.$store.dispatch('setOffline', status)
    })

    this.runPruneCronJob()
    this.runArticleCronJob()

    this.$electron.remote.powerMonitor.on('resume', () => {
      log.info('Power resumed')
      this.runPruneCronJob().reschedule()
      this.runPruneCronJob().reschedule()
    })

    if (this.$store.state.Setting.offline) {
      this.runPruneCronJob().reschedule()
      this.runPruneCronJob().reschedule()
    }
    // On delete stop Crawler Job
    this.$on('delete', msg => {
      if (msg === 'yes') {
        log.info('Job is cancelled')
        this.runPruneCronJob().reschedule()
        this.runPruneCronJob().reschedule()
      }
    })
  },
  destroyed () {
    this.$electron.ipcRenderer.removeAllListeners()
  },
  methods: {
    runPruneCronJob () {
      const self = this
      return scheduler.scheduleJob('*/5 * * * *', () => {
        log.info('Pruning old read items')
        self.$store.dispatch('removeOldReadItems')
      })
    },
    runArticleCronJob () {
      const self = this
      // Feed Crawling
      return scheduler.scheduleJob(
        self.$store.state.Setting.cronSettings,
        () => {
          const feeds = self.$store.state.Feed.feeds
          if (feeds.length === 0) {
            log.info('No feeds to process')
          } else {
            this.$refs.articleList.$refs.statusMsg.innerText = 'Syncing...'
            log.info(`Processing ${feeds.length} feeds`)
            helper.subscribe(feeds, null, null, true, false)
            self.$store.dispatch('loadArticles')
          }
        }
      )
    },
    setTheme (themeValue) {
      switch (themeValue) {
        case 'night':
          this.toggleBodyClass(true, 'app-nightmode')
          this.toggleBodyClass(false, 'app-sunsetmode')
          this.toggleBodyClass(false, 'app-darkmode')
          break
        case 'dark':
          this.toggleBodyClass(false, 'app-nightmode')
          this.toggleBodyClass(false, 'app-sunsetmode')
          this.toggleBodyClass(true, 'app-darkmode')
          break
        case 'sunset':
          this.toggleBodyClass(false, 'app-nightmode')
          this.toggleBodyClass(false, 'app-darkmode')
          this.toggleBodyClass(true, 'app-sunsetmode')
          break
        case null:
          this.toggleBodyClass(false, 'app-nightmode')
          this.toggleBodyClass(false, 'app-darkmode')
          this.toggleBodyClass(false, 'app-sunsetmode')
      }
    },
    toggleBodyClass (addClass, className) {
      const el = document.body
      if (addClass) {
        el.classList.add(className)
      } else {
        el.classList.remove(className)
      }
    },
    exportOpml () {
      const xmlData = helper.exportOpml()
      const self = this
      fs.unlink(
        `${self.$electron.remote.app.getPath('downloads')}/subscriptions.xml`,
        err => {
          if (err && err.code !== 'ENOENT') throw err
          fs.writeFile(
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
      notifier.notify({
        icon: path.join(__static, '/logo_icon.png'),
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
      const $ = cheerio.load(data.content)
      $('a').addClass('js-external-link')
      $('img').addClass('img-fluid')
      $('iframe')
        .parent()
        .addClass('embed-responsive embed-responsive-16by9')
      data.content = $.text().trim() === '' ? article.description : $.html()
      if (article.podcast) {
        data.author = article.itunes.author
        data.itunes.image = article.itunes.image
          ? article.itunes.image
          : article.favicon
      }
      data.date_published = data.date_published
        ? dayjs(data.date_published).format('MMMM D, YYYY')
        : null
      data.favicon = article.favicon
      data.sitetitle = truncate(article.feed_title, 20)
      data.feed_id = article.feed_id
      data.category = article.category
      data.feed_url = article.feed_url
      data.feed_link = article.feed_link
      data._id = article._id
      data.link = article.link
      data.favourite = article.favourite
      data.read = article.read
      data.offline = article.offline
      data.readtime =
        data.content && !data.podcast ? stat(data.content).text : ''
      self.articleData = data
      self.loading = false
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
        db.fetchArticle(this.$route.params.id, async function (article) {
          let data
          self.$store.dispatch('markAction', {
            type: 'READ',
            id: self.$route.params.id,
            podcast: article.podcast
          })
          try {
            if (!article.podcast) {
              data = self.$store.state.Setting.offline ? await cacheService.getCachedArticleData(
                  article._id,
                  article.link
                ) : await parseArticle(article.link)
              if (data) {
                self.prepareArticleData(data, article)
              } else {
                article.content = null
                article.url = article.link
                self.articleData = article
                self.empty = true
                self.loading = false
              }
            } else {
              self.prepareArticleData(article, article)
            }
          } catch (e) {
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
      color: #000;
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
      color: #000;
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
