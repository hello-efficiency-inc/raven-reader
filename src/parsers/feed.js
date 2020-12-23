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

const omit = (obj, props) => {
  obj = {
    ...obj
  }
  props.forEach(prop => delete obj[prop])
  return obj
}

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
    window.log.info(e)
  }

  if (feed) {
    feeditem.meta = {
      id: window.uuidstring(feedUrl),
      uuid: window.uuidstring(feedUrl),
      link: feed.link,
      category: category,
      xmlurl: feedUrl,
      favicon: `https://www.google.com/s2/favicons?domain=${feed.link}`,
      description: feed.description ? feed.description : null,
      title: feed.title,
      source: 'local'
    }
    feeditem.posts = feed.items
    const response = await ParseFeedPost(feeditem)
    return response
  }
  return false
}

/**
 * Custom parsing of the posts
 * @param array posts
 * @constructor
 */
export function ParseFeedPost (feed) {
  const feeditems = JSON.parse(JSON.stringify(feed))
  const posts = feeditems.posts.map((item) => {
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
    item.source = 'local'
    item.source_id = null
    const postItem = omit(item, ['guid', 'isoDate', 'creator', 'dc:creator', 'content:encoded', 'content:encodedSnippet'])
    return postItem
  })
  feeditems.posts = posts
  return feeditems
}

function checkIsPodCast (post) {
  return typeof post.enclosure !== 'undefined' &&
  post.enclosure.length && post.enclosure.type.indexOf('audio') !== -1
}
