<template>
  <div class="app-wrapper">
    <nav
      v-if="true"
      ref="sidebar"
      class="sidebar"
    >
      <subscribe-toolbar ref="subscribetoolbar" />
      <perfect-scrollbar class="sidebar-sticky">
        <ul class="nav flex-column">
          <li class="nav-item">
            <router-link
              class="nav-link feed-mix-link"
              to="/all"
              active-class="active"
            >
              <feed-mix
                feed-id="allFeeds"
                mark="allFeeds"
              >
                <feather-icon name="list" />All Feeds
                <span class="sr-only">(current)</span>
                <span
                  v-if="getArticlesCount('','') > 0"
                  class="items-counter"
                >{{ getArticlesCount('','') }}</span>
              </feed-mix>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link
              class="nav-link feed-mix-link"
              to="/favourites"
              active-class="active"
            >
              <feed-mix
                feed-id="favourites"
                mark="favourites"
              >
                <feather-icon name="star" />Favourites
                <span
                  v-if="getArticlesCount('favourites','') > 0"
                  class="items-counter"
                >{{ getArticlesCount('favourites','') }}</span>
              </feed-mix>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link
              class="nav-link feed-mix-link"
              to="/unread"
              active-class="active"
            >
              <feed-mix
                feed-id="unreadArticles"
                mark="unreadArticles"
              >
                <feather-icon name="circle" />Unread Articles
                <span
                  v-if="getArticlesCount('unread', '') > 0"
                  class="items-counter"
                >{{ getArticlesCount('unread', '') }}</span>
              </feed-mix>
            </router-link>
          </li>
          <li
            class="nav-item"
            :class="{ 'd-none': showLess }"
          >
            <router-link
              class="nav-link feed-mix-link"
              to="/read"
              active-class="active"
            >
              <feed-mix
                feed-id="recentlyRead"
                mark="recentlyRead"
              >
                <feather-icon
                  name="circle"
                  filled
                />Recently Read
                <span
                  v-if="getArticlesCount('read', '') > 0"
                  class="items-counter"
                >{{ getArticlesCount('read', '') }}</span>
              </feed-mix>
            </router-link>
          </li>
          <li
            class="nav-item"
            :class="{ 'd-none': showLess }"
          >
            <router-link
              class="nav-link feed-mix-link"
              to="/read"
              active-class="active"
            >
              <feed-mix
                feed-id="recentlyPlayed"
                mark="recentlyPlayed"
              >
                <feather-icon name="play-circle" />Recently Played
                <span
                  v-if="getArticlesCount('played', '') > 0"
                  class="items-counter"
                >{{ getArticlesCount('played', '') }}</span>
              </feed-mix>
            </router-link>
          </li>
          <li
            class="nav-item"
            :class="{ 'd-none': showLess }"
          >
            <router-link
              class="nav-link feed-mix-link"
              to="/saved"
              active-class="active"
            >
              <feed-mix
                feed-id="savedArticles"
                mark="savedArticles"
              >
                <feather-icon name="wifi-off" />Saved articles
                <span
                  v-if="getArticlesCount('saved', '') > 0"
                  class="items-counter"
                >{{ getArticlesCount('saved', '') }}</span>
              </feed-mix>
            </router-link>
          </li>
          <li class="nav-item d-none">
            <a
              v-b-modal.integrations
              class="nav-link"
              href="#"
            >
              <feather-icon name="package" />Integrations
            </a>
          </li>
          <li class="nav-item">
            <a
              class="nav-link"
              href="#"
              @click="showLessItems"
            >
              <template v-if="showLess">
                <feather-icon name="arrow-down" /> Show more
              </template>
              <template v-if="!showLess">
                <feather-icon name="arrow-up" /> Show less
              </template>
            </a>
          </li>
        </ul>
        <h6
          class="sidebar-heading d-flex justify-content-between align-items-center px-3 mt-4 mb-1 text-muted"
        >
          <span>Subscriptions</span>
        </h6>
        <ul class="nav flex-column">
          <template v-for="feeditem in mapFeeds(feeds, categoryItems)">
            <li
              v-if="!feeditem.type && feeditem.category === null"
              :key="feeditem.id"
              class="feed nav-item d-flex justify-content-between align-items-center pr-2"
              mark="feed"
              :class="{ active: feeditem.isActive }"
              @click="setActiveFeedId(feeditem)"
              @contextmenu.prevent="openFeedMenu($event, {feed: feeditem})"
            >
              <router-link
                v-if="!feeditem.type && feeditem.category === null"
                class="nav-link"
                :to="`/feed/${feeditem.id}`"
              >
                <img
                  v-if="feeditem.favicon"
                  :src="feeditem.favicon"
                  height="16"
                  width="16"
                  class="mr-1"
                >
                {{ feeditem.title }}
              </router-link>
              <div
                v-if="!feeditem.type && feeditem.category === null && getArticlesCount('', feeditem.id) > 0"
                class="nav-link feed-counter"
              >
                <span class="item-counter">{{ getArticlesCount('', feeditem.id) }}</span>
              </div>
            </li>
            <li
              v-if="feeditem.type"
              :key="feeditem.id"
              class="feed nav-item d-flex align-items-center pr-2"
              mark="category"
              :class="{ active: feeditem.isActive }"
              @click="categoryHandler(feeditem)"
              @contextmenu.prevent="openCategoryMenu($event, { category: feeditem})"
            >
              <button
                v-if="feeditem.type"
                v-b-toggle="`collapse-${feeditem.id}`"
                class="btn btn-link category-link pr-0"
              >
                <feather-icon name="chevron-right" />
              </button>
              <a
                href="#"
                class="nav-link pl-1"
                replace
              >{{ feeditem.title }}</a>
              <div
                v-if="getArticlesCount('category', feeditem.title) > 0"
                class="nav-link feed-counter"
              >
                <span class="item-counter">{{ getArticlesCount('category', feeditem.title) }}</span>
              </div>
            </li>
            <b-collapse
              v-if="feeditem.type"
              :id="`collapse-${feeditem.id}`"
              :key="`collapse-${feeditem.id}`"
            >
              <template v-for="categoryfeed in categoryFeeds(feeds, feeditem.title)">
                <li
                  :key="categoryfeed.id"
                  class="feed nav-item d-flex justify-content-between align-items-center pr-2"
                  mark="feed"
                  :class="{ active: categoryfeed.isActive }"
                  @click="setActiveFeedId(categoryfeed)"
                  @contextmenu.prevent="openFeedMenu($event, {feed: categoryfeed})"
                >
                  <router-link
                    :to="`/feed/${categoryfeed.id}`"
                    class="nav-link ml-1"
                  >
                    <img
                      v-if="categoryfeed.favicon"
                      :src="categoryfeed.favicon"
                      height="16"
                      width="16"
                      class="mr-1"
                    >
                    {{ categoryfeed.title }}
                  </router-link>
                  <div
                    v-if="getArticlesCount('', categoryfeed.id) > 0"
                    class="nav-link feed-counter"
                  >
                    <span class="item-counter">{{ getArticlesCount('', categoryfeed.id) }}</span>
                  </div>
                </li>
              </template>
            </b-collapse>
          </template>
        </ul>
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
    <edit-feed :feed="activeFeed" />
    <edit-category :feed="activeFeed" />
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
const { remote } = require('electron')
const { Menu, MenuItem } = require('electron').remote

