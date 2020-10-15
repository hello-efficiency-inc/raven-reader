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
      title: 'RSS Reader',
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
  queue (concurrency = 2) {
    let running = 0
    const taskQueue = []

    const runTask = (task) => {
      running++
      task(_ => {
        running--
        if (taskQueue.length > 0) {
          runTask(taskQueue.shift())
        }
      })
    }

    const enqueueTask = task => taskQueue.push(task)

    return {
      push: task =>
        running < concurrency ? runTask(task) : enqueueTask(task)
    }
  },
  addArticles (posts) {
    db.addArticles(posts.map(item => database.articleTable.createRow(item)))
  },
  subscribe (feeds, category = null, refresh = false, importData = false) {
    const task = (task, category, refresh) => {
      if (category !== null) {
        store.dispatch('addCategory', category).then(() => store.dispatch('loadCategories'))
      }
      store.dispatch('addFeed', task.feed.meta)
      if (refresh) {
        window.log.info('Refreshing feeds')
        db.fetchArticlesByFeed(task.feed.meta.uuid).then((currentArticles) => {
          const filteredPosts = task.feed.posts.filter((item) => {
            return !currentArticles.map(current => current.uuid).includes(item.uuid)
          })
          if (filteredPosts.length > 0) {
            this.addArticles(filteredPosts)
          }
        })
      } else {
        this.addArticles(task.feed.posts)
      }
      store.dispatch('loadArticles')
    }

    const runner = this.queue(3)

    feeds.forEach(async function (feed) {
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

      category = category ?? feed.category ?? null
      const categoryObj = {
        id: window.uuidstring(category),
        title: category,
        type: 'category'
      }
      const feeditem = await parseFeed(url, category)
      const taskItem = done => setTimeout(() => {
        task({
          feed: feeditem
        },
        categoryObj,
        refresh
        )
        done()
      }, 1000)
      runner.push(taskItem)
    })
  }
}
