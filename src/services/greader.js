import axios from 'axios'
import dayjs from 'dayjs'
import db from './db.js'
import uuidstring from 'uuid-by-string'
import * as database from '../db'
import truncate from './truncate'
import store from '../store'

const TAGS = {
  READ_TAG: 'user/-/state/com.google/read',
  FAVOURITE_TAG: 'user/-/state/com.google/starred'
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
    const data = await axios.get(`${credsData.endpoint}/reader/api/0/user-info`, {
      headers: {
        Authorization: `GoogleLogin auth=${credsData.auth}`
      }
    })
    return data.data
  },
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
  async getUnreadIds (credsData) {
    const ids = []
    let continuation = null
    let apiUrl
    try {
      do {
        if (continuation === null) {
          apiUrl = `${credsData.endpoint}/reader/api/0/stream/items/ids?output=json&s=user/-/state/com.google/reading-list&xt=user/-/state/com.google/read&n=1000`
        } else {
          apiUrl = `${credsData.endpoint}/reader/api/0/stream/items/ids?output=json&s=user/-/state/com.google/reading-list&xt=user/-/state/com.google/read&n=1000&c=${continuation}`
        }
        const data = await axios.get(apiUrl, {
          headers: {
            Authorization: `GoogleLogin auth=${credsData.auth}`
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
    const ids = []
    let continuation = null
    let apiUrl
    try {
      do {
        if (continuation === null) {
          apiUrl = `${credsData.endpoint}/reader/api/0/stream/items/ids?output=json&s=user/-/state/com.google/starred&n=1000`
        } else {
          apiUrl = `${credsData.endpoint}/reader/api/0/stream/items/ids?output=json&s=user/-/state/com.google/starred&n=1000&c=${continuation}`
        }
        const data = await axios.get(apiUrl, {
          headers: {
            Authorization: `GoogleLogin auth=${credsData.auth}`
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
    const perChunk = 250 // items per chunk
    const entries = []
    const chunks = ids.reduce((resultArray, item, index) => {
      const chunkIndex = Math.floor(index / perChunk)

      if (!resultArray[chunkIndex]) {
        resultArray[chunkIndex] = [] // start a new chunk
      }

      resultArray[chunkIndex].push(item)

      return resultArray
    }, [])
    try {
      for (let i = 0; i < chunks.length; i++) {
        const postData = new URLSearchParams()
        for (let k = 0; k < chunks[i].length; k++) {
          postData.append('i', chunks[i][k])
        }
        const data = await axios.post(`${credsData.endpoint}/reader/api/0/stream/items/contents?output=json`, postData, {
          headers: {
            Authorization: `GoogleLogin auth=${credsData.auth}`
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
  async syncTags (categories) {
    const currentCategories = await db.fetchCategoriesBySource('greader')
    const dbFormat = Array.from(categories).map((item) => {
      return {
        id: uuidstring(item),
        type: 'category',
        source: 'greader',
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
  async syncItems (credsData) {
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
      const currentSubscriptions = await db.fetchServicesFeeds('greader')
      const currentFeedUrls = JSON.parse(JSON.stringify(currentSubscriptions)).map((item) => {
        return item.xmlurl
      })
      const greaderSubscriptions = new Set(subscriptions.map((item) => {
        return item.url || item.htmlUrl
      }))
      const diff = currentFeedUrls.filter(item => !greaderSubscriptions.has(item))
      if (diff.length > 0) {
        const deleteFeed = currentSubscriptions.filter((x) => diff.includes(x.xmlurl))
        deleteFeed.forEach(async (item) => {
          await db.deleteArticles(item.uuid)
          await db.deleteFeed(item.uuid)
        })
      }
      const transformedSubscriptions = subscriptions.map((item) => {
        return {
          id: uuidstring(item.url || item.htmlUrl),
          uuid: uuidstring(item.url || item.htmlUrl),
          link: item.htmlUrl,
          xmlurl: item.url || item.htmlUrl,
          title: item.title,
          favicon: `https://www.google.com/s2/favicons?domain=${item.htmlUrl}`,
          description: null,
          category: item.categories.length > 0 ? item.categories[0].label : null,
          source: 'greader',
          source_id: item.id
        }
      })
      const readTag = `user/${credsData.userinfo.userId}/state/com.google/read`
      const favouriteTag = `user/${credsData.userinfo.userId}/state/com.google/starred`
      const addedFeeds = db.addFeed(transformedSubscriptions.map(item => database.feedTable.createRow(item)))
      return addedFeeds.then((res) => {
        const subscriptAdded = res
        subscriptions = subscriptions.map((item) => {
          const addedSubscription = subscriptAdded.filter(feed => feed.source_id === item.id)
          db.updateArticleCategoryFeed(addedSubscription[0].uuid, addedSubscription[0].category)
          item.feed_uuid = addedSubscription[0].uuid
          return item
        })
        const transformedEntries = JSON.parse(JSON.stringify(entries)).map((item) => {
          const itemId = item.id.split('/')
          const last = itemId[itemId.length - 1]
          const i = BigInt('0x' + last)
          const id = credsData.endpoint.includes('theoldreader') ? last : BigInt.asIntN(64, i).toString()
          const isMedia = item.canonical && (item.alternate[0].href.includes('youtube') || item.alternate[0].href.includes('vimeo'))
          const isPodcast = item.enclosure ? checkIsPodCast(item.enclosure[0]) : false
          const feed = subscriptions.filter(feed => feed.id === item.origin.streamId)[0]
          return {
            id: isPodcast ? uuidstring(item.enclosure[0].href) : uuidstring(item.alternate[0].href),
            uuid: isPodcast ? uuidstring(item.enclosure[0].href) : uuidstring(item.alternate[0].href),
            title: item.title,
            author: item.author,
            link: item.alternate[0].href,
            content: item.summary.content,
            contentSnippet: truncate(item.summary.content.replace(/(<([^>]+)>)/gi, ''), 100),
            favourite: item.categories.includes(TAGS.FAVOURITE_TAG) || item.categories.includes(favouriteTag),
            read: item.categories.includes(TAGS.READ_TAG) || item.categories.includes(readTag),
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
            source: 'greader',
            source_id: id
          }
        })
        const currentArticles = db.fetchServicesArticles('greader')
        const articles = db.addArticles(transformedEntries.map(item => database.articleTable.createRow(item)))
        currentArticles.then((res) => {
          const markRead = res.filter(item => !unreadList.includes(item.articles.source_id)).map(item => item.articles.uuid)
          const markUnFavourite = res.filter(item => !starredList.includes(item.articles.source_id)).map(item => item.articles.uuid)
          const markFavourite = res.filter(item => starredList.includes(item.articles.source_id)).map(item => item.articles.uuid)
          db.markAllRead(markRead)
          db.markBulkFavourite(markFavourite)
          db.markBulkUnFavourite(markUnFavourite)
        })
        store.dispatch('setGreaderLastFetched', dayjs().toISOString())
        return articles
      })
    }
  }
}
