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
    <edit-feed :feed="activeFeed" />
    <edit-category :feed="activeFeed" />
  </div>
</template>
<script>
import articleCount from '../mixins/articleCount'
import dataSets from '../mixins/dataItems'
import feedMix from '../mixins/feedMix'

const { Menu, MenuItem } = window.electron.remote

export default {
  mixins: [articleCount, dataSets, feedMix],
  data () {
    return {
      feed: null,
      feedMenuData: null,
      activeFeed: null
    }
  },
  methods: {
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
    categoryHandler (feed) {
      this.setActiveFeedId(feed)
      this.$router.push({
        name: 'category-page',
        params: { category: feed.title }
      })
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
    markFeedRead (id) {
      this.$store.dispatch('markFeedRead', id)
    },
    copyFeedLink (xml) {
      this.$electron.clipboard.writeText(xml)
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

      menu.popup({ window: window.electron.remote.getCurrentWindow() })
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
            self.unsubscribeFeed(feed.feed.uuid)
          }
        })
      )
      menu.popup({ window: window.electron.remote.getCurrentWindow() })
    }
  }
}
</script>