const sortBy = (key, pref) => {
  if (pref === 'asc') {
    return (a, b) => (a[key] > b[key] ? 1 : b[key] > a[key] ? -1 : 0)
  }
  return (a, b) => (a[key] < b[key] ? 1 : b[key] < a[key] ? -1 : 0)
}

export default {
  data () {
    return {
      showLess: false,
      articleData: null,
      articleType: 'all',
      empty: null,
      feed: null,
      feedMenuData: null,
      loading: false,
      activeFeed: null
    }
  },
  beforeRouteUpdate (to, from, next) {
    if (to.params.id) {
      this.$electron.ipcRenderer.send('article-selected')
    }
    next()
  },
  computed: {
    categoryItems () {
      return this.$store.state.Category.categories
    },
    feeds () {
      return this.$store.state.Feed.feeds
    },
    activeFeedId () {
      return this.$store.getters.activeFeedId
    }
  },
  watch: {
    $route (to, from) {
      switch (to.name) {
        case 'feed-page':
          this.feedChange()
          break
        case 'category-page':
          this.categoryChange()
          break
        case 'type-page':
          this.typeChange()
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
  methods: {
    showLessItems () {
      this.showLess = !this.showLess
    },
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
    onCtxOpen (locals) {
      this.feedMenuData = locals.feed
    },
    resetCtxLocals () {
      this.feedMenuData = null
    },
    categoryFeeds (feeds, category) {
      var items = feeds
        .filter(item => item.category === category)
        .map(feed => ({
          ...feed,
          isActive: this.isFeedActive(feed)
        }))
      var sorted = items.sort((a, b) => {
        if (a.title.toLowerCase() < b.title.toLowerCase()) {
          return -1
        }
        if (a.title.toLowerCase() > b.title.toLowerCase()) {
          return 1
        }
        return 0
      })
      return sorted
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
    mapFeeds (feeds, category) {
      var mixed = feeds.concat(category)
      var items = mixed.map(feed => ({
        ...feed,
        isActive: this.isFeedActive(feed)
      }))
      var sorted = items.sort((a, b) => {
        if (a.title.toLowerCase() < b.title.toLowerCase()) {
          return -1
        }
        if (a.title.toLowerCase() > b.title.toLowerCase()) {
          return 1
        }
        return 0
      })
      return sorted
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
      if (type === '' && feedid !== '') {
        articles = articles.filter(article => article.feed_id === feedid)
      }
      if (type === 'read') {
        return articles.filter(article => article.read).length
      } else if (type === 'played') {
        return articles.filter(article => article.podcast && article.played)
          .length
      } else if (type === 'unread') {
        return articles.filter(article => !article.read).length
      } else if (type === 'favourites') {
        return articles.filter(article => article.favourite).length
      } else if (type === 'saved') {
        return articles.filter(article => article.offline).length
      } else if (type === 'category') {
        return articles.filter(article => article.category === feedid).length
      } else {
        // all
        return articles.length
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
    typeChange () {
      if (this.$route.params.type) {
        this.articleType = this.$route.params.type
        this.$store.dispatch('changeType', this.$route.params.type)
      }
    },
    categoryChange () {
      this.articleType = 'category'
      this.$store.dispatch('setCategory', this.$route.params.category)
      this.$store.dispatch('setFeed', null)
      this.$store.dispatch('changeType', 'feed')
    },
    feedChange () {
      if (this.$route.params.feedid) {
        this.articleType = 'feed'
        this.$store.dispatch('setFeed', this.$route.params.feedid)
        this.$store.dispatch('setCategory', null)
        this.$store.dispatch('changeType', 'feed')
      }
    },
    async unsubscribeFeed (id, category = null) {
      await this.$emit('delete', 'yes')
      await this.$store.dispatch('deleteFeed', id)
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
              if (self.$store.state.Setting.offline) {
                data = await cacheService.getCachedArticleData(
                  article._id,
                  article.link
                )
                console.log(data)
              } else {
                data = await parseArticle(article.link)
              }
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
    },
    markCategoryRead (id) {
      this.$store.dispatch('markCategoryRead', id)
    },
    markFeedRead (id) {
      this.$store.dispatch('markFeedRead', id)
    },
    copyFeedLink (xml) {
      this.$electron.clipboard.writeText(xml)
    },
    categoryHandler (feed) {
      this.setActiveFeedId(feed)
      this.$router.push({
        name: 'category-page',
        params: { category: feed.title }
      })
    },
    openCategoryEditModal (category) {
      this.activeFeed = category
    },
    openEditModal (feed) {
      this.activeFeed = feed
    },
    openCategoryMenu (e, feed) {
      const self = this
      const menu = new Menu()

      menu.append(
        new MenuItem({
          label: `Mark ${feed.category.title} as read`,
          click () {
            self.markCategoryRead(feed.category.title)
          }
        })
      )
      menu.append(
        new MenuItem({
          label: 'Rename folder',
          click () {
            self.openCategoryEditModal(feed.category)
            self.$bvModal.show('editCategory')
          }
        })
      )

      menu.append(
        new MenuItem({
          type: 'separator'
        })
      )

      menu.append(
        new MenuItem({
          label: 'Delete',
          click () {
            const feedIndex = self.$store.state.Feed.feeds.findIndex(
              item => item.category === feed.category.title
            )
            self.$store.dispatch('deleteCategory', feed.category.title)
            self.$store.dispatch(
              'deleteFeed',
              self.$store.state.Feed.feeds[feedIndex].id
            )
            self.$store.dispatch('deleteArticleCategory', feed.category.title)
          }
        })
      )

      menu.popup({ window: remote.getCurrentWindow() })
      menu.once('menu-will-close', () => {
        menu.destroy()
      })
    },
    openFeedMenu (e, feed) {
      const self = this
      const menu = new Menu()
      menu.append(
        new MenuItem({
          label: 'Copy feed link',
          click () {
            self.copyFeedLink(feed.feed.xmlurl)
          }
        })
      )

      menu.append(
        new MenuItem({
          label: 'Mark as read',
          click () {
            self.markFeedRead(feed.feed.id)
          }
        })
      )

      menu.append(
        new MenuItem({
          label: 'Edit feed',
          click () {
            self.openEditModal(feed.feed)
            self.$bvModal.show('editFeed')
          }
        })
      )

      menu.append(
        new MenuItem({
          type: 'separator'
        })
      )

      menu.append(
        new MenuItem({
          label: 'Unsubscribe',
          click () {
            self.unsubscribeFeed(feed.feed.id)
          }
        })
      )
      menu.popup({ window: remote.getCurrentWindow() })
      menu.once('menu-will-close', () => {
        menu.destroy()
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
