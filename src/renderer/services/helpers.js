import store from '../store'
import { parseFeed } from '../parsers/feed'
import uuid from 'uuid/v4'
import opmlGenerator from 'opml-generator'
import async from 'async'
import favicon from 'favicon'
import normalizeUrl from 'normalize-url'

export default {
  exportOpml () {
    const header = {
      'title': 'RSS Reader',
      'dateCreated': new Date(2014, 2, 9)
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
  subscribe (feeds, faviconData = null, refresh = false, importData = false) {
    const q = async.priorityQueue((task, cb) => {
      if (!refresh) {
        task.feed.meta.favicon = task.favicon
        task.feed.meta.id = uuid()
        store.dispatch('addFeed', task.feed.meta)
      }
      task.feed.posts.forEach((post) => {
        post.feed_id = task.feed.meta.id
        post.meta.favicon = task.favicon
        store.dispatch('addArticle', post)
      })
      cb()
    }, 1)

    feeds.forEach(async function (feed) {
      let faviconUrl
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

      const htmlLink = feed.link ? feed.link : feed.url
      const feeditem = await parseFeed(url)
      if (faviconData) {
        faviconUrl = faviconData
      } else {
        faviconUrl = await new Promise((resolve, reject) => {
          favicon(htmlLink, (err, url) => {
            if (err) {
              reject(err)
            }
            resolve(normalizeUrl(url))
          })
        })
      }
      q.push({ feed: feeditem, favicon: faviconUrl }, (err) => {
        if (err) throw err
        console.log(`Feed queued`)
      })
    })

    q.drain = () => {
      console.log('all feeds are processed')
    }
  }
}
