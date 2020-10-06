import store from '../store'
import {
  parseFeed
} from '../parsers/feed'
import opmlGenerator from 'opml-generator'
import db from './db.js'
import dayjs from 'dayjs'

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
  queue (concurrency = 1) {
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
  subscribe (feeds, category = null, refresh = false, importData = false) {
    const task = (task, category, refresh) => {
      const posts = []
      if (!refresh) {
        task.feed.meta.favicon = task.favicon
        task.feed.meta.id = window.uuidstring(task.feed.meta.xmlurl)
        store.dispatch('addFeed', task.feed.meta)
      }
      task.feed.posts.forEach((post) => {
        post.feed_id = task.feed.meta.id
        post.favicon = task.favicon
        post.category = !refresh ? category : task.feed.meta.category
        post.link = post.link ? post.link : task.feed.meta.xmlurl
        if (post.podcast) {
          post.guid = window.uuidstring(post.enclosure.url)
        } else {
          post.guid = window.uuidstring(post.link ? post.link : task.feed.meta.xmlurl)
        }
        post.publishUnix = dayjs(post.pubDate).unix()
        const {
          creator,
          ...postItem
        } = post
        delete postItem['dc:creator']
        posts.push(postItem)
      })
      if (refresh) {
        window.log.info('Refreshing feeds')
        const currentArticles = new Promise((resolve, reject) => {
          db.fetchArticlesByFeed(task.feed.meta.id, docs => {
            resolve(docs)
          })
        })
        currentArticles.then((currentArticles) => {
          const filteredPosts = posts.filter((item) => {
            return !currentArticles.map(current => current.guid).includes(item.guid)
          })
          if (filteredPosts.length > 0) {
            db.addArticles(filteredPosts, docs => {
              if (typeof docs !== 'undefined') {
                window.notifier.notify({
                  title: 'Articles added',
                  message: `${docs.length} articles added`
                })
              }
            })
          }
        })
        store.dispatch('loadArticles')
      } else {
        store.dispatch('addArticle', posts)
      }
    }

    const runner = this.queue(2)

    feeds.forEach(async function (feed) {
      let url
      var faviconUrl

      if (!importData) {
        url = feed.url
      }

      if (feed.xmlurl) {
        url = feed.xmlurl
      }

      if (feed.feedUrl) {
        url = feed.feedUrl
      }

      const feeditem = await parseFeed(url, faviconUrl)
      faviconUrl = `https://www.google.com/s2/favicons?domain=${feeditem.meta.link}`

      if (!refresh) {
        feeditem.meta.category = category
      }
      if (refresh) {
        feeditem.meta.id = feed.id
      }
      const taskItem = done => setTimeout(() => {
        task({
          feed: feeditem,
          favicon: faviconUrl
        },
        category,
        refresh
        )
        done()
      }, 100)
      runner.push(taskItem)
    })
  }
}
