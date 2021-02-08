<template>
  <div
    class="artcle-list-item"
    mark="article"
    @contextmenu.prevent="openArticleContextMenu($event, { article: article.articles })"
  >
    <a
      href=""
      :class="{ 'article-read': article.articles.read }"
      class="list-group-item list-group-item-action flex-column align-items-start"
      @click="handleArticle(article.articles.id)"
    >
      <div class="d-flex flex-column w-100">
        <p class="mb-1">
          <small><img
            v-if="article.feeds.favicon"
            :src="article.feeds.favicon"
            width="16"
            height="16"
            class="mr-2"
          > {{ article.feeds.title }}</small>
        </p>
        <p class="mb-2">
          <small>{{ formatDate(article.articles) }}</small>
        </p>
      </div>
      <h6><strong>{{ article.articles.title }}</strong></h6>
      <p>{{ article.articles.contentSnippet }}</p>
      <p
        v-if="article.articles.favourite"
        class="text-right mb-0"
      >
        <feather-icon
          name="star"
          size="sm"
          :filled="article.articles.favourite"
        />
      </p>
    </a>
  </div>
</template>
<script>
import bus from '../services/bus'
import dayjs from 'dayjs'
import advanced from 'dayjs/plugin/advancedFormat'
import timezone from 'dayjs/plugin/timezone'
import relativeTime from 'dayjs/plugin/relativeTime'
import localizedFormat from 'dayjs/plugin/localizedFormat'
dayjs.tz.setDefault(Intl.DateTimeFormat().resolvedOptions().timeZone)
dayjs.extend(relativeTime)
dayjs.extend(timezone)
dayjs.extend(advanced)
dayjs.extend(localizedFormat)

export default {
  props: {
    article: {
      type: Object,
      default: null
    }
  },
  methods: {
    formatDate (article) {
      let formatDate
      if (article.source === 'inoreader' || article.source === 'greader') {
        formatDate = dayjs.unix(article.pubDate).format('LLL')
      } else {
        formatDate = dayjs(article.pubDate)
          .format('LLL')
      }
      return formatDate
    },
    handleArticle (id) {
      bus.$emit('change-active-article', id)
      bus.$emit('change-article-list', {
        type: 'article-page',
        id: id
      })
      this.$store.dispatch('setActiveArticleId', id)
    },
    openArticleContextMenu (e, article) {
      window.electron.createContextMenu('article', article)
    }
  }
}
</script>
<style lang="scss">
.artcle-list-item {
  -webkit-user-select: none;
  &.active {
    background-color: var(--active-item-background-color);
    border-radius: 0.3rem;
  }

  h6 {
    line-height: 1.5;
  }
}
</style>
