import axios from 'axios'
import dayjs from 'dayjs'
import db from './db.js'
import store from '../store'
import uuidstring from 'uuid-by-string'
import truncate from './truncate'
import * as database from '../db'

const TAGS = {
  READ_TAG: 'user/-/state/com.google/read',
  FAVOURITE_TAG: 'user/-/state/com.google/starred'
}

const chunk = (arr, chunkSize = 1, cache = []) => {
  const tmp = [...arr]
  if (chunkSize <= 0) return cache
  while (tmp.length) cache.push(tmp.splice(0, chunkSize))
  return cache
}

const flattenDeep = arr =>
  Array.isArray(arr)
    ? arr.reduce((a, b) => [...flattenDeep(a), ...flattenDeep(b)], [])
    : [arr]

function checkIsPodCast (post) {
  return typeof post !== 'undefined' &&
    post.length && post.type.indexOf('audio') !== -1
}

export default {
  async getUserInfo (credsData) {
    let tokenData
    if (dayjs().valueOf() >= credsData.expires_in) {
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
  async getUnreadIds (credsData) {
    let tokenData
    const ids = []
    let continuation = null
    let apiUrl
    if (dayjs().valueOf() >= credsData.expires_in) {
      tokenData = await this.refreshToken(credsData)
    } else {
      tokenData = credsData
    }
    try {
      do {
        if (continuation === null) {
          apiUrl = 'https://www.inoreader.com/reader/api/0/stream/items/ids?output=json&s=user/-/state/com.google/reading-list&xt=user/-/state/com.google/read&n=1000'
        } else {
          apiUrl = `https://www.inoreader.com/reader/api/0/stream/items/ids?output=json&s=user/-/state/com.google/reading-list&xt=user/-/state/com.google/read&n=1000&c=${continuation}`
        }
        const data = await axios.get(apiUrl, {
          headers: {
            Authorization: `Bearer ${tokenData.access_token}`
          }
        })
        if (data.data.itemRefs) {
          ids.push(...data.data.itemRefs.map(item => {
            return item.id
          }))
        }
        continuation = typeof data.data.continuation !== 'undefined' ? data.data.continuation : null
      }
      while (continuation !== null)
      return ids
    } catch (e) {
      window.log.info(e)
    }
  },
  async getStarredIds (credsData) {
    let tokenData
    const ids = []
    let continuation = null
    let apiUrl
    if (dayjs().valueOf() >= credsData.expires_in) {
      tokenData = await this.refreshToken(credsData)
    } else {
      tokenData = credsData
    }
    try {
      do {
        if (continuation === null) {
          apiUrl = 'https://www.inoreader.com/reader/api/0/stream/items/ids?output=json&s=user/-/state/com.google/starred&n=1000'
        } else {
          apiUrl = `https://www.inoreader.com/reader/api/0/stream/items/ids?output=json&s=user/-/state/com.google/starred&n=1000&c=${continuation}`
        }
        const data = await axios.get(apiUrl, {
          headers: {
            Authorization: `Bearer ${tokenData.access_token}`
          }
        })
        if (data.data.itemRefs) {
          ids.push(...data.data.itemRefs.map(item => {
            return item.id
          }))
        }
        continuation = typeof data.data.continuation !== 'undefined' ? data.data.continuation : null
      }
      while (continuation !== null)
      return ids
    } catch (e) {
      window.log.info(e)
    }
  },
  async getEntries (credsData, ids) {
    let tokenData
    const entries = []
    const chunks = chunk(ids, 250)
    if (dayjs().valueOf() >= credsData.expires_in) {
      tokenData = await this.refreshToken(credsData)
    } else {
      tokenData = credsData
    }
    try {
      for (let i = 0; i < chunks.length; i++) {
        const postData = new URLSearchParams()
        for (let k = 0; k < chunks[i].length; k++) {
          postData.append('i', chunks[i][k])
        }
        const data = await axios.post('https://www.inoreader.com/reader/api/0/stream/items/contents?output=json', postData, {
          headers: {
            Authorization: `Bearer ${tokenData.access_token}`
          }
        })
        entries.push(...data.data.items)
      }
      return entries
    } catch (e) {
      window.log.info(e)
    }
  },
  async markItem (credsData, type, ids) {
    const postData = new URLSearchParams()
    let tokenData
    if (dayjs().valueOf() >= credsData.expires_in) {
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
  async syncTags (categories) {
    const currentCategories = await db.fetchCategoriesBySource('inoreader')
    const dbFormat = Array.from(categories).map((item) => {
      return {
        id: uuidstring(item),
        type: 'category',
        source: 'inoreader',
        title: item
      }
    })
    const diff = currentCategories.filter(item => !categories.has(item.title))
    if (diff.length > 0) {
      db.deleteCategoryMulti(diff.map(item => item.title))
    }
    const tobeAdded = dbFormat.filter(x => !new Set(currentCategories.map(item => item.title)).has(x.title))
    if (dbFormat.length > 0) {
      db.addCategory(tobeAdded.map(item => database.categoryTable.createRow(item)))
    }
  },
  async syncArticles (credsData) {
    let subscriptions = await this.getSubscriptions(credsData)
    const unreadList = await this.getUnreadIds(credsData)
    const starredList = await this.getStarredIds(credsData)
    const entriesId = new Set([...unreadList, ...starredList])
    const entries = await this.getEntries(credsData, Array.from(entriesId))
    const folders = subscriptions.map(item => {
      return item.categories.map(cat => cat.label)
    })
    this.syncTags(new Set(flattenDeep(folders)))
    if (subscriptions) {
      const currentSubscriptions = await db.fetchServicesFeeds('inoreader')
      const currentFeedUrls = JSON.parse(JSON.stringify(currentSubscriptions)).map((item) => {
        return item.xmlurl
      })
      const inoreaderSubscriptions = new Set(subscriptions.map((item) => {
        return item.url
      }))
      const diff = currentFeedUrls.filter(item => !inoreaderSubscriptions.has(item))
      if (diff.length > 0) {
        const deleteFeed = currentSubscriptions.filter((x) => diff.includes(x.xmlurl))
        db.fetchArticlesByFeedMulti(deleteFeed.map(item => item.uuid))
        db.deleteFeedMulti(deleteFeed.map(item => item.uuid))
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
          category: item.categories.length > 0 ? item.categories[0].label : null,
          source: 'inoreader',
          source_id: item.id
        }
      })
      const addedFeeds = db.addFeed(transformedSubscriptions.map(item => database.feedTable.createRow(item)))
      return addedFeeds.then((res) => {
        const subscriptAdded = res
        subscriptions = subscriptions.map((item) => {
          const addedSubscription = subscriptAdded.filter(feed => feed.source_id === item.id)
          db.updateArticleCategoryFeed(addedSubscription[0].uuid, addedSubscription[0].category)
          item.feed_uuid = addedSubscription[0].uuid
          return item
        })
        const readTag = `user/${credsData.user.userId}/state/com.google/read`
        const favouriteTag = `user/${credsData.user.userId}/state/com.google/starred`
        const transformedEntries = JSON.parse(JSON.stringify(entries)).map((item) => {
          const itemId = item.id.split('/')
          const last = itemId[itemId.length - 1]
          const i = BigInt('0x' + last)
          const id = BigInt.asIntN(64, i).toString()
          const isMedia = item.alternate && (item.canonical[0].href.includes('youtube') || item.canonical[0].href.includes('vimeo'))
          const isPodcast = item.enclosure ? checkIsPodCast(item.enclosure[0]) : false
          const feed = subscriptions.filter(feed => feed.id === item.origin.streamId)[0]
          return {
            id: isPodcast ? uuidstring(item.enclosure[0].href) : uuidstring(item.canonical[0].href),
            uuid: isPodcast ? uuidstring(item.enclosure[0].href) : uuidstring(item.canonical[0].href),
            title: item.title,
            author: item.author,
            link: item.canonical[0].href,
            content: item.summary.content,
            contentSnippet: truncate(item.summary.content.replace(/(<([^>]+)>)/gi, ''), 100),
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
            feed_uuid: feed.feed_uuid,
            category: feed.categories.length > 0 ? feed.categories[0].label : null,
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
