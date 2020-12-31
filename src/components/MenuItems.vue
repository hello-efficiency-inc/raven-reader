<template>
  <ul class="nav flex-column">
    <li class="nav-item">
      <a
        href=""
        class="nav-link feed-mix-link menu-link-clickable"
        :class="{ active: isMenuItemActive('all') }"
        @click="handleMenuItem('all')"
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
      </a>
    </li>
    <li class="nav-item">
      <a
        class="nav-link feed-mix-link menu-link-clickable"
        href=""
        :class="{ active: isMenuItemActive('favourites') }"
        @click.prevent="handleMenuItem('favourites')"
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
      </a>
    </li>
    <li class="nav-item">
      <a
        class="nav-link feed-mix-link menu-link-clickable"
        href=""
        :class="{ active: isMenuItemActive('unread') }"
        @click.prevent="handleMenuItem('unread')"
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
      </a>
    </li>
    <li
      class="nav-item"
      :class="{ 'd-none': showLess }"
    >
      <a
        class="nav-link feed-mix-link menu-link-clickable"
        href=""
        :class="{ active: isMenuItemActive('read') }"
        @click.prevent="handleMenuItem('read')"
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
      </a>
    </li>
    <li
      class="nav-item"
      :class="{ 'd-none': showLess }"
    >
      <a
        class="nav-link feed-mix-link menu-link-clickable"
        href=""
        :class="{ active: isMenuItemActive('played') }"
        @click.prevent="handleMenuItem('played')"
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
      </a>
    </li>
    <li
      class="nav-item"
      :class="{ 'd-none': showLess }"
    >
      <a
        class="nav-link feed-mix-link menu-link-clickable"
        href=""
        :class="{ active: isMenuItemActive('saved') }"
        @click.prevent="handleMenuItem('saved')"
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
      </a>
    </li>
    <li class="nav-item">
      <a
        class="nav-link menu-link-clickable"
        href=""
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
</template>
<script>
import bus from '../services/bus'
import feedMix from '../mixins/feedMix'
import articleCount from '../mixins/articleCount'

export default {
  mixins: [
    feedMix,
    articleCount
  ],
  data () {
    return {
      showLess: false
    }
  },
  methods: {
    handleMenuItem (type) {
      bus.$emit('change-article-list', {
        type: 'type-page',
        item: type
      })
    },
    showLessItems () {
      this.showLess = !this.showLess
    }
  }
}
</script>
<style lang="scss" scoped>
.menu-link-clickable {
  cursor: pointer;
}
</style>
