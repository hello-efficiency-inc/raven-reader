<template>
  <div class="app-wrapper">
    <splitpanes
      class="vertical-panes"
      vertical
    >
      <vue-topprogress
        ref="topProgress"
        color="#22e3ff"
      />
      <pane
        v-if="!sideBarHidden"
        ref="sidebar"
        min-size="18"
        size="18"
        max-size="25"
        class="sidebar"
      >
        <subscribe-toolbar ref="subscribetoolbar" />
        <perfect-scrollbar class="sidebar-sticky">
          <menu-items />
          <h6
            class="sidebar-heading d-flex justify-content-between align-items-center px-3 mt-4 mb-1 text-muted"
          >
            <span>{{ $t('Subscriptions') }}</span>
          </h6>
          <subscriptions />
        </perfect-scrollbar>
      </pane>
      <article-list
        ref="articleList"
        :type="articleType"
        @type-change="updateType"
      />
      <article-detail
        :id="currentActiveArticle"
        ref="articleDetail"
        :article="articleData"
        :empty-state="empty"
        :loading="loading"
      />
    </splitpanes>
    <import-modal />
    <markallread-modal />
    <preference-window />
  </div>
</template>
<script>
import db from '../services/db'
import dayjs from 'dayjs'
import stat from 'reading-time'
import helper from '../services/helpers'
import truncate from '../services/truncate'
import cacheService from '../services/cacheArticle'
import articleCount from '../mixins/articleCount'
import cheerio from '../mixins/cheerio'
import setTheme from '../mixins/setTheme'
import dataSets from '../mixins/dataItems'
import bridge from '../services/bridge'
import bus from '../services/bus'
import serviceSync from '../mixins/serviceSync'
import nodescheduler from 'node-schedule'
import { Splitpanes, Pane } from 'splitpanes'

const markTypes = {
  favourite: 'FAVOURITE',
  unfavourite: 'UNFAVOURITE',
  read: 'READ',
  unread: 'UNREAD',
  cache: 'CACHE',
  uncache: 'UNCACHE'
}

