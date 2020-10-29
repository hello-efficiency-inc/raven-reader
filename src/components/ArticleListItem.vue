<template>
  <div
    class="artcle-list-item"
    mark="article"
    :class="{ active: isArticleActive(article.articles) }"
    @click="setActiveArticleId(article.articles)"
    @contextmenu.prevent="openArticleContextMenu($event, { article: article.articles })"
  >
    <router-link
      :to="`/article/${article.id}`"
      :class="{ 'article-read': article.articles.read }"
      class="list-group-item list-group-item-action flex-column align-items-start"
    >
      <div class="d-flex flex-column w-100">
        <p class="mb-1"><small><img
          v-if="article.feeds.favicon"
          :src="article.feeds.favicon"
          width="16"
          height="16"
          class="mr-2"
        > {{ article.feeds.title }}</small></p>
        <p class="mb-2"><small>{{ article.formatDate }}</small></p>
      </div>
      <h6><strong>{{ article.articles.title }}</strong></h6>
      <p>{{ article.articles.contentSnippet }}</p>
      <p class="text-right mb-0" v-if="article.articles.favourite"><feather-icon
              name="star"
              size="sm"
              :filled="article.articles.favourite"
            /></p>
    </router-link>
  </div>
</template>
<script>
import cacheService from '../services/cacheArticle'
const { Menu, MenuItem } = window.electron.remote

const markTypes = {
  favourite: 'FAVOURITE',
  unfavourite: 'UNFAVOURITE',
  read: 'READ',
  unread: 'UNREAD',
  cache: 'CACHE',
  uncache: 'UNCACHE'
}

export default {
  props: {
    article: {
      type: Object,
      default: null
    }
  },
  computed: {
    activeArticleId () {
      return this.$store.getters.activeArticleId
    }
  },
  methods: {
    copyArticleLink (url) {
      this.$electron.clipboard.writeText(url)
    },
    openArticleContextMenu (e, article) {
      this.$router.push({ path: `/article/${article.article.uuid}` }).then((err) => {
        if (err) {}
      })

      const self = this
      const menu = new Menu()
      menu.append(new MenuItem({
        label: 'Copy link',
        click () {
          self.copyArticleLink(article.article.link)
        }
      }))
      menu.append(new MenuItem({
        type: 'separator'
      }))
      menu.append(new MenuItem({
        label: !article.article.read ? 'Mark as read' : 'Mark as unread',
        click () {
          self.$store.dispatch('markAction', {
            type: !article.article.read ? markTypes.read : markTypes.unread,
            podcast: article.article.podcast,
            id: article.article.uuid
          }).then(() => {
            self.$store.dispatch('loadArticles')
          })
        }
      }))
      menu.append(new MenuItem({
        label: !article.article.favourite ? 'Mark as favourite' : 'Remove from favourite',
        click () {
          self.$store.dispatch('markAction', {
            type: article.article.favourite ? markTypes.unfavourite : markTypes.favourite,
            id: article.article.uuid
          }).then(() => {
            self.$store.dispatch('loadArticles')
          })
        }
      }))
      menu.append(new MenuItem({
        type: 'separator'
      }))
      menu.append(new MenuItem({
        label: !article.article.offline ? 'Save article' : 'Remove saved article',
        click () {
          if (article.article.offline && !self.$store.state.Setting.offline) {
            cacheService.uncache(`raven-${article.article.uuid}`).then(() => {
              self.$store.dispatch('saveArticle', {
                type: markTypes.uncache,
                article: article.article
              })
            })
          } else {
            cacheService.cacheArticleData(article.article).then(() => {
              self.$store.dispatch('saveArticle', {
                type: markTypes.cache,
                article: article.article
              })
            })
          }
          self.$store.dispatch('loadArticles')
        }
      }))
      menu.popup({ window: window.electron.remote.getCurrentWindow() })
    },
    setActiveArticleId (article) {
      return this.$store.dispatch('setActiveArticleId', article)
    },
    isArticleActive (article) {
      return !!article && article.uuid !== undefined && article.uuid === this.activeArticleId
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
