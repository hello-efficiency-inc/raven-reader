function execTask (eventName, instance, args) {
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
      if (instance.$route.params.id) {
        const index = instance.$store.getters.filteredArticles.findIndex(
          item => item.articles.id === instance.$route.params.id
        )
        if (index !== instance.$store.getters.filteredArticles.length - 1) {
          const nextArticle = instance.$store.getters.filteredArticles[index + 1]
          instance.$router.push({
            name: 'article-page',
            params: {
              id: nextArticle.articles.id
            }
          })
        }
      } else {
        instance.$router.push({
          name: 'article-page',
          params: {
            id: instance.$store.getters.filteredArticles[0].articles.id
          }
        })
      }
      break
    case 'Previous item':
      if (instance.$route.params.id) {
        const index = instance.$store.getters.filteredArticles.findIndex(
          item => item.articles.id === instance.$route.params.id
        )
        if (index > 0) {
          const prevArticle = instance.$store.getters.filteredArticles[index - 1]
          instance.$router.push({
            name: 'article-page',
            params: {
              id: prevArticle.articles.id
            }
          })
        }
      } else {
        const articleLength = instance.$store.getters.filteredArticles.length
        instance.$router.push({
          name: 'article-page',
          params: {
            id: instance.$store.getters.filteredArticles[articleLength - 1].articles.id
          }
        })
      }
      break
    case 'Save offline':
      if (instance.$route.params.id && instance.$refs.articleDetail) {
        instance.$refs.articleDetail.$refs.articleToolbar.$refs.saveoffline.click()
      }
      break
    case 'Toggle favourite':
      if (instance.$route.params.id && instance.$refs.articleDetail) {
        instance.$refs.articleDetail.$refs.articleToolbar.markFavourite()
      }
      break
    case 'Toggle read':
      if (instance.$route.params.id && instance.$refs.articleDetail) {
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
      if (instance.$route.params.id && instance.$refs.articleDetail) {
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
