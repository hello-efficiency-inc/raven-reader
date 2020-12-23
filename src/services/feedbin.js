import axios from 'axios'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import advancedformat from 'dayjs/plugin/advancedFormat'
import db from './db.js'
import * as database from '../db'
const Store = window.electronstore
const store = new Store()

dayjs.extend(timezone)
dayjs.extend(advancedformat)

export default {
  getConfig () {
    return JSON.parse(store.get('feedbin_creds'))
  },
  async getSubscriptions () {
    const feedbinCreds = this.getConfig()
    const subscriptions = await axios.get(`${feedbinCreds.endpoint}subscriptions.json?mode=extended`, {
      headers: {
        ETag: window.uuidstring(dayjs().format('ddd, D MMM YYYY HH:mm:ss z')),
        'If-Modified-Since': dayjs().subtract(6, 'hour').format('ddd, D MMM YYYY HH:mm:ss z'),
        'Last-Modified': dayjs().format('ddd, D MMM YYYY HH:mm:ss z')
      },
      auth: {
        username: feedbinCreds.email,
        password: feedbinCreds.password
      }
    })
    return subscriptions.data
  },
  async getEntries (datetime = null) {
    const feedbinCreds = this.getConfig()
    const timestamp = datetime || dayjs().subtract(1, 'month').toISOString()
    const number = Number.MAX_SAFE_INTEGER
    const entries = await axios.get(`${feedbinCreds.endpoint}entries.json?since=${timestamp}&per_page=${number}&mode=extended`, {
      headers: {
        ETag: window.uuidstring(dayjs().format('ddd, D MMM YYYY HH:mm:ss z')),
        'If-Modified-Since': dayjs().subtract(30, 'minute').format('ddd, D MMM YYYY HH:mm:ss z'),
        'Last-Modified': dayjs().format('ddd, D MMM YYYY HH:mm:ss z')
      },
      auth: {
        username: feedbinCreds.email,
        password: feedbinCreds.password
      }
    })
    return entries.data
  },
  async getUnreadEntries () {
    const feedbinCreds = this.getConfig()
    const unreads = await axios.get(`${feedbinCreds.endpoint}unread_entries.json`, {
      headers: {
        ETag: window.uuidstring(dayjs().format('ddd, D MMM YYYY HH:mm:ss z')),
        'If-Modified-Since': dayjs().subtract(30, 'minute').format('ddd, D MMM YYYY HH:mm:ss z'),
        'Last-Modified': dayjs().format('ddd, D MMM YYYY HH:mm:ss z')
      },
      auth: {
        username: feedbinCreds.email,
        password: feedbinCreds.password
      }
    })
    return unreads.data
  },
  async getStarredEntries () {
    const feedbinCreds = this.getConfig()
    const starred = await axios.get(`${feedbinCreds.endpoint}starred_entries.json`, {
      headers: {
        ETag: window.uuidstring(dayjs().format('ddd, D MMM YYYY HH:mm:ss z')),
        'If-Modified-Since': dayjs().subtract(30, 'minute').format('ddd, D MMM YYYY HH:mm:ss z'),
        'Last-Modified': dayjs().format('ddd, D MMM YYYY HH:mm:ss z')
      },
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
  async markItem (type, ids) {
    let method, data, url
    const feedbinCreds = this.getConfig()
    switch (type) {
      case 'MARK_READ':
        url = 'unread_entries/delete'
        method = 'POST'
        data = {
          unread_entries: ids
        }
        break
      case 'MARK_UNREAD':
        url = 'unread_entries'
        method = 'POST'
        data = {
          unread_entries: ids
        }
        break
      case 'MARK_FAVOURITE':
        url = 'starred_entries'
        method = 'POST'
        data = {
          starred_entries: ids
        }
        break
      case 'MARK_UNFAVOURITE':
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
  async syncItems (mappedEntries) {
    let subscriptions = await this.getSubscriptions()
    const currentSubscriptions = await db.fetchServicesFeeds('feedbin')
    const currentFeedUrls = JSON.parse(JSON.stringify(currentSubscriptions)).map((item) => {
      return item.xmlurl
    })
    const feedbinSubscriptions = JSON.parse(JSON.stringify(subscriptions)).map((item) => {
      return item.feed_url
    })
    const diff = currentFeedUrls.filter(item => !feedbinSubscriptions.includes(item))
    if (diff.length > 0) {
      const deleteFeed = currentSubscriptions.filter((x) => diff.includes(x.xmlurl))
      deleteFeed.forEach(async (item) => {
        await db.deleteArticles(item.uuid)
        await db.deleteFeed(item.uuid)
      })
    }
    const transformedSubscriptions = JSON.parse(JSON.stringify(subscriptions)).map((item) => {
      return {
        id: window.uuidstring(item.feed_url),
        uuid: window.uuidstring(item.feed_url),
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
      const transformedEntries = JSON.parse(JSON.stringify(mappedEntries)).map((item) => {
        return {
          id: item.enclosure ? window.uuidstring(item.enclosure.enclosure_url) : window.uuidstring(item.url),
          uuid: item.enclosure ? window.uuidstring(item.enclosure.enclosure_url) : window.uuidstring(item.url),
          title: item.title,
          author: item.author,
          link: item.url,
          content: item.content,
          contentSnippet: item.summary,
          favourite: item.favourite,
          read: item.read,
          pubDate: item.published,
          offline: false,
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
      store.set('feedbin_fetched_lastime', dayjs().toISOString())
      return db.addArticles(transformedEntries.map(item => database.articleTable.createRow(item)))
    })
  }
}
