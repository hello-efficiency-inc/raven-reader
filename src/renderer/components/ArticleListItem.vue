<template>
  <div
    class="artcle-list-item"
    mark="article"
    :class="{ active: isArticleActive(article) }"
    @click="setActiveArticleId(article)"
    @contextmenu.prevent="openArticleContextMenu($event, { article: article })"
  >
    <router-link
      :to="`/article/${article._id}`"
      :class="{ 'article-read': article.read }"
      class="list-group-item list-group-item-action flex-column align-items-start"
    >
      <div class="d-flex w-100 justify-content-between mb-3">
        <small><img
          v-if="article.favicon"
          :src="article.favicon"
          width="16"
          height="16"
        > {{ article.feed_title }}</small>
        <small>{{ article.formatDate }}</small>
      </div>
      <h6><strong>{{ article.title }}</strong></h6>
    </router-link>
  </div>
</template>
<script>
import cacheService from '../services/cacheArticle'
const { remote } = require('electron')
const { Menu, MenuItem } = require('electron').remote

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
      this.$router.push({ path: `/article/${article.article._id}` })

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
          if (!article.article.read) {
            self.$store.dispatch('markAction', {
              type: markTypes.read,
              id: article.article._id
            })
          } else {
            self.$store.dispatch('markAction', {
              type: markTypes.unread,
              id: article.article._id
            })
          }
        }
      }))
      menu.append(new MenuItem({
        label: !article.article.favourite ? 'Mark as favourite' : 'Remove from favourite',
        click () {
          if (article.article.favourite) {
            self.$store.dispatch('markAction', {
              type: markTypes.unfavourite,
              id: article.article._id
            })
          } else {
            self.$store.dispatch('markAction', {
              type: markTypes.favourite,
              id: article.article._id
            })
          }
        }
      }))
      menu.append(new MenuItem({
        type: 'separator'
      }))
      menu.append(new MenuItem({
        label: !article.article.offline ? 'Save article' : 'Remove saved article',
        click () {
          if (article.article.offline && !self.$store.state.Setting.offline) {
            cacheService.uncache(`raven-${article.article._id}`).then(() => {
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
        }
      }))
      menu.popup({ window: remote.getCurrentWindow() })
      menu.once('menu-will-close', () => {
        menu.destroy()
      })
    },
    setActiveArticleId (article) {
      return this.$store.dispatch('setActiveArticleId', article)
    },
    isArticleActive (article) {
      return !!article && article.id !== undefined && article.id === this.activeArticleId
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
}
</style>
