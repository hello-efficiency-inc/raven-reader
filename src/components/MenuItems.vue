<template>
  <ul class="nav flex-column">
    <li class="nav-item">
      <router-link
        class="nav-link feed-mix-link"
        to="/all"
        tag="div"
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
        tag="div"
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
        tag="div"
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
        tag="div"
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
        to="/played"
        tag="div"
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
        tag="div"
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
</template>
<script>
import articleCount from '../mixins/articleCount'

export default {
  mixins: [
    articleCount
  ],
  data () {
    return {
      showLess: false
    }
  },
  methods: {
    showLessItems () {
      this.showLess = !this.showLess
    }
  }
}
</script>
