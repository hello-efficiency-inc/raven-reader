import cheerio from 'cheerio'
import got from 'got'
import { remote } from 'electron'
import jetpack from 'fs-jetpack'
import urlUtil from 'url'
import FeedParser from 'feedparser'
import Stream from 'stream'
import DataURI from 'datauri'

export default class {
  // Find Favicon from HTML
  async findFaviconHTML (url, body) {
    const dom = cheerio.load(body)
    let link = dom('link[rel="icon"], link[rel="shortcut icon"], link[rel="shortcut icon prefetch"], link[rel="Shortcut Icon"]').last().attr('href')
    if (link && !link.match(/^http/)) {
      link = urlUtil.resolve(url, link)
    }
    return link
  }

  // Get Type of image from Buffer
  async discoverImageType (url) {
    const response = await got(url, { encoding: null })
    const buf = Buffer.from(new Uint8Array(response.body))
    if (buf.length < 5) {
      return null
    }
    if (buf.readUInt16LE(0) === 0 && buf.readUInt16LE(2) === 1) {
      return 'ico'
    }
    if (buf.slice(1, 4).toString() === 'PNG') {
      return 'png'
    }
    if (buf.slice(0, 3).toString() === 'GIF') {
      return 'gif'
    }
    return null
  }

  // Fetch Favicon
  async fetchFavicon (url) {
    const response = await got(url, {retries: 0})
    const faviconUrl = await this.findFaviconHTML(url, response.body)
    const imageType = await this.discoverImageType(faviconUrl)
    const filename = `${new urlUtil.URL(url).hostname}.${imageType}`
    const useDataDirFavicon = jetpack.cwd(`${remote.app.getPath('userData')}/favicons/`)

    if (!jetpack.exists(useDataDirFavicon.path(filename))) {
      got.stream(faviconUrl).pipe(useDataDirFavicon.createWriteStream(filename))
    }

    const datauri = await DataURI.promise(useDataDirFavicon.path(filename))
    return datauri
  }

  // Search for Feed from HTML
  async findFeedURLInHTML (body, url) {
    const dom = cheerio.load(body)
    let href = dom('link[type="application/rss+xml"]').attr('href')
    if (!href) {
      href = dom('link[type="application/atom+xml"]').attr('href')
    } else {
      if (!href.match(/^http/)) {
        href = urlUtil.resolve(url, href)
      }
    }

    return href
  }

  // Parse Feed Url
  async parseFeed (url, req) {
    const feedparser = new FeedParser()
    let meta, favicon
    const articles = []

    const stream = new Stream()
    stream.readable = true
    stream.pipe(feedparser).on('meta', function (m) {
      meta = m
    }).on('readable', function () {
      let item = this.read()
      while (item) {
        articles.push(item)
        item = this.read()
      }
    })

    stream.emit('data', req.body)
    stream.emit('end')

    if (meta.link) {
      favicon = await this.fetchFavicon(meta.link)
    } else {
      favicon = await this.fetchFavicon(url)
    }

    return {
      meta: {
        title: meta.title,
        link: meta.link,
        xmlUrl: meta.xmlUrl ? meta.xmlUrl : url,
        category: 'Uncategorized',
        favicon: favicon,
        description: meta.description
      },
      articles: articles.map(item => {
        item.read = false
        item.favicon = favicon
        item.category = 'Uncategorized'
        item.favourite = false
        return item
      })
    }
  }

  // Fetch Feed
  async fetchFeed (url) {
    let feedreq, link
    const response = await got(url, { retries: 0 })
    const feedUrl = await this.findFeedURLInHTML(response.body, url)
    if (!feedUrl) {
      feedreq = await got(url, {retries: 0})
      link = url
    } else {
      feedreq = await got(feedUrl, {retries: 0})
      link = feedUrl
    }
    const data = await this.parseFeed(link, feedreq)
    return data
  }
}
