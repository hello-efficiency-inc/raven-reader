<template>
  <div
    class="artcle-list-item"
    mark="article"
    @contextmenu.prevent="openArticleContextMenu($event, { article: article.articles })"
  >
    <a
      href="#"
      :class="{ 'article-read': article.articles.read }"
      class="list-group-item list-group-item-action flex-column align-items-start"
      @click="handleArticle(article.articles.id)"
    >
      <div class="d-flex flex-row justify-content-between w-100">
        <p class="mb-1">
          <small><img
            v-if="article.feeds.favicon"
            :src="article.feeds.favicon"
            width="16"
            height="16"
            class="mr-2"
          > {{ article.feeds.title }}</small>
        </p>
        <p
          class="mb-2"
        >
          <small><time
            :title="formatString(article.articles)"
            :datetime="formatString(article.articles)"
          >{{ formatDate(article.articles) }}</time></small>
        </p>
      </div>
      <h6><strong>{{ article.articles.title }}</strong></h6>
      <img
        v-if="!disableImages && article.articles.cover"
        :src="article.articles.cover"
        class="img-fluid ratio-16x9 my-2"
        :alt="article.articles.title"
        loading="lazy"
      >
      <p v-if="contentPreview">{{ article.articles.contentSnippet }}</p>
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
import utc from 'dayjs/plugin/utc'
import advanced from 'dayjs/plugin/advancedFormat'
import timezone from 'dayjs/plugin/timezone'
import relativeTime from 'dayjs/plugin/relativeTime'
import localizedFormat from 'dayjs/plugin/localizedFormat'
dayjs.tz.setDefault(Intl.DateTimeFormat().resolvedOptions().timeZone)
dayjs.extend(relativeTime)
dayjs.extend(timezone)
dayjs.extend(advanced)
dayjs.extend(localizedFormat)
dayjs.extend(utc)

const tz = dayjs.tz.guess()
dayjs.tz.setDefault(tz)

export default {
  props: {
    article: {
      type: Object,
      default: null
    }
  },
  computed: {
    disableImages () {
      return this.$store.state.Setting.disableImages
    },
    contentPreview () {
      return this.$store.state.Setting.contentPreview
    }
  },
  methods: {
    formatString (article) {
      if (article.source === 'inoreader' || article.source === 'greader' || article.source === 'fever') {
        return dayjs.unix(article.publishUnix).format('LLLL')
      } else {
        return dayjs(article.pubDate).tz(tz).format('LLLL')
      }
    },
    formatDate (article) {
      let formatDate
      if (article.source === 'inoreader' || article.source === 'greader' || article.source === 'fever') {
        formatDate = dayjs.unix(article.publishUnix).fromNow()
      } else if (article.source === 'fever') {
        formatDate = dayjs.unix(article.pubDate).fromNow()
      } else {
        formatDate = dayjs(article.pubDate)
          .fromNow()
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
