import store from '../store'
import { parseFeed } from '../parsers/feed'
import uuid from 'uuid/v4'

export default {
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
          } else if (post.meta.favicon) {
            post.meta.favicon = post.meta.favicon
          } else {
            post.meta.favicon = feeditem.favicon
          }
          store.dispatch('addArticle', post)
        })
      } catch (err) {
      }
    })
  }
}
