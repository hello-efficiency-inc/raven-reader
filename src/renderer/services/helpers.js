import store from '../store'
import { parseFeed } from '../parsers/feed'
import uuid from 'uuid/v4'
import builder from 'xmlbuilder'

export default {
  exportOpml () {
    const passFeedAttr = (element, feed) => {
      element.att('text', feed.title || '')
      element.att('type', 'rss')
      element.att('xmlUrl', feed.xmlurl)
      if (feed.link) {
        element.att('htmlUrl', feed.link)
      }
    }

    const root = builder.create('opml', {
      version: '1.0',
      encoding: 'UTF-8'
    })

    root.ele('head').ele('title', 'Your RSS Reader Subscriptions')

    const body = root.ele('body')

    store.state.Feed.feeds.forEach((feed) => {
      passFeedAttr(body.ele('outline'), feed)
    })

    return root.end({ pretty: true })
  },
  subscribe (feeds, favicon = null, refresh = false) {
    feeds.forEach(async function (feed) {
      const url = feed.url ? feed.url : feed.xmlurl
      const feeditem = await parseFeed(url)
      if (favicon) {
        feeditem.meta.favicon = favicon
      }
      feeditem.meta.id = uuid()
      try {
        if (!refresh) {
          store.dispatch('addFeed', feeditem.meta)
        }
        feeditem.posts.forEach((post) => {
          post.feed_id = feeditem.meta.id
          if (favicon) {
            post.meta.favicon = favicon
          } else {
            post.meta.favicon = feed.favicon
          }
          store.dispatch('addArticle', post)
        })
      } catch (err) {
      }
    })
  }
}
