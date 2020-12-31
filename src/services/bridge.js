import bus from './bus'
function execTask (eventName, instance, args) {
  const currentId = instance.$store.state.FeedManager.activeArticleId
  switch (eventName) {
    case 'Add subscription':
      if (instance.$refs.subscribetoolbar) {
        instance.$refs.subscribetoolbar.$refs.subscribefeed.click()
      }
      break
    case 'Dark mode':
      if (instance.$electronstore.get('settings.theme_option') === 'system') {
        instance.setTheme('system')
      }
      break
    case 'Next item':
      if (currentId) {
        const index = instance.$store.getters.filteredArticles.findIndex(
          item => item.articles.id === currentId
        )
        if (index !== instance.$store.getters.filteredArticles.length - 1) {
          const nextArticle = instance.$store.getters.filteredArticles[index + 1]
          bus.$emit('change-article-list', {
            type: 'article-page',
            id: nextArticle.articles.id
          })
          bus.$emit('change-active-article', nextArticle.articles.id)
          instance.$store.dispatch('setActiveArticleId', nextArticle.articles.id)
        }
      } else {
        const articleId = instance.$store.getters.filteredArticles[0].articles.id
        bus.$emit('change-article-list', {
          type: 'article-page',
          id: articleId
        })
        bus.$emit('change-active-article', articleId)
        instance.$store.dispatch('setActiveArticleId', articleId)
      }
      break
    case 'Previous item':
      if (currentId) {
        const index = instance.$store.getters.filteredArticles.findIndex(
          item => item.articles.id === currentId
        )
        if (index > 0) {
          const prevArticle = instance.$store.getters.filteredArticles[index - 1]
          bus.$emit('change-article-list', {
            type: 'article-page',
            id: prevArticle.articles.id
          })
          bus.$emit('change-active-article', prevArticle.articles.id)
          instance.$store.dispatch('setActiveArticleId', prevArticle.articles.id)
        }
      } else {
        const articleLength = instance.$store.getters.filteredArticles.length
        bus.$emit('change-article-list', {
          type: 'article-page',
          id: instance.$store.getters.filteredArticles[articleLength - 1].articles.id
        })
        bus.$emit('change-active-article', instance.$store.getters.filteredArticles[articleLength - 1].articles.id)
        instance.$store.dispatch('setActiveArticleId', instance.$store.getters.filteredArticles[articleLength - 1].articles.id)
      }
      break
    case 'Save offline':
      if (currentId && instance.$refs.articleDetail) {
        instance.$refs.articleDetail.$refs.articleToolbar.$refs.saveoffline.click()
      }
      break
    case 'Toggle favourite':
      if (currentId && instance.$refs.articleDetail) {
        instance.$refs.articleDetail.$refs.articleToolbar.markFavourite()
      }
      break
    case 'Toggle read':
      if (currentId && instance.$refs.articleDetail) {
        instance.$refs.articleDetail.$refs.articleToolbar.markRead()
      }
      break
    case 'Settings':
      // instance.$bvModal.show('settings')
      instance.$bvModal.show('preference')
      break
    case 'Import subscriptions':
      instance.$bvModal.show('importfeed')
      break
    case 'Export subscriptions':
      instance.exportOpml()
      break
    case 'Mark all read':
      instance.$refs.markallread.click()
      break
    case 'View in browser':
      if (currentId && instance.$refs.articleDetail) {
        instance.$refs.articleDetail.$refs.articleToolbar.$refs.openlink.click()
      }
      break
    case 'onlinestatus':
      instance.$store.dispatch('setOffline', status)
      break
  }
}

export default function (eventNames, instance) {
  eventNames.forEach(eventName => {
    window.api.ipcRendReceive(eventName, (event, args) => {
      execTask(eventName, instance, args)
    })
  })
}
