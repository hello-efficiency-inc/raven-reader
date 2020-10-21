import dayjs from 'dayjs'

const RssParser = window.rssParser
const parser = new RssParser({
  requestOptions: {
    rejectUnauthorized: false
  },
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
export async function parseFeed (feedUrl, category = null) {
  let feed
  const feeditem = {
    meta: '',
    posts: []
  }
  try {
    feed = await parser.parseURL(feedUrl)
  } catch (e) {
    const stream = await window.got.stream(feedUrl, {
      https: {
        rejectUnauthorized: false
      },
      retries: 0,
      headers: {
        'user-agent': 'Raven Reader'
      }
    })
    feed = await parseFeedParser(stream)
  }

  feeditem.meta = {
    id: window.uuidstring(feedUrl),
    uuid: window.uuidstring(feedUrl),
    link: feed.link,
    category: category,
    xmlurl: feedUrl,
    favicon: `https://www.google.com/s2/favicons?domain=${feed.link}`,
    description: feed.description ? feed.description : null,
    title: feed.title
  }
  feeditem.posts = feed.items
  console.log(feeditem)
  const response = await ParseFeedPost(feeditem)
  return response
}

export async function parseFeedParser (stream) {
  const feed = {
    items: []
  }
  return new Promise((resolve, reject) => {
    const FeedParser = window.feedparser
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
  const feeditems = JSON.parse(JSON.stringify(feed))
  feeditems.posts.map((item) => {
    const podcast = checkIsPodCast(item)
    const articleLink = item.link ?? feed.meta.xmlurl ?? Math.random().toString(36).substring(7)
    if (podcast) {
      item.id = window.uuidstring(item.enclosure.url)
      item.uuid = window.uuidstring(item.enclosure.url)
    } else {
      item.id = window.uuidstring(articleLink)
      item.uuid = window.uuidstring(articleLink)
    }
    item.favourite = false
    item.read = false
    item.offline = false
    item.podcast = podcast ?? false
    item.played = false
    item.feed_uuid = feed.meta.uuid
    item.category = feed.meta.category
    item.pubDate = item.isoDate
    item.publishUnix = dayjs(item.isoDate).unix()
    const {
      creator,
      ...postItem
    } = item
    delete postItem['dc:creator']
    return postItem
  })
  return feeditems
}

function checkIsPodCast (post) {
  return typeof post.enclosure !== 'undefined' &&
  post.enclosure.length && post.enclosure.type.indexOf('audio') !== -1
}
