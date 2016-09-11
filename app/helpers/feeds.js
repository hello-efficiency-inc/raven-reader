import got from 'got'
import cheerio from 'cheerio'
import striptags from 'striptags'
import he from 'he'
import Parsefeed from 'feedparser'
import Stream from 'stream'
import iconv from 'iconv-lite'
import moment from 'moment'
import urlUtil from 'url'
import _ from 'lodash'

export default class {
  constructor (url) {
    this.url = url
    this.blacklisted = [
      'http://readwrite.com',
      'http://www.readwrite.com'
    ]
  }

  streamFeed (body) {
    let meta
    let articles = []

    let s = new Stream()
    s.readable = true
    s.pipe(new Parsefeed()).on('meta', m => {
      meta = m
    }).on('readable', function () {
      let stream = this
      let item = stream.read()
      while (item) {
        articles.push(item)
        item = stream.read()
      }
    })

    s.emit('data', body)
    s.emit('end')

    let checkTitle = meta.title.indexOf('|')

    return {
      meta: {
        title: checkTitle > -1 ? meta.title.substring(0, checkTitle !== -1 ? checkTitle : meta.title.length) : meta.title,
        description: meta.description,
        link: meta.link,
        favicon: meta.favicon,
        url: meta.xmlUrl ? meta.xmlUrl : this.url
      },
      articles: articles.map(item => {
        return {
          guid: item.guid,
          author: item.author,
          source: item.source,
          title: he.decode(item.title),
          read: false,
          favourite: false,
          summary: _.truncate.prune(he.decode(striptags(item.summary)), 120),
          tags: [],
          link: item.origlink ? item.origlink : item.link,
          pubDate: moment(item.pubDate).format('X')
        }
      })
    }
  }

  normalizeEncoding (buffer) {
    let body = buffer.toString()
    let encoding

    let xmlDeclaration = body.match(/^<\?xml .*\?>/)
    if (xmlDeclaration) {
      let encodingDeclaration = xmlDeclaration[0].match(/encoding=("|').*?("|')/)
      if (encodingDeclaration) {
        encoding = encodingDeclaration[0].substring(10, encodingDeclaration[0].length - 1)
      }
    }

    if (encoding && encoding.toLowerCase() !== 'utf-8') {
      try {
        body = iconv.decode(buffer, encoding)
      } catch (err) {
      }
    }

    return body
  }

  processFeed (body) {
    return new Promise((resolve, reject) => {
      resolve(this.streamFeed(this.normalizeEncoding(body)))
    })
  }

  findFeedUrlInHtml (body, url) {
    let dom = cheerio.load(body)
    let href = dom('link[type="application/rss+xml"]').attr('href')
    if (!href) {
      href = dom('link[type="application/atom+xml"]').attr('href')
    } else {
      if (!href.match(/^http/)) {
        href = urlUtil.resolve(url, href)
      }
      return href
    }
    return null
  }

  processUrl (url) {
    console.log('Fetching ' + url)
    let self = this
    let promise = new Promise((resolve, reject) => {
      got(url)
      .then(response => {
        self.processFeed(response.body).then(resdata => {
          resolve(resdata)
        }, err => {
          if (err) {}
          let link = self.findFeedUrlInHtml(response.body, self.url)
          if (link !== null) {
            got(link).then(response => {
              self.processFeed(response.body)
              .then(data => {
                resolve(data)
              })
            })
          } else {
            resolve(null)
          }
        })
      }, err => {
        if (err) {}
      })
    })
    return promise
  }

  fetchNewArticles (url) {
    console.log(url)
    let self = this
    let promise = new Promise((resolve, reject) => {
      got(url, (error, body, response) => {
        if (!error) {
          self.feedParser(body)
          .then((data) => {
            resolve(data)
          })
        }
      })
    })
    return promise
  }

  init () {
    if (!this.url.match(/^http/)) {
      this.url = 'http://' + this.url
    }
    let promise = new Promise((resolve, reject) => {
      let checkUrl = _.includes(this.blacklisted, this.url)
      if (!checkUrl) {
        resolve(this.processUrl(this.url))
      } else {
        reject('blacklisted')
      }
    })
    return promise
  }
}
