import dayjs from 'dayjs'
import uuidstring from 'uuid-by-string'
import truncate from '../services/truncate'

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
    feed = await window.rss.parseRssUrl(feedUrl)
  } catch (e) {
    console.error(e)
    window.log.info(e)
  }

  if (feed) {
    feeditem.meta = {
      id: uuidstring(feedUrl),
      uuid: uuidstring(feedUrl),
      link: feed.link,
      category: category,
      xmlurl: feedUrl,
      favicon: `https://www.google.com/s2/favicons?domain=${feed.link}`,
      description: feed.description ? feed.description : null,
      title: feed.title,
      source: 'local',
      source_id: null
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
      item.id = uuidstring(item.enclosure.url)
      item.uuid = uuidstring(item.enclosure.url)
    } else {
      item.id = uuidstring(articleLink)
      item.uuid = uuidstring(articleLink)
    }
    if (item['media:group']) {
      item.media = {
        url: item['media:group']['media:content'] ? item['media:group']['media:content'][0].$.url : null,
        description: item['media:group']['media:description'] ? item['media:group']['media:description'][0] : null,
        title: item['media:group']['media:title'] ? item['media:group']['media:title'][0] : null
      }
    } else {
      item.media = null
    }
    item.content = window.sanitize.sanitizeHtml(item.content)
    item.cover = item['media:content'] ? item['media:content'].$.url : getCoverImage(item.content)
    item.contentSnippet = window.sanitize.sanitizeHtml(truncate(item.contentSnippet, 100))
    item.favourite = false
    item.read = false
    item.keep_read = null
    item.offline = false
    item.podcast = podcast ?? false
    item.played = false
    item.feed_uuid = feed.meta.uuid
    item.category = feed.meta.category
    item.pubDate = item.isoDate
    item.publishUnix = dayjs(item.isoDate).unix()
    item.source = 'local'
    item.source_id = null
    const postItem = omit(item, ['media:group', 'guid', 'isoDate', 'creator', 'dc:creator', 'content:encoded', 'content:encodedSnippet'])
    return postItem
  })
  feeditems.posts = posts
  return feeditems
}

function getCoverImage (postContent) {
  const dom = new DOMParser()
  const doc = dom.parseFromString(postContent, 'text/html')
  const image = doc.querySelector('img')
  if (image !== null && typeof image.getAttribute('src') !== 'undefined' && image.getAttribute('src').startsWith('https://')) {
    return doc.querySelector('img').getAttribute('src')
  }
  return null
}

function checkIsPodCast (post) {
  return typeof post.enclosure !== 'undefined' &&
  post.enclosure.length && post.enclosure.type.indexOf('audio') !== -1
}
