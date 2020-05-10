import store from '../store'
import { parseFeed } from '../parsers/feed'
import uuid from 'uuid-by-string'
import opmlGenerator from 'opml-generator'
import async from 'async'
import db from './db.js'
import notifier from 'node-notifier'
import dayjs from 'dayjs'
import _ from 'lodash'

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
  subscribe (feeds, category = null, faviconData = null, refresh = false, importData = false) {
    const q = async.queue((task, cb) => {
      const posts = []
      if (!refresh) {
        task.feed.meta.favicon = task.favicon
        task.feed.meta.id = uuid(task.feed.meta.xmlurl)
        store.dispatch('addFeed', task.feed.meta)
      }
      task.feed.posts.forEach((post) => {
        post.feed_id = task.feed.meta.id
        post.favicon = task.favicon
        post.category = !refresh ? category : task.feed.meta.category
        post.link = post.link ? post.link : task.feed.meta.xmlurl
        if (post.podcast) {
          post.guid = uuid(post.enclosure.url)
        } else {
          post.guid = uuid(post.link ? post.link : task.feed.meta.xmlurl)
        }
        post.publishUnix = dayjs(post.pubDate).unix()
        const postItem = _.omit(post, ['creator', 'dc:creator'])
        posts.push(postItem)
      })
      if (refresh) {
        db.addArticles(posts, docs => {
          if (typeof docs !== 'undefined') {
            notifier.notify({
              type: 'info',
              title: `${docs.length} articles added`,
              timeout: 3,
              sticky: false,
              wait: false,
              sound: true
            })
          }
        })
      } else {
        store.dispatch('addArticle', posts)
      }
      cb()
    }, 2)

    q.drain = () => {
      console.log('all feeds are processed')
    }

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
      q.push({ feed: feeditem, favicon: faviconUrl })
    })
  }
}
