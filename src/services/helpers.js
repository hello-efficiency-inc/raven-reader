import store from '../store'
import {
  parseFeed
} from '../parsers/feed'
import opmlGenerator from 'opml-generator'
import db from './db.js'
import * as database from '../db'
import uuidstring from 'uuid-by-string'

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
      const categoryObj = categoryItem
        ? {
            id: uuidstring(categoryItem),
            title: categoryItem,
            type: 'category'
          }
        : null
      const feeditem = await parseFeed(url, categoryItem)
      if (feeditem) {
        return {
          feed: feeditem.meta,
          posts: feeditem.posts,
          category: categoryObj
        }
      } else {
        return null
      }
    })

    return Promise.all(items).then((result) => {
      const feeds = result.filter(item => item !== null).map((item) => item.feed)
      const categories = result.filter(item => item !== null).map((item) => item.category)
      const articles = result.filter(item => item !== null).map((item) => item.posts).flat()
      const currentArticles = new Set(store.state.Article.articles.map(item => item.articles.uuid).flat())
      if (!refresh) {
        this.addCategories(categories.filter(item => item !== null)).then(() => store.dispatch('loadCategories'))
        this.addFeeds(feeds).then(() => store.dispatch('loadFeeds'))
      }
      if (refresh) {
        window.log.info('Refreshing feeds')
        const postsAdded = articles.filter(item => !currentArticles.has(item.uuid))
        if (postsAdded.length > 0) {
          this.addArticles(postsAdded).then(() => {
            store.dispatch('loadArticles')
            const notification = new Notification('Raven Reader', {
              body: `Successfully fetched ${postsAdded.length} new articles.`
            })
            notification.onclick = () => {
              console.log('Notification clicked')
            }
          })
        } else {
          window.log.info('Nothing to refresh')
        }
      } else {
        this.addArticles(articles).then(() => store.dispatch('loadArticles'))
      }
    })
  }
}
