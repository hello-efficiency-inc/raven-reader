import { MERCURY_API_TOKEN } from '../config'
import _ from 'lodash'

export default {
  async getCachedArticleData (id, url) {
    const articleRequest = new Request(`https://mercury.postlight.com/parser?url=${url}`, {
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': MERCURY_API_TOKEN
      }
    })
    const cacheName = `raven-${id}`
    const cacheKeys = await caches.keys()
    const check = _.indexOf(cacheKeys, cacheName)
    if (check >= 0) {
      const cache = await caches.open(cacheName)
      const response = await cache.match(articleRequest, {
        ignoreSearch: true,
        ignoreMethod: true
      })
      return response.json()
    }
    return null
  },
  async cacheArticleData (responseData) {
    const cacheName = `raven-${responseData._id}`
    const cache = await caches.open(cacheName)
    const previouslyCached = await this.isCached(cacheName)
    var imgRe = /<img[^>]*src=(['"])(.*?)\1[^>]*>/ig
    var imgSrcs = new Set()
    let regexResult
    if (!previouslyCached) {
      this.uncache(cacheName)
    }

    while (regexResult !== null) {
      regexResult = imgRe.exec(responseData.content)
      if (regexResult !== null) {
        const urlString = regexResult[2].replace(/\\u[\dA-F]{4}/gi, (match) => {
          return String.fromCharCode(parseInt(match.replace(/\\u/g, ''), 16))
        })
        const multipleUrls = urlString.split(',')
        if (multipleUrls.length > 0) {
          for (let i = 0; i < multipleUrls.length; ++i) {
            imgSrcs.add(multipleUrls[i])
          }
        } else {
          imgSrcs.add(regexResult[2])
        }
      }
    }

    imgSrcs.forEach(url => {
      var request = new Request(url, { mode: 'no-cors' })
      caches.match(request).then(response => response || fetch(request)).then(response => cache.put(request, response))
    })

    const articleRequest = new Request(`https://mercury.postlight.com/parser?url=${responseData.url}`, {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': MERCURY_API_TOKEN
      }
    })
    cache.put(articleRequest, new Response(JSON.stringify(responseData), {
      headers: {
        'Content-type': 'application/json'
      }
    }))
  },
  async uncache (name) {
    const cacheKeys = await caches.keys()
    const check = _.indexOf(cacheKeys, name)
    if (check >= 0) {
      return caches.delete(name)
    }
    return false
  },
  async isCached (name) {
    return caches.has(name)
  }
}
