import cheerio from 'cheerio'
import got from 'got'
import request from 'xhr-request'
import urlUtil from 'url'

export default class {
  constructor (url) {
    this.url = url
  }

  findFaviconHTML (url, body) {
    let dom = cheerio.load(body)
    let link = dom('link[rel="icon"], link[rel="shortcut icon"], link[rel="Shortcut Icon"]').last().attr('href')
    if (link && !link.match(/^http/)) {
      link = urlUtil.resolve(url, link)
    }
    return link
  }

  discoverImageType (buffer) {
    if (buffer.length < 5) {
      return null
    }
    if (buffer.readUInt16LE(0) === 0 && buffer.readUInt16LE(2) === 1) {
      return 'ico'
    }
    if (buffer.slice(1, 4).toString() === 'PNG') {
      return 'png'
    }
    if (buffer.slice(0, 3).toString() === 'GIF') {
      return 'gif'
    }
    return null
  }

  init () {
    let self = this
    console.log('Fetching favicon for ' + this.url)
    let promise = new Promise((resolve, reject) => {
      got(this.url, {retries: 0}).then(response => {
        let faviconUrl = this.findFaviconHTML(self.url, response.body)
        if (faviconUrl) {
          request(faviconUrl, {
            responseType: 'arraybuffer'
          }, (err, data) => {
            if (err) throw err
            let buf = new Buffer(new Uint8Array(data))
            let imageType = self.discoverImageType(buf)
            if (imageType) {
              resolve({bytes: buf, format: imageType})
            }
          })
        } else {
          resolve(null)
        }
      }, err => {
        if (err) {}
        resolve(null)
      })
    })
    return promise
  }
}
