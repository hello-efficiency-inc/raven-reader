import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import FeedParser from 'feedparser'
import got from 'got'

dayjs.extend(relativeTime)

/**
 * Parse feed
 * @param  string feedUrl
 * @return array
 */
export async function parseFeed (feedUrl) {
  const stream = await ReadFeed(feedUrl)
  const posts = await ReadFeedStream(stream)
  const response = await ParseFeedPost(posts)
  return response
}

/**
 * Read Feed
 * @param string url
 * @constructor
 */
export async function ReadFeed (url) {
  const response = await got.stream(url, { retries: 0 })
  return response
}

/**
 * Read stream and parse it with feed parser
 * @param Stream stream
 * @constructor
 */
export async function ReadFeedStream (stream) {
  const feed = {
    meta: '',
    posts: []
  }
  return new Promise((resolve, reject) => {
    stream.pipe(new FeedParser())
      .on('error', reject)
      .on('end', () => {
        resolve(feed)
      })
      .on('readable', function () {
        const streamFeed = this
        feed.meta = this.meta
        let item
        while ((item = streamFeed.read())) {
          feed.posts.push(item)
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
    item.pubDate = dayjs(item.pubDate).fromNow()
    return item
  })
  return feed
}
