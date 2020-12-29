import axios from 'axios'
import dayjs from 'dayjs'
import db from './db.js'
import uuidstring from 'uuid-by-string'
import * as database from '../db'
import store from '../store'

const TAGS = {
  READ_TAG: 'user/-/state/com.google/read',
  FAVOURITE_TAG: 'user/-/state/com.google/starred'
}

export default {
  async getSubscriptions (credsData) {
    try {
      const subscriptions = await axios.get(`${credsData.endpoint}/reader/api/0/subscription/list?output=json`, {
        headers: {
          Authorization: `GoogleLogin auth=${credsData.auth}`
        }
      })
      return subscriptions.data.subscriptions
    } catch (e) {
      window.log.info(e)
    }
  },
  async getEntries (credsData, datetime = null) {
    const entries = []
    let continuation = null
    const fetchTime = datetime || dayjs().subtract(7, 'day').unix()
    try {
      do {
        const data = await axios.get(`${credsData.endpoint}/reader/api/0/stream/contents/?output=json&n=1000&ot=${fetchTime}&c=${continuation}`, {
          headers: {
            Authorization: `GoogleLogin auth=${credsData.auth}`
          }
        })
        entries.push(...data.data.items)
        continuation = typeof data.data.continuation !== 'undefined' ? data.data.continuation : null
      } while (continuation !== null)
      return entries
    } catch (e) {
      window.log.info(e)
    }
  },
  async markItem (credsData, type, ids) {
    const postData = new URLSearchParams()
    for (let i = 0; i < ids.length; i++) {
      postData.append('i', ids[i])
    }
    switch (type) {
      case 'READ':
        postData.append('a', TAGS.READ_TAG)
        break
      case 'UNREAD':
        postData.append('r', TAGS.READ_TAG)
        break
      case 'FAVOURITE':
        postData.append('a', TAGS.FAVOURITE_TAG)
        break
      case 'UNFAVOURITE':
        postData.append('r', TAGS.FAVOURITE_TAG)
        break
    }
    return await axios.post(`${credsData.endpoint}/reader/api/0/edit-tag`, postData, {
      headers: {
        Authorization: `GoogleLogin auth=${credsData.auth}`
      }
    })
  },
  async syncItems (credsData, mappedEntries) {
    let subscriptions = await this.getSubscriptions(credsData)
    if (subscriptions) {
      const currentSubscriptions = await db.fetchServicesFeeds('greader')
      const currentFeedUrls = JSON.parse(JSON.stringify(currentSubscriptions)).map((item) => {
        return item.xmlurl
      })
      const greaderSubscriptions = subscriptions.map((item) => {
        return item.url
      })
      const diff = currentFeedUrls.filter(item => !greaderSubscriptions.includes(item))
      if (diff.length > 0) {
        const deleteFeed = currentSubscriptions.filter((x) => diff.includes(x.xmlurl))
        deleteFeed.forEach(async (item) => {
          await db.deleteArticles(item.uuid)
          await db.deleteFeed(item.uuid)
        })
      }
      const transformedSubscriptions = subscriptions.map((item) => {
        return {
          id: uuidstring(item.url),
          uuid: uuidstring(item.url),
          link: item.htmlUrl,
          xmlurl: item.url,
          title: item.title,
          favicon: `https://www.google.com/s2/favicons?domain=${item.htmlUrl}`,
          description: null,
          category: null,
          source: 'greader',
          source_id: item.id
        }
      })
      const addedFeeds = db.addFeed(transformedSubscriptions.map(item => database.feedTable.createRow(item)))
      return addedFeeds.then((res) => {
        const subscriptAdded = res
        subscriptions = subscriptions.map((item) => {
          item.feed_uuid = subscriptAdded.filter(feed => feed.source_id === item.id)[0].uuid
          return item
        })
        const transformedEntries = JSON.parse(JSON.stringify(mappedEntries)).map((item) => {
          const itemId = item.id.split('/')
          const id = parseInt(itemId[itemId.length - 1], 16)
          const isMedia = item.canonical && (item.alternate[0].href.includes('youtube') || item.alternate[0].href.includes('vimeo'))
          return {
            id: item.enclosure ? uuidstring(item.enclosure[0].href) : uuidstring(item.alternate[0].href),
            uuid: item.enclosure ? uuidstring(item.enclosure[0].href) : uuidstring(item.alternate[0].href),
            title: item.title,
            author: item.author,
            link: item.alternate[0].href,
            content: item.summary.content,
            contentSnippet: item.summary.content.replace(/(<([^>]+)>)/gi, ''),
            favourite: item.categories.includes(TAGS.FAVOURITE_TAG),
            read: item.categories.includes(TAGS.READ_TAG),
            keep_read: null,
            pubDate: item.published,
            offline: false,
            media: isMedia
              ? {
                  url: item.alternate[0].href,
                  description: item.summary.content.replace(/(<([^>]+)>)/gi, ''),
                  title: item.title
                }
              : null,
            podcast: !!item.enclosure,
            enclosure: item.enclosure
              ? {
                  type: item.enclosure[0].type,
                  url: item.enclosure[0].href,
                  length: item.enclosure[0].length
                }
              : null,
            itunes: item.itunes || null,
            played: false,
            publishUnix: dayjs(item.published).unix(),
            feed_uuid: subscriptions.filter(feed => feed.id === item.origin.streamId)[0].feed_uuid,
            category: null,
            source: 'greader',
            source_id: id
          }
        })
        store.dispatch('setGreaderLastFetched', dayjs().toISOString())
        return db.addArticles(transformedEntries.map(item => database.articleTable.createRow(item)))
      })
    }
  }
}
