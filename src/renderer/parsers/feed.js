import he from 'he'
import RssParser from 'rss-parser'

const parser = new RssParser({
  defaultRSS: 2.0,
  headers: {
    'User-Agent': 'Raven Reader'
  }
})

/**
 * Parse feed
 * @param  string feedUrl
 * @return array
 */
export async function parseFeed (feedUrl, faviconUrl = null) {
  let feed
  const feeditem = {
    meta: '',
    posts: []
  }
  feed = await parser.parseURL(feedUrl)
  feeditem.meta = {
    link: feed.link,
    xmlurl: feed.feedUrl ? feed.feedUrl : feedUrl,
    favicon: typeof faviconUrl !== 'undefined' ? faviconUrl : null,
    description: feed.description ? feed.description : null,
    title: feed.title
  }
  feeditem.posts = feed.items
  const response = await ParseFeedPost(feeditem)
  return response
}

/**
 * Custom parsing of the posts
 * @param array posts
 * @constructor
 */
export function ParseFeedPost (feed) {
  feed.posts.map((item) => {
    item.favourite = false
    item.read = false
    item.offline = false
    item.favicon = null
    item.feed_title = feed.meta.title
    if (item.content) {
      item.content = he.unescape(item.content)
    }
    return item
  })
  return feed
}
