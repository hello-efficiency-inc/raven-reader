import RssParser from 'rss-parser'
import rssFinder from 'rss-finder'
import normalizeUrl from 'normalize-url'
import {
  validate
} from 'fast-xml-parser'
import fetch from 'node-fetch'

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
  async checkXml (link) {
    const content = await fetch(link, {
      cors: 'no-cors',
      referrer: '',
      credentials: 'omit',
      redirect: 'follow'
    })
    const data = await content.text()
    const validateXml = validate(data)
    return validateXml === true
  },
  async parseRssUrl (url) {
    return await parser.parseURL(url)
  },
  async findRss (url) {
    return await rssFinder({
      url: normalizeUrl(url, { stripWWW: false, removeTrailingSlash: false }),
      gotOptions: {
        retryCount: 0,
        https: { rejectUnauthorized: false }
      }
      // feedParserOptions: {
      //   feedUrl: url
      // }
    })
  }
}
