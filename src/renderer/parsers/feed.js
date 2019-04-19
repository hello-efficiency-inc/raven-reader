import he from 'he'
import got from 'got'
import FeedParser from 'feedparser'
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
  try {
    feed = await parser.parseURL(feedUrl)
  } catch (e) {
    const stream = await got.stream(feedUrl, { retries: 0 })
    feed = await parseFeedParser(stream)
  }

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

export async function parseFeedParser (stream) {
  const feed = {
    items: []
  }
  return new Promise((resolve, reject) => {
    stream.pipe(new FeedParser())
      .on('error', reject)
      .on('end', () => {
        resolve(feed)
      })
      .on('readable', function () {
        const streamFeed = this
        feed.link = this.meta.link
        feed.feedUrl = this.meta.xmlurl
        feed.description = this.meta.description
        feed.title = this.meta.title
        let item
        while ((item = streamFeed.read())) {
          feed.items.push(item)
        }
      })
  })
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
