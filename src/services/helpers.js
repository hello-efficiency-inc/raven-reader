import store from '../store'
import {
  parseFeed
} from '../parsers/feed'
import opmlGenerator from 'opml-generator'
import db from './db.js'
import * as database from '../db'

export default {
  exportOpml () {
    const header = {
      title: 'Raven Reader',
      dateCreated: new Date(2014, 2, 9)
    }
    const outlines = []
    store.state.Feed.feeds.forEach((feed) => {
      outlines.push({
        text: feed.description ? feed.description : '',
        title: feed.title,
        type: 'rss',
        xmlUrl: feed.xmlurl,
        htmlUrl: feed.link
      })
    })

    return opmlGenerator(header, outlines)
  },
  addCategories (categories) {
    return db.addCategory(categories.map(item => database.categoryTable.createRow(item)))
  },
  addFeeds (feeds) {
    return db.addFeed(feeds.map(item => database.feedTable.createRow(item)))
  },
  addArticles (posts) {
    return db.addArticles(posts.map(item => database.articleTable.createRow(item)))
  },
  subscribe (feeds, category = null, refresh = false, importData = false) {
    const items = feeds.map(async (feed) => {
      let url

      if (!importData) {
        url = feed.url
      }

      if (feed.xmlurl) {
        url = feed.xmlurl
      }

      if (feed.feedUrl) {
        url = feed.feedUrl
      }

      const categoryItem = category ?? feed.category ?? null
      const categoryObj = categoryItem ? {
        id: window.uuidstring(categoryItem),
        title: categoryItem,
        type: 'category'
      } : null
      const feeditem = await parseFeed(url, categoryItem)
      console.log(feeditem)
      return {
        feed: feeditem.meta,
        posts: feeditem.posts,
        category: categoryObj
      }
    })

    return Promise.all(items).then((result) => {
      const feeds = result.map((item) => item.feed)
      const categories = result.map((item) => item.category)
      const articles = result.map((item) => item.posts).flat()
      if (!refresh) {
        this.addCategories(categories.filter(item => item !== null)).then(() => store.dispatch('loadCategories'))
        this.addFeeds(feeds).then(() => store.dispatch('loadFeeds'))
      }
      if (refresh) {
        window.log.info('Refreshing feeds')
        db.fetchArticlesByFeedMulti(feeds.map(item => item.uuid)).then((currentArticles) => {
          const filteredPosts = articles.filter((item) => {
            return !currentArticles.map(current => current.uuid).includes(item.uuid)
          })
          window.log.info(`Refresh count: ${filteredPosts.length}`)
          if (filteredPosts.length > 0) {
            this.addArticles(filteredPosts).then(() => {
              store.dispatch('loadArticles')
              const notification = new Notification('Raven Reader', {
                body: `Successfully fetched ${filteredPosts.length} new articles.`
              })
              notification.onclick = () => {
                console.log('Notification clicked')
              }
            })
          } else {
            window.log.info('Nothing to refresh')
          }
        })
      } else {
        this.addArticles(articles).then(() => store.dispatch('loadArticles'))
      }
    })
  }
}
