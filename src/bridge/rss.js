import RssParser from 'rss-parser'
import rssFinder from 'rss-finder'
import normalizeUrl from 'normalize-url'
import {
  XMLValidator,
  XMLParser
} from 'fast-xml-parser'
import fetch from 'node-fetch'

const parser = new RssParser({
  requestOptions: {
    rejectUnauthorized: false
  },
  defaultRSS: 2.0,
  maxRedirects: 10,
  headers: {
    'User-Agent': 'Raven Reader'
  },
  customFields: {
    item: ['media:group', 'media:title', 'media:content', 'media:description']
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
    const validateXml = XMLValidator.validate(data, {
      allowBooleanAttributes: true
    })
    return validateXml === true
  },
  async parseRssUrl (url) {
    const content = await fetch(
      normalizeUrl(url, { stripWWW: false, removeTrailingSlash: false }),
      {
        cors: 'no-cors',
        referrer: '',
        credentials: 'omit',
        redirect: 'follow'
      }
    )
    const data = await content.text()
    return await parser.parseString(data)
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
  },
  async fetchRss (url) {
    const options = {
      ignoreAttributes: false
    }
    const parse = new XMLParser(options)
    const response = await fetch(normalizeUrl(url, { stripWWW: false, removeTrailingSlash: false }))
    const responseData = await response.text()
    return parse(responseData)
  }
}
