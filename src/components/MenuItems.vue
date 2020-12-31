<template>
  <ul class="nav flex-column">
    <li class="nav-item">
      <a
        class="nav-link feed-mix-link menu-link-clickable"
        href=""
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
            v-if="getAll > 0"
            class="items-counter"
          >{{ getAll }}</span>
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
            v-if="getFavourites > 0"
            class="items-counter"
          >{{ getFavourites }}</span>
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
            v-if="getUnreadArticles > 0"
            class="items-counter"
          >{{ getUnreadArticles }}</span>
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
            v-if="getReadArticles > 0"
            class="items-counter"
          >{{ getReadArticles }}</span>
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
            v-if="getPlayed > 0"
            class="items-counter"
          >{{ getPlayed }}</span>
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
            v-if="getSaved > 0"
            class="items-counter"
          >{{ getSaved }}</span>
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

export default {
  mixins: [
    feedMix
  ],
  data () {
    return {
      showLess: false
    }
  },
  computed: {
    getAll () {
      return this.$store.state.Article.articles.length
    },
    getSaved () {
      return this.$store.state.Article.articles.filter(article => article.articles.offline).length
    },
    getPlayed () {
      return this.$store.state.Article.articles.filter(article => article.articles.podcast && article.articles.played)
        .length
    },
    getFavourites () {
      return this.$store.state.Article.articles.filter(article => article.articles.favourite).length
    },
    getUnreadArticles () {
      return this.$store.state.Article.articles.filter(article => !article.articles.read).length
    },
    getReadArticles () {
      return this.$store.state.Article.articles.filter(article => article.articles.read).length
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
