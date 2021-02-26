import axios from 'axios'
import uuidstring from 'uuid-by-string'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import advancedformat from 'dayjs/plugin/advancedFormat'
import truncate from './truncate'
import db from './db.js'
import * as database from '../db'

dayjs.extend(timezone)
dayjs.extend(advancedformat)

function getCoverImage (postContent) {
  const dom = new DOMParser()
  const doc = dom.parseFromString(postContent, 'text/html')
  const image = doc.querySelector('img')
  if (image !== null && typeof image.getAttribute('src') !== 'undefined' && image.getAttribute('src').startsWith('https://')) {
    return doc.querySelector('img').getAttribute('src')
  }
  return null
}

export default {
  async getSubscriptions (feedbinCreds) {
    try {
      const subscriptions = await axios.get(`${feedbinCreds.endpoint}subscriptions.json?mode=extended`, {
        auth: {
          username: feedbinCreds.email,
          password: feedbinCreds.password
        }
      })
      return subscriptions.data
    } catch (e) {
      window.log.info(e)
    }
  },
  async getEntries (feedbinCreds, ids) {
    const number = Number.MAX_SAFE_INTEGER
    try {
      const entries = await axios.get(`${feedbinCreds.endpoint}entries.json?ids=${ids.join()}&per_page=${number}&mode=extended`, {
        auth: {
          username: feedbinCreds.email,
          password: feedbinCreds.password
        }
      })
      return entries.data
    } catch (e) {
      window.log.info(e)
    }
  },
  async getUnreadEntries (feedbinCreds) {
    const unreads = await axios.get(`${feedbinCreds.endpoint}unread_entries.json`, {
      auth: {
        username: feedbinCreds.email,
        password: feedbinCreds.password
      }
    })
    return unreads.data
  },
  async getStarredEntries (feedbinCreds) {
    const starred = await axios.get(`${feedbinCreds.endpoint}starred_entries.json`, {
      auth: {
        username: feedbinCreds.email,
        password: feedbinCreds.password
      }
    })
    return starred.data
  },
  transformEntriesAndFeed (unread, starred, all) {
    const mapped = all.map((item) => {
      item.read = !unread.includes(item.id)
      item.favourite = starred.includes(item.id)
      return item
    })
    return mapped
  },
  async markItem (feedbinCreds, type, ids) {
    let method, data, url
    switch (type) {
      case 'READ':
        url = 'unread_entries/delete'
        method = 'POST'
        data = {
          unread_entries: ids
        }
        break
      case 'UNREAD':
        url = 'unread_entries'
        method = 'POST'
        data = {
          unread_entries: ids
        }
        break
      case 'FAVOURITE':
        url = 'starred_entries'
        method = 'POST'
        data = {
          starred_entries: ids
        }
        break
      case 'UNFAVOURITE':
        url = 'starred_entries/delete'
        method = 'POST'
        data = {
          starred_entries: ids
        }
        break
    }
    return await axios({
      method: method,
      url: `${feedbinCreds.endpoint}${url}.json`,
      data: data,
      auth: {
        username: feedbinCreds.email,
        password: feedbinCreds.password
      }
    })
  },
  async syncItems (feedbinCreds) {
    let subscriptions = await this.getSubscriptions(feedbinCreds)
    const unreadList = await this.getUnreadEntries(feedbinCreds)
    const starredList = await this.getStarredEntries(feedbinCreds)
    const entries = this.transformEntriesAndFeed(unreadList, starredList, await this.getEntries(feedbinCreds, unreadList))
    if (subscriptions) {
      const currentSubscriptions = await db.fetchServicesFeeds('feedbin')
      const currentFeedUrls = JSON.parse(JSON.stringify(currentSubscriptions)).map((item) => {
        return item.xmlurl
      })
      const feedbinSubscriptions = new Set(JSON.parse(JSON.stringify(subscriptions)).map((item) => {
        return item.feed_url
      }))
      const diff = currentFeedUrls.filter(item => !feedbinSubscriptions.has(item))
      if (diff.length > 0) {
        const deleteFeed = currentSubscriptions.filter((x) => diff.includes(x.xmlurl))
        deleteFeed.forEach(async (item) => {
          await db.deleteArticles(item.uuid)
          await db.deleteFeed(item.uuid)
        })
      }
      const transformedSubscriptions = JSON.parse(JSON.stringify(subscriptions)).map((item) => {
        return {
          id: uuidstring(item.feed_url),
          uuid: uuidstring(item.feed_url),
          link: item.site_url,
          xmlurl: item.feed_url,
          title: item.title,
          favicon: `https://www.google.com/s2/favicons?domain=${item.site_url}`,
          description: null,
          category: null,
          source: 'feedbin'
        }
      })
      const addedFeeds = db.addFeed(transformedSubscriptions.map(item => database.feedTable.createRow(item)))
      return addedFeeds.then((res) => {
        const subscriptAdded = res
        subscriptions = subscriptions.map((item) => {
          item.feed_uuid = subscriptAdded.filter(feed => feed.xmlurl === item.feed_url)[0].uuid
          return item
        })
        const transformedEntries = JSON.parse(JSON.stringify(entries)).map((item) => {
          const isMedia = item.url.includes('youtube') || item.url.includes('vimeo')
          return {
            id: item.enclosure ? uuidstring(item.enclosure.enclosure_url) : uuidstring(item.url),
            uuid: item.enclosure ? uuidstring(item.enclosure.enclosure_url) : uuidstring(item.url),
            title: item.title,
            author: item.author,
            link: item.url,
            cover: getCoverImage(item.content),
            content: item.content,
            contentSnippet: truncate(item.summary, 100),
            favourite: item.favourite,
            read: item.read,
            keep_read: null,
            pubDate: item.published,
            offline: false,
            media: isMedia
              ? {
                  url: item.url,
                  description: item.summary,
                  title: item.title
                }
              : null,
            podcast: !!item.enclosure,
            enclosure: item.enclosure
              ? {
                  type: item.enclosure.enclosure_type,
                  url: item.enclosure.enclosure_url,
                  length: item.enclosure.enclosure_length
                }
              : null,
            itunes: item.itunes || null,
            played: false,
            publishUnix: dayjs(item.publishUnix).unix(),
            feed_uuid: subscriptions.filter(feed => feed.feed_id === item.feed_id)[0].feed_uuid,
            category: null,
            source: 'feedbin',
            source_id: item.id
          }
        })
        const currentArticles = db.fetchServicesArticles('feedbin')
        const articles = db.addArticles(transformedEntries.map(item => database.articleTable.createRow(item)))
        currentArticles.then((res) => {
          const markRead = res.filter(item => !unreadList.includes(item.articles.source_id)).map(item => item.articles.uuid)
          const markUnFavourite = res.filter(item => !starredList.includes(item.articles.source_id)).map(item => item.articles.uuid)
          const markFavourite = res.filter(item => starredList.includes(item.articles.source_id)).map(item => item.articles.uuid)
          db.markAllRead(markRead)
          db.markBulkFavourite(markFavourite)
          db.markBulkUnFavourite(markUnFavourite)
        })
        window.electronstore.setFeedbinLastFetched(dayjs().toISOString())
        return articles
      })
    }
  }
}
