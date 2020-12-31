<template>
  <div>
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
          <a
            v-if="!feeditem.type && feeditem.category === null"
            class="nav-link"
            href="#"
            @click="navigateFeed(feeditem.id)"
          >
            <img
              v-if="feeditem.favicon"
              :src="feeditem.favicon"
              height="16"
              width="16"
              class="mr-1"
            >
            {{ feeditem.title }}
          </a>
          <div
            v-if="!feeditem.type && feeditem.category === null && getFeed(feeditem.id) > 0"
            class="nav-link feed-counter"
          >
            <span class="item-counter">{{ getFeed(feeditem.id) }}</span>
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
            :aria-label="`${feeditem.title} group`"
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
            v-if="getCategory(feeditem.title) > 0"
            class="nav-link feed-counter"
          >
            <span class="item-counter">{{ getCategory(feeditem.title) }}</span>
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
              <a
                href="#"
                class="nav-link ml-1"
                @click="navigateFeed(categoryfeed.id)"
              >
                <img
                  v-if="categoryfeed.favicon"
                  :src="categoryfeed.favicon"
                  height="16"
                  width="16"
                  class="mr-1"
                >
                {{ categoryfeed.title }}
              </a>
              <div
                v-if="getFeed(categoryfeed.id) > 0"
                class="nav-link feed-counter"
              >
                <span class="item-counter">{{ getFeed(categoryfeed.id) }}</span>
              </div>
            </li>
          </template>
        </b-collapse>
      </template>
    </ul>
    <edit-feed :feed="activeFeed" />
    <edit-category :feed="activeFeed" />
  </div>
</template>
<script>
import bus from '../services/bus'
import cacheService from '../services/cacheArticle'
import db from '../services/db'
import helper from '../services/helpers'
import feedbin from '../services/feedbin'
import dataSets from '../mixins/dataItems'
import feedMix from '../mixins/feedMix'

export default {
  mixins: [dataSets, feedMix],
  data () {
    return {
      feed: null,
      feedMenuData: null,
      activeFeed: null
    }
  },
  mounted () {
    window.api.ipcRendReceive('refresh-feed', (arg) => {
      helper.subscribe([arg.feed], null, true)
    })

    window.api.ipcRendReceive('edit-feed', (arg) => {
      this.openEditModal(arg.feed)
      this.$bvModal.show('editFeed')
    })

    window.api.ipcRendReceive('mark-feed-read', (arg) => {
      this.markFeedRead(arg)
    })

    window.api.ipcRendReceive('unsubscribe-feed', (arg) => {
      this.unsubscribeFeed(arg)
    })

    window.api.ipcRendReceive('category-read', (arg) => {
      const articles = this.$store.state.Article.articles.filter((item) => {
        return item.articles.category === arg.category.title
      }).map(item => item.articles.uuid)
      db.markAllRead(articles).then(() => {
        this.$store.dispatch('loadArticles')
      })
      const feedBinArticles = this.$store.state.Article.articles.filter((item) => {
        return item.articles.category === arg.category.title
      }).map(item => item.articles.source_id)
      this.feedBinArticleRead(feedBinArticles)
    })

    window.api.ipcRendReceiveOnce('category-rename', (arg) => {
      this.openCategoryEditModal(arg.category)
      this.$bvModal.show('editCategory')
    })

    window.api.ipcRendReceive('category-delete', (arg) => {
      const feeds = this.$store.state.Feed.feeds.filter((item) => {
        return item.category === arg.category.title
      }).map(item => item.uuid)
      const articles = this.$store.state.Article.articles.filter((item) => {
        return item.articles.category === arg.category.title
      }).map(item => item.articles.uuid)
      db.deleteCategory(arg.category.title)
      db.deleteFeedMulti(feeds).then(() => {
        articles.forEach(async (article) => {
          await cacheService.uncache(`raven-${article}`)
        })
        db.deleteArticlesMulti(articles)
      }).then(() => {
        this.$store.dispatch('loadCategories')
        this.$store.dispatch('loadFeeds')
        this.$store.dispatch('loadArticles')
      })
    })
  },
  methods: {
    getFeed (id) {
      if (this.$store.state.Feed.feeds.length > 0) {
        return this.$store.state.Article.articles.filter(article => article.articles.feed_uuid === id).length
      } else {
        return 0
      }
      // const data = await db.fetchArticlesByFeed(id)
      // return data.length
    },
    getCategory (id) {
      // if (this.$store.state.Article.articles.length > 0) {
      //   return this.$store.state.Article.articles.filter(article => article.articles.category === id).length
      // } else {
      //   return 0
      // }
    },
    onCtxOpen (locals) {
      this.feedMenuData = locals.feed
    },
    resetCtxLocals () {
      this.feedMenuData = null
    },
    categoryFeeds (feeds, category) {
      const items = feeds
        .filter(item => item.category === category)
        .map(feed => ({
          ...feed,
          isActive: this.isFeedActive(feed)
        }))
      const sorted = items.sort((a, b) => {
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
    categoryHandler (feed) {
      this.setActiveFeedId(feed)
      bus.$emit('change-article-list', {
        type: 'category-page',
        feed: null,
        category: feed.title,
        search: null
      })
    },
    mapFeeds (feeds, category) {
      const mixed = feeds.concat(category)
      const items = mixed.map(feed => ({
        ...feed,
        isActive: this.isFeedActive(feed)
      }))
      const sorted = items.sort((a, b) => {
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
    markFeedRead (id) {
      const articles = this.$store.state.Article.articles.filter((item) => {
        return item.articles.feed_uuid === id
      }).map(item => item.articles.uuid)
      db.markAllRead(articles).then(() => {
        const feedBinArticles = this.$store.state.Article.articles.filter((item) => {
          return item.articles.feed_uuid === id
        })
          .map(item => item.articles.source_id)
          .filter(item => item !== null)
        this.feedBinArticleRead(feedBinArticles)
        this.$store.dispatch('loadArticles')
      })
    },
    async unsubscribeFeed (id, category = null) {
      await this.$emit('delete', 'yes')
      await this.$store.dispatch('deleteFeed', id)
      await this.$store.dispatch('loadFeeds')
    },
    openCategoryEditModal (category) {
      this.activeFeed = category
    },
    openEditModal (feed) {
      this.activeFeed = feed
    },
    openCategoryMenu (e, feed) {
      window.electron.createContextMenu('category', feed)
    },
    openFeedMenu (e, feed) {
      window.electron.createContextMenu('feed', feed)
    },
    feedBinArticleRead (ids) {
      if (this.$store.state.Setting.feedbin_connected) {
        feedbin.markItem(this.$store.state.Setting.feedbin, 'MARK_READ', ids)
      }
    },
    navigateFeed (id) {
      bus.$emit('change-article-list', {
        type: 'feed',
        feed: id,
        category: null,
        search: null
      })
    }
  }
}
</script>
