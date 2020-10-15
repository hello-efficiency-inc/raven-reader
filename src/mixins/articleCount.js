export default {
  methods: {
    getArticlesCount (type, feedid) {
      let articles = this.$store.state.Article.articles
      if (type === '' && feedid !== '') {
        articles = articles.filter(article => article.articles.feed_id === feedid)
      }
      if (type === 'read') {
        return articles.filter(article => article.articles.read).length
      } else if (type === 'played') {
        return articles.filter(article => article.articles.podcast && article.articles.played)
          .length
      } else if (type === 'unread') {
        return articles.filter(article => !article.articles.read).length
      } else if (type === 'favourites') {
        return articles.filter(article => article.articles.favourite).length
      } else if (type === 'saved') {
        return articles.filter(article => article.articles.offline).length
      } else if (type === 'category') {
        return articles.filter(article => article.articles.category === feedid).length
      } else {
        // all
        return articles.length
      }
    }
  }
}