export default {
  components: {
    Splitpanes,
    Pane
  },
  mixins: [
    articleCount,
    setTheme,
    dataSets,
    cheerio,
    serviceSync
  ],
  data () {
    return {
      articleData: null,
      articleType: 'all',
      empty: null,
      loading: false,
      sideBarHidden: false
    }
  },
  computed: {
    currentActiveArticle () {
      return this.$store.state.FeedManager.activeArticleId
    }
  },
  mounted () {
    const self = this
    this.$store.dispatch('initializeDB').then(async () => {
      await this.$store.dispatch('refreshFeeds')
      await this.$store.dispatch('loadCategories')
      await this.$store.dispatch('loadFeeds')
      await this.$store.dispatch('loadArticles')
      db.deleteArticleByKeepRead()
    }).then(() => {
      setTimeout(() => {
        self.syncFever()
        self.syncFeedbin()
        self.syncInoreader()
        self.syncGreader()
      }, 1000)
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

    this.runArticleCronJob()
    this.runServiceCronJob()
    this.runKeepReadJob()

    window.api.ipcRendReceive('power-resume', () => {
      window.log.info('Power resumed')
      this.$store.dispatch('refreshFeeds')
      this.runArticleCronJob().reschedule()
      this.runServiceCronJob().reschedule()
      this.runKeepReadJob().reschedule()
      this.syncFever()
      this.syncFeedbin()
      this.syncInoreader()
      this.syncGreader()
      db.deleteArticleByKeepRead()
    })

    window.api.ipcRendReceive('mark-read', (arg) => {
      this.$store.dispatch('markAction', {
        type: !arg.article.read ? markTypes.read : markTypes.unread,
        podcast: arg.article.podcast,
        id: arg.article.uuid
      }).then(() => {
        this.$store.dispatch('loadArticles')
      })
    })

    window.api.ipcRendReceive('mark-favourite', (arg) => {
      this.$store.dispatch('markAction', {
        type: arg.article.favourite ? markTypes.unfavourite : markTypes.favourite,
        id: arg.article.uuid
      }).then(() => {
        this.$store.dispatch('loadArticles')
      })
    })

    window.api.ipcRendReceive('save-article', (arg) => {
      if (arg.article.offline && !this.$store.state.Setting.offline) {
        cacheService.uncache(`raven-${arg.article.uuid}`).then(() => {
          this.$store.dispatch('saveArticle', {
            type: markTypes.uncache,
            article: arg.article
          })
        })
      } else {
        cacheService.cacheArticleData(arg.article).then(() => {
          this.$store.dispatch('saveArticle', {
            type: markTypes.cache,
            article: arg.article
          })
        })
      }
      this.$store.dispatch('loadArticles')
    })

    bus.$on('progress', (data) => {
      if (data === 'start') {
        if (typeof this.$refs.topProgress !== 'undefined') {
          this.$refs.topProgress.start()
        }
      } else {
        if (typeof this.$refs.topProgress !== 'undefined') {
          this.$refs.topProgress.done()
        }
      }
    })

    bus.$on('sidebar-hidden', (data) => {
      this.sideBarHidden = data
    })
    bus.$on('change-article-list', this.handleArticleList)
  },
  destroyed () {
    window.electron.removeListeners()
  },
  methods: {
    handleArticleList (data) {
      this.articleData = null
      switch (data.type) {
        case 'type-page':
          this.articleType = data.item
          this.$store.dispatch('changeType', {
            type: data.item,
            category: null,
            feed: null,
            search: null
          })
          bus.$emit('reset-articlelist-count')
          break
        case 'feed':
          this.articleType = 'feed'
          this.$store.dispatch('changeType', {
            type: 'feed',
            category: null,
            search: null,
            feed: data.feed
          })
          bus.$emit('reset-articlelist-count')
          break
        case 'category-page':
          this.articleType = 'category'
          this.$store.dispatch('changeType', {
            type: 'feed',
            category: data.category,
            feed: null,
            search: null
          })
          bus.$emit('reset-articlelist-count')
          break
        case 'article-page':
          this.fetchData(data.id)
          break
      }
    },
    runArticleCronJob () {
      const self = this
      // Feed Crawling
      return nodescheduler.scheduleJob(
        self.$store.state.Setting.cronSettings,
        () => {
          const feeds = self.$store.state.Feed.feeds.filter(item => item.source === 'local')
          if (feeds.length === 0) {
            window.log.info('No feeds to process')
          } else {
            // this.$refs.articleList.$refs.statusMsg.innerText = 'Syncing...'
            window.log.info(`Processing ${feeds.length} feeds`)
            helper.subscribe(feeds, null, true).then(() => {
              bus.$emit('sync-complete')
            })
          }
        }
      )
    },
    runServiceCronJob () {
      // Service crawling
      return nodescheduler.scheduleJob(
        '*/4 * * * *',
        () => {
          this.syncFever()
          this.syncFeedbin()
          this.syncInoreader()
          this.syncGreader()
        }
      )
    },
    runKeepReadJob () {
      // Service crawling
      return nodescheduler.scheduleJob(
        '*/5 * * * *',
        () => {
          window.log.info('Deleting read articles')
          db.deleteArticleByKeepRead()
        }
      )
    },
    exportOpml () {
      const xmlData = helper.exportOpml()
      window.electron.exportOpml(xmlData)
    },
    updateType (newVal) {
      this.articleType = newVal
    },
    prepareArticleData (data, article) {
      const self = this
      self.empty = false
      if (data.media === null) {
        data.content = this.cleanupContent(data.content)
      }
      data.date_published = data.date_published
        ? dayjs(data.date_published).format('MMMM D, YYYY')
        : null
      data.favicon = article.feeds.favicon
      data.fulltitle = article.feeds.fulltitle
      data.sitetitle = truncate(article.feeds.title, 50)
      data.feed_uuid = article.feeds.uuid
      data.category = article.articles.category
      data.podcast = article.articles.podcast
      data.media = article.articles.media
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
    fetchData (id) {
      const self = this
      self.articleData = null
      self.loading = true
      db.fetchArticle(id).then(async function (article) {
        const articleItem = JSON.parse(JSON.stringify(article[0]))
        let data
        try {
          if (!articleItem.articles.podcast) {
            data = self.$store.state.Setting.offline
              ? await cacheService
                .getCachedArticleData(
                  articleItem.articles.id,
                  articleItem.articles.link
                )
              : articleItem.articles
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
          articleItem.content = null
          articleItem.url = articleItem.articles.link
          self.articleData = articleItem
          self.empty = true
          self.loading = false
        }
        if (!articleItem.read) {
          self.$store.dispatch('markAction', {
            type: 'READ',
            id: id,
            podcast: articleItem.articles.podcast
          }).then(() => {
            self.$store.dispatch('loadArticles')
          })
        }
      })
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

.plyr__tooltip {
    --plyr-tooltip-background: var(--background-color);
    --plyr-tooltip-color: var(--text-color);
  }

  .plyr__menu__container {
    --plyr-menu-background: var(--background-color);
    --plyr-menu-color: var(--text-color);
  }

.app-nightmode {
  --nightmode-background: 0, 0, 0;
  --background-color: rgba(var(--nightmode-background), 1);
  --border-color: #242424;
  --text-color: #fff;
  --input-color: 89, 91, 93;
  --active-item-background-color: #504e4e;

  .plyr__tooltip {
    --plyr-tooltip-background: var(--background-color);
    --plyr-tooltip-color: var(--text-color);
  }

  .plyr__menu__container {
    --plyr-menu-background: var(--background-color);
    --plyr-menu-color: var(--text-color);
  }

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

  .plyr__tooltip {
    --plyr-tooltip-background: var(--background-color);
    --plyr-tooltip-color: var(--text-color);
  }

  .plyr__menu__container {
    --plyr-menu-background: var(--background-color);
    --plyr-menu-color: var(--text-color);
  }

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

  .plyr__tooltip {
    --plyr-tooltip-background: var(--background-color);
    --plyr-tooltip-color: var(--text-color);
  }

  .plyr__menu__container {
    --plyr-menu-background: var(--background-color);
    --plyr-menu-color: var(--text-color);
  }

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

.vertical-panes {
  display: flex;
  width: 100%;
  height: 100%;
}

.splitpanes--vertical > .splitpanes__splitter {
  min-width: 3px;
  background:var(--background-color);
  cursor: col-resize;
}

.dropdown-menu {
  background: var(--background-color, #fff);
  color: var(--text-color);
}

.dropdown-item {
  color: var(--text-colo);

  span {
    color: var(--text-color) !important;
  }

  &:hover {
    background: var(--active-item-background-color);
    color: var(--text-color) !important;
  }
}
</style>
