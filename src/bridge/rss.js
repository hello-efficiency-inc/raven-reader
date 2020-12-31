import RssParser from 'rss-parser'
import rssFinder from 'rss-finder'
import normalizeUrl from 'normalize-url'

const parser = new RssParser({
  requestOptions: {
    rejectUnauthorized: false
  },
  defaultRSS: 2.0,
  headers: {
    'User-Agent': 'Raven Reader'
  },
  customFields: {
    item: [
      'media:group',
      'media:title',
      'media:content',
      'media:description'
    ]
  }
})

export default {
  async parseRssUrl (url) {
    const result = await parser.parseURL(url)
    return result
  },
  async findRss (url) {
    const result = await rssFinder({
      url: normalizeUrl(url, {
        stripWWW: false,
        removeTrailingSlash: false
      }),
      feedParserOptions: {
        feedurl: url
      }
    })
    return result
  }
}
