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
          <feather-icon name="list" />{{ $t('All Feeds') }}
          <span
            v-if="isMenuItemActive('all')"
            class="sr-only"
          >(current)</span>
          <span
            v-if="getAllCount > 0"
            class="items-counter"
          >{{ getAllCount }}</span>
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
          <feather-icon name="star" />{{ $t('Favourites') }}
          <span
            v-if="isMenuItemActive('favourites')"
            class="sr-only"
          >(current)</span>
          <span
            v-if="getFavouriteCount > 0"
            class="items-counter"
          >{{ getFavouriteCount }}</span>
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
          <feather-icon name="circle" />{{ $t('Unread Articles') }}
          <span
            v-if="isMenuItemActive('unread')"
            class="sr-only"
          >(current)</span>
          <span
            v-if="getUnreadCount > 0"
            class="items-counter"
          >{{ getUnreadCount }}</span>
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
          />{{ $t('Recently Read') }}
          <span
            v-if="isMenuItemActive('read')"
            class="sr-only"
          >(current)</span>
          <span
            v-if="getReadCount > 0"
            class="items-counter"
          >{{ getReadCount }}</span>
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
          <feather-icon name="play-circle" />{{ $t('Recently Played') }}
          <span
            v-if="isMenuItemActive('played')"
            class="sr-only"
          >(current)</span>
          <span
            v-if="getPlayedCount > 0"
            class="items-counter"
          >{{ getPlayedCount }}</span>
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
          <feather-icon name="wifi-off" />{{ $t('Saved articles') }}
          <span
            v-if="isMenuItemActive('saved')"
            class="sr-only"
          >(current)</span>
          <span
            v-if="getSavedCount > 0"
            class="items-counter"
          >{{ getSavedCount }}</span>
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
          <feather-icon name="arrow-down" /> {{ $t('Show more') }}
        </template>
        <template v-if="!showLess">
          <feather-icon name="arrow-up" /> {{ $t('Show less') }}
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
    getAllCount () {
      return this.$store.state.Article.articles.length
    },
    getFavouriteCount () {
      return this.$store.state.Article.articles.filter(article => article.articles.favourite).length
    },
    getUnreadCount () {
      return this.$store.state.Article.articles.filter(article => !article.articles.read).length
    },
    getReadCount () {
      return this.$store.state.Article.articles.filter(article => article.articles.read).length
    },
    getPlayedCount () {
      return this.$store.state.Article.articles.filter(article => article.articles.podcast && article.articles.played).length
    },
    getSavedCount () {
      return this.$store.state.Article.articles.filter(article => article.articles.offline).length
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
