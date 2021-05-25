import db from './db.js'
import uuidstring from 'uuid-by-string'
import * as database from '../db'
import truncate from './truncate'

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
  async getSubscriptions (credsData) {
    try {
      const subscriptions = await window.fever.post(`${credsData.endpoint}?api&feeds`, credsData.hash)
      return subscriptions.feeds
    } catch (e) {
      window.log.info(e)
    }
  },
  async getUnreadIds (credsData) {
    try {
      const unread = await window.fever.post(`${credsData.endpoint}?api&unread_item_ids`, credsData.hash)
      return unread.unread_item_ids
    } catch (e) {
      window.log.info(e)
    }
  },
  async getStarredIds (credsData) {
    try {
      const starred = await window.fever.post(`${credsData.endpoint}?api&saved_item_ids`, credsData.hash)
      return starred.saved_item_ids
    } catch (e) {
      window.log.info(e)
    }
  },
  async getEntries (credsData, ids) {
    const perChunk = 50 // items per chunk
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
        const data = await window.fever.post(`${credsData.endpoint}?api&items&with_ids=${chunks[i].join(',')}&since_id`, credsData.hash)
        entries.push(...data.items)
      }
      return entries
    } catch (e) {
      window.log.info(e)
    }
  },
  async markItem (credsData, type, id) {
    let endpoint
    switch (type) {
      case 'READ':
        endpoint = `${credsData.endpoint}?api&mark=item&as=read&id=${id}`
        break
      case 'UNREAD':
        endpoint = `${credsData.endpoint}?api&mark=item&as=unread&id=${id}`
        break
      case 'FAVOURITE':
        endpoint = `${credsData.endpoint}?api&mark=item&as=saved&id=${id}`
        break
      case 'UNFAVOURITE':
        endpoint = `${credsData.endpoint}?api&mark=item&as=unsaved&id=${id}`
        break
    }
    return await window.fever.post(endpoint, credsData.hash)
  },
  async getGroups (credsData) {
    const groups = await window.fever.post(`${credsData.endpoint}?api&groups`, credsData.hash)
    return {
      groups: groups.groups,
      feed_groups: groups.feeds_groups.map((item) => {
        item.feed_ids = item.feed_ids.split(',').map(item => parseInt(item))
        return item
      })
    }
  },
  async syncTags (categories) {
    const categoryItems = new Set([...categories.map(item => item.title)])
    const currentCategories = await db.fetchCategoriesBySource('fever')
    const dbFormat = Array.from(categoryItems).map((item) => {
      return {
        id: uuidstring(item),
        type: 'category',
        source: 'fever',
        title: item
      }
    })
    const diff = currentCategories.filter(item => !categoryItems.has(item.title))
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
    const entriesId = new Set([...unreadList.split(','), ...starredList.split(',')])
    const entries = await this.getEntries(credsData, Array.from(entriesId))
    const groupsData = await this.getGroups(credsData)
    const groups = groupsData.groups
    const feedGroups = groupsData.feed_groups
    this.syncTags(groups)
    if (subscriptions) {
      const currentSubscriptions = await db.fetchServicesFeeds('greader')
      const currentFeedUrls = JSON.parse(JSON.stringify(currentSubscriptions)).map((item) => {
        return item.xmlurl
      })
      const greaderSubscriptions = new Set(subscriptions.map((item) => {
        return item.url
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
        const getGroup = feedGroups.filter((feedGroup) => {
          return feedGroup.feed_ids.includes(item.id)
        })
        const category = groups.filter((group) => {
          if (getGroup.length > 0) {
            return group.id === getGroup[0].group_id
          }
          return false
        })
        return {
          id: uuidstring(item.url),
          uuid: uuidstring(item.url),
          link: item.site_url,
          xmlurl: item.url,
          title: item.title,
          favicon: `https://www.google.com/s2/favicons?domain=${item.site_url}`,
          description: null,
          category: category.length > 0 ? category[0].title : null,
          source: 'fever',
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
          item.source_id = item.id
          item.category = addedSubscription[0].category
          return item
        })
        const transformedEntries = JSON.parse(JSON.stringify(entries)).map((item) => {
          const feed = subscriptions.filter(feed => feed.source_id === item.feed_id)[0]
          return {
            id: uuidstring(item.url),
            uuid: uuidstring(item.url),
            title: item.title,
            author: item.author,
            link: item.url,
            cover: getCoverImage(item.html),
            content: item.html,
            contentSnippet: truncate(item.html.replace(/(<([^>]+)>)/gi, ''), 100),
            favourite: Boolean(item.is_saved),
            read: Boolean(item.is_read),
            keep_read: null,
            pubDate: null,
            offline: false,
            media: null,
            podcast: false,
            itunes: null,
            played: false,
            publishUnix: item.created_on_time,
            feed_uuid: feed.feed_uuid,
            category: feed.category,
            source: 'fever',
            source_id: item.id
          }
        })
        const currentArticles = db.fetchServicesArticles('fever')
        const articles = db.addArticles(transformedEntries.map(item => database.articleTable.createRow(item)))
        currentArticles.then((res) => {
          const markRead = res.filter(item => !unreadList.split(',').includes(item.articles.source_id.toString())).map(item => item.articles.uuid)
          const markUnFavourite = res.filter(item => !starredList.split(',').includes(item.articles.source_id.toString())).map(item => item.articles.uuid)
          const markFavourite = res.filter(item => starredList.split(',').includes(item.articles.source_id.toString())).map(item => item.articles.uuid)
          db.markAllRead(markRead)
          db.markBulkFavourite(markFavourite)
          db.markBulkUnFavourite(markUnFavourite)
        })
        return articles
      })
    }
  }
}
