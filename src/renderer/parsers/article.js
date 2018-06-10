// import dayjs from 'dayjs'
// import normalize from 'normalize-url'
import FeedParser from 'feedparser'
import zlib from 'zlib'
import axios from 'axios'

const useragent = 'RSS Reader'
const acceptheader = 'text/html, application/xhtml+xml, application/xml'

export async function parseFeed (feedUrl) {
  const stream = await ReadFeed(feedUrl)
  const posts = await ReadFeedStream(stream)
  // const response = await ParseFeedPost(posts)
  // return response
  return posts
}

export async function ReadFeed (url) {
  const headers = {
    'User-Agent': useragent,
    'Accept': acceptheader,
    'Accept-Encoding': 'gzip, deflate'
  }
  const response = await axios({
    method: 'get',
    url: url,
    responseType: 'stream',
    timeout: 7000,
    headers: headers,
    maxRedirects: 20
  })
  const encoding = response.headers['content-encoding']
  if (encoding === 'gzip' || encoding === 'deflate') {
    response.data.pipe(zlib.createGunzip())
  }
  return response
}

export async function ReadFeedStream (stream) {
  const posts = []
  return new Promise((resolve, reject) => {
    stream.pipe(new FeedParser())
      .on('error', reject)
      .on('end', () => {
        resolve(posts)
      })
      .on('readable', () => {
        const stream = this
        let item
        while ((item = stream.read())) {
          posts.push(item)
        }
      })
  })
}
