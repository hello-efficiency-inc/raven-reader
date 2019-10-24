import axios from 'axios'
import Store from 'electron-store'
import vueStore from '../store'
import _ from 'lodash'
import dayjs from 'dayjs'
import db from './db'
import uuid from 'uuid-by-string'

const store = new Store()
const activeWorkspace = store.get('active_workspace')

const feedbinApi = axios.create({
  baseURL: 'https://api.feedbin.com',
  headers: {
    'Content-Type': 'application/json; charset=utf-8'
  },
  auth: {
    username: activeWorkspace ? activeWorkspace.email : null,
    password: activeWorkspace ? activeWorkspace.password : null
  }
})

function ApiError (message) {
  this.message = message
  this.name = 'ApiError'
}

export async function syncFeedbin () {
  await getSubscriptions()
  await getEntries()
  await fetchUnreadEntries()
  console.log('Feedbin sync complete')
}

export async function getTags () {
  const {
    error,
    data
  } = await feedbinApi.get('/v2/taggings.json')
  if (error) {
    throw new ApiError('Something went wrong')
  }
  if (data) {
    // db.deleteAllCategory()
    var tags = data.map((item) => {
      item.id = uuid(item.name)
      item.title = item.name
      item.type = 'category'
      item.workspace = 'feedbin'
      return item
    })
    db.addCategory(tags, docs => {})
  }
  return data
}

export async function createTagging (feedId, name) {
  const {
    error,
    data
  } = await feedbinApi.post('/v2/taggings.json', {
    feed_id: feedId,
    name: name
  })
  if (error) {
    throw new ApiError('Something went wrong')
  }
  if (data) {
    vueStore.dispatch('addCategory', {
      id: data.id,
      title: data.name,
      type: 'category',
      workspace: 'feedbin'
    })
    return data
  }
}

export async function createSubscription (feedUrl, category, favicon) {
  const {
    error,
    data
  } = await feedbinApi.post('/v2/subscriptions.json', {
    feed_url: feedUrl
  })
  if (error) {
    throw new ApiError(error.response)
  }
  if (data) {
    const feed = {
      id: data.id,
      link: data.site_url,
      xmlurl: data.feed_url,
      feed_id: data.feed_id,
      favicon: favicon,
      title: data.title,
      category: category,
      created_at: data.created_at,
      workspace: 'feedbin'
    }
    vueStore.dispatch('addFeed', feed)
    return feed
  }
}

export async function deleteSubscription (id) {
  const subscription = await feedbinApi.delete(`/v2/subscriptions/${id}.json`)
  if (subscription.status === 204) {
    return id
  } else {
    throw new ApiError('Something was wrong')
  }
}

export async function getSubscriptions () {
  const {
    error,
    data
  } = await feedbinApi.get('/v2/subscriptions.json')
  const tags = await getTags()
  if (error) {
    throw new ApiError(error.response)
  }
  if (data) {
    var feeds = data.map((item) => {
      const tagIndex = _.findIndex(tags, {
        feed_id: item.feed_id
      })
      item.link = item.site_url
      item.xmlurl = item.feed_url
      item.favicon = `https://www.google.com/s2/favicons?domain=${item.site_url}`
      item.category = tagIndex >= 0 ? tags[tagIndex].name : null
      item.workspace = 'feedbin'
      return item
    })
    var feedids = feeds.map(item => item.feed_id)
    db.fetchFeeds(docs => {
      docs.forEach((item) => {
        if (!feedids.includes(item.feed_id)) {
          db.removeArticlesForFeed(item.feed_id)
        }
      })
    })
    // Remove all feeds
    // db.removeAllFeeds()
    var savedItems = new Promise((resolve, reject) => {
      db.addFeed(feeds, docs => {
        resolve(docs)
      })
    })
    return savedItems
  }
}

export async function getEntriesByFeed (feed, category) {
  const today = dayjs().subtract(6, 'day').toISOString()
  const {
    error,
    data
  } = await feedbinApi.get(`/v2/feeds/${feed.feed_id}/entries.json?since=${today}`)
  if (error) {
    throw new ApiError(error.response)
  }
  if (data) {
    var entries = data.map((item) => {
      delete item.content
      delete item.summary
      item.link = item.url
      item.pubDate = item.published
      item.category = category
      item.read = false
      item.feed_id = feed.feed_id
      item.feed_title = feed.title
      item.feed_url = feed.xmlurl
      item.feed_link = feed.link
      item.favourite = false
      item.offline = false
      item.favicon = `https://www.google.com/s2/favicons?domain=${item.url}`
      item.workspace = 'feedbin'
      delete item.created_at
      delete item.published
      delete item.url
      return item
    })
    db.addArticles(entries, async (docs) => {
      await fetchUnreadEntries()
      vueStore.dispatch('addArticle', docs)
    })
    return entries
  }
}

export async function getEntries () {
  const today = dayjs().subtract(6, 'day').toISOString()
  const {
    error,
    data
  } = await feedbinApi.get(`/v2/entries.json?since=${today}`)
  console.log(data)
  const tags = await getTags()
  if (error) {
    throw new ApiError(error.response)
  }
  // db.removeAllArticles()
  if (data) {
    var entries = data.map(async (item) => {
      let feed = await new Promise((resolve, reject) => {
        db.fetchFeed(item.feed_id, docs => {
          resolve(docs)
        })
      })
      feed = feed[0]
      const tagIndex = _.findIndex(tags, {
        feed_id: item.feed_id
      })
      delete item.content
      delete item.summary
      item.link = item.url
      item.pubDate = item.published
      item.category = tagIndex >= 0 ? tags[tagIndex].name : null
      item.feed_id = feed.feed_id
      item.feed_title = feed.title
      item.feed_url = feed.xmlurl
      item.feed_link = feed.link
      item.read = false
      item.favourite = false
      item.offline = false
      item.favicon = `https://www.google.com/s2/favicons?domain=${item.url}`
      item.workspace = 'feedbin'
      delete item.created_at
      delete item.published
      delete item.url
      db.addArticles(item, docs => {})
      return item
    })
    return entries
  }
}

export async function fetchUnreadEntries () {
  const {
    data
  } = await feedbinApi.get('/v2/unread_entries.json')
  if (data.length > 0) {
    db.updateArticlesUnread(data)
    db.updateArticlesRead(data)
  }
}

export async function markRead (ids) {
  const unread = await feedbinApi.delete('/v2/unread_entries.json', {
    data: {
      unread_entries: ids
    }
  })
  if (unread.status === 200) {
    return unread.data
  } else {
    throw new ApiError('Something was wrong')
  }
}

export async function markUnread (ids) {
  const unread = await feedbinApi.post('/v2/unread_entries.json', {
    data: {
      unread_entries: ids
    }
  })
  if (unread.status === 200) {
    return unread.data
  } else {
    throw new ApiError('Something was wrong')
  }
}

export async function markAsNotFavourite (ids) {
  const favourite = await feedbinApi.delete('/v2/starred_entries.json', {
    data: {
      starred_entries: ids
    }
  })
  if (favourite.status === 200) {
    return favourite.data
  } else {
    throw new ApiError('Something was wrong')
  }
}

export async function markAsFavourite (ids) {
  const favourite = await feedbinApi.post('/v2/starred_entries.json', {
    data: {
      starred_entries: ids
    }
  })
  if (favourite.status === 200) {
    return favourite.data
  } else {
    throw new ApiError('Something was wrong')
  }
}
