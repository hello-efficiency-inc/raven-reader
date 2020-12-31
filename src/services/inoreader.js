import axios from 'axios'
import dayjs from 'dayjs'
import db from './db.js'
import store from '../store'
import uuidstring from 'uuid-by-string'
import * as database from '../db'

const TAGS = {
  READ_TAG: 'user/-/state/com.google/read',
  FAVOURITE_TAG: 'user/-/state/com.google/starred'
}

function checkIsPodCast (post) {
  return typeof post !== 'undefined' &&
    post.length && post.type.indexOf('audio') !== -1
}

export default {
  async getUserInfo (credsData) {
    let tokenData
    const currentTime = dayjs().valueOf()
    if (currentTime >= credsData.expires_in) {
      tokenData = await this.refreshToken(credsData)
    } else {
      tokenData = credsData
    }
    const data = await axios.get('https://www.inoreader.com/reader/api/0/user-info', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`
      }
    })
    return data.data
  },
  async refreshToken (credsData) {
    try {
      window.log('Refreshing Inoreader token')
      const data = await axios.post('https://www.inoreader.com/oauth2/token', {
        client_id: process.env.VUE_APP_INOREADER_CLIENT_ID,
        client_secret: process.env.VUE_APP_INOREADER_CLIENT_SECRET,
        grant_type: 'refresh_token',
        refresh_token: credsData.refresh_token
      })
      data.data.expires_in = dayjs().add(data.data.expires_in).valueOf()
      window.electronstore.storeSetSettingItem('set', 'inoreader_creds', data.data)
      return data.data
    } catch (e) {
      window.log.info(e)
    }
  },
  async getSubscriptions (credsData) {
    let tokenData
    const currentTime = dayjs().valueOf()
    if (currentTime >= credsData.expires_in) {
      tokenData = await this.refreshToken(credsData)
    } else {
      tokenData = credsData
    }
    try {
      const subscriptions = await axios.get('https://www.inoreader.com/reader/api/0/subscription/list', {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`
        }
      })
      return subscriptions.data.subscriptions
    } catch (e) {
      window.log.info(e)
    }
  },
  async getEntries (credsData, datetime = null) {
    let tokenData
    const entries = []
    let continuation = null
    const fetchTime = datetime || dayjs().subtract(7, 'day').unix()
    const currentTime = dayjs().valueOf()
    if (currentTime >= credsData.expires_in) {
      tokenData = await this.refreshToken(credsData)
    } else {
      tokenData = credsData
    }
    try {
      do {
        const data = await axios.get(`https://www.inoreader.com/reader/api/0/stream/contents?n=1000&c=${continuation}&ot=${fetchTime}`, {
          headers: {
            Authorization: `Bearer ${tokenData.access_token}`
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
    let tokenData
    const currentTime = dayjs().valueOf()
    if (currentTime >= credsData.expires_in) {
      tokenData = await this.refreshToken(credsData)
    } else {
      tokenData = credsData
    }
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
    return await axios.post('https://www.inoreader.com/reader/api/0/edit-tag', postData, {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`
      }
    })
  },
  async syncItems (credsData, mappedEntries) {
    let subscriptions = await this.getSubscriptions(credsData)
    if (subscriptions) {
      const currentSubscriptions = await db.fetchServicesFeeds('inoreader')
      const currentFeedUrls = JSON.parse(JSON.stringify(currentSubscriptions)).map((item) => {
        return item.xmlurl
      })
      const inoreaderSubscriptions = subscriptions.map((item) => {
        return item.url
      })
      const diff = currentFeedUrls.filter(item => !inoreaderSubscriptions.includes(item))
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
          source: 'inoreader',
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
        const readTag = `user/${credsData.user.userId}/state/com.google/read`
        const favouriteTag = `user/${credsData.user.userId}/state/com.google/starred`
        const transformedEntries = JSON.parse(JSON.stringify(mappedEntries)).map((item) => {
          const itemId = item.id.split('/')
          const id = parseInt(itemId[itemId.length - 1], 16)
          const isMedia = item.alternate && (item.canonical[0].href.includes('youtube') || item.canonical[0].href.includes('vimeo'))
          const isPodcast = item.enclosure ? checkIsPodCast(item.enclosure[0]) : false
          return {
            id: isPodcast ? uuidstring(item.enclosure[0].href) : uuidstring(item.canonical[0].href),
            uuid: isPodcast ? uuidstring(item.enclosure[0].href) : uuidstring(item.canonical[0].href),
            title: item.title,
            author: item.author,
            link: item.canonical[0].href,
            content: item.summary.content,
            contentSnippet: item.summary.content.replace(/(<([^>]+)>)/gi, ''),
            favourite: item.categories.includes(favouriteTag),
            read: item.categories.includes(readTag),
            keep_read: null,
            pubDate: item.published,
            offline: false,
            media: isMedia
              ? {
                  url: item.canonical[0].href,
                  description: item.summary.content.replace(/(<([^>]+)>)/gi, ''),
                  title: item.title
                }
              : null,
            podcast: isPodcast,
            enclosure: isPodcast
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
            source: 'inoreader',
            source_id: id
          }
        })
        store.dispatch('setInoreaderLastFetched', dayjs().toISOString())
        return db.addArticles(transformedEntries.map(item => database.articleTable.createRow(item)))
      })
    }
  }
}
