import axios from 'axios'
import Store from 'electron-store'
import vueStore from '../store'
import dayjs from 'dayjs'
import db from './db'
import uuid from 'uuid-by-string'

const store = new Store()

function ApiError (message) {
  this.message = message
  this.name = 'ApiError'
}

export async function syncFeedbin () {
  await getSubscriptions()
  await getEntries()
  await fetchUnreadEntries()
  await fetchStarredEntries()
  vueStore.dispatch('loadArticles')
}

export async function getSubscriptions () {
  const activeWorkspace = await store.get('active_workspace')
  if (activeWorkspace) {
    const {
      error,
      data
    } = await axios.get('https://api.feedbin.com/v2/subscriptions.json', {
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      },
      auth: {
        username: activeWorkspace ? activeWorkspace.email : null,
        password: activeWorkspace ? activeWorkspace.password : null
      }
    })
    if (error) {
      throw new ApiError(error.response)
    }
    if (data) {
      var feeds = data.map((item) => {
        item.link = item.site_url
        item.xmlurl = item.feed_url
        item.favicon = `https://www.google.com/s2/favicons?domain=${item.site_url}`
        item.category = null
        item.workspace = activeWorkspace.id
        return item
      })
      return vueStore.dispatch('addFeed', feeds)
    }
  }
}

export async function getEntries () {
  const today = dayjs().subtract(7, 'day').toISOString()
  const activeWorkspace = await store.get('active_workspace')
  if (activeWorkspace) {
    const {
      error,
      data
    } = await axios.get(`https://api.feedbin.com/v2/entries.json?since=${today}`, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      },
      auth: {
        username: activeWorkspace ? activeWorkspace.email : null,
        password: activeWorkspace ? activeWorkspace.password : null
      }
    })
    if (error) {
      throw new ApiError(error.response)
    }
    if (data) {
      return Promise.all([...data.map(async (item) => {
        let feed = await new Promise((resolve, reject) => {
          db.fetchFeed(item.feed_id, docs => {
            resolve(docs)
          })
        })
        feed = feed[0]
        delete item.content
        delete item.summary
        item.guid = uuid(`${feed.type}-${item.url}`)
        item.link = item.url
        item.pubDate = item.published
        item.category = null
        item.feed_id = feed.id
        item.feed_title = feed.title
        item.feed_url = feed.xmlurl
        item.feed_link = feed.link
        item.read = false
        item.favourite = false
        item.offline = false
        item.favicon = `https://www.google.com/s2/favicons?domain=${item.url}`
        console.log(activeWorkspace.id)
        item.workspace = activeWorkspace.id
        delete item.created_at
        delete item.published
        delete item.url
        db.addArticles(item, docs => {})
        return item
      })])
    }
  }
}

export async function fetchUnreadEntries () {
  const activeWorkspace = await store.get('active_workspace')
  if (activeWorkspace) {
    const {
      error,
      data
    } = await axios.get('https://api.feedbin.com/v2/unread_entries.json', {
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      },
      auth: {
        username: activeWorkspace ? activeWorkspace.email : null,
        password: activeWorkspace ? activeWorkspace.password : null
      }
    })
    if (error) {
      throw new ApiError(error.response)
    }
    if (data.length > 0) {
      console.log('Loaded unread')
      return new Promise((resolve, reject) => {
        db.updateArticlesUnread(activeWorkspace.id, data)
        db.updateArticlesRead(activeWorkspace.id, data)
        resolve(true)
      })
    }
  }
}

export async function fetchStarredEntries () {
  const activeWorkspace = await store.get('active_workspace')
  if (activeWorkspace) {
    const {
      error,
      data
    } = await axios.get('https://api.feedbin.com/v2/starred_entries.json', {
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      },
      auth: {
        username: activeWorkspace ? activeWorkspace.email : null,
        password: activeWorkspace ? activeWorkspace.password : null
      }
    })
    if (error) {
      throw new ApiError(error.response)
    }
    if (data.length > 0) {
      console.log('Loaded favourites')
      console.log(data)
      return new Promise((resolve, reject) => {
        db.updateArticlesStarred(activeWorkspace.id, data)
        resolve(true)
      })
    }
  }
}

export async function markRead (ids) {
  const activeWorkspace = await store.get('active_workspace')
  if (activeWorkspace) {
    const {
      error,
      data
    } = await axios.delete('https://api.feedbin.com/v2/unread_entries.json',
      {
        data: {
          unread_entries: ids
        },
        headers: {
          'Content-Type': 'application/json; charset=utf-8'
        },
        auth: {
          username: activeWorkspace.email,
          password: activeWorkspace.password
        }
      })
    if (error) {
      throw new ApiError('something was wrong')
    }
    if (data) {
      return true
    }
  }
}

export async function markUnread (ids) {
  const activeWorkspace = await store.get('active_workspace')
  if (activeWorkspace) {
    const {
      error,
      data
    } = await axios.post('https://api.feedbin.com/v2/unread_entries.json',
      {
        unread_entries: ids
      },
      {
        headers: {
          'Content-Type': 'application/json; charset=utf-8'
        },
        auth: {
          username: activeWorkspace.email,
          password: activeWorkspace.password
        }
      })
    if (error) {
      throw new ApiError('something was wrong')
    }
    if (data) {
      return true
    }
  }
}

export async function markAsNotFavourite (ids) {
  const activeWorkspace = await store.get('active_workspace')
  if (activeWorkspace) {
    const {
      error,
      data
    } = await axios.delete('https://api.feedbin.com/v2/starred_entries.json', {
      data: {
        starred_entries: ids
      },
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      },
      auth: {
        username: activeWorkspace.email,
        password: activeWorkspace.password
      }
    })
    if (error) {
      throw new ApiError('something was wrong')
    }
    if (data) {
      return true
    }
  }
}

export async function markAsFavourite (ids) {
  const activeWorkspace = await store.get('active_workspace')
  if (activeWorkspace) {
    const {
      error,
      data
    } = await axios.post('https://api.feedbin.com/v2/starred_entries.json', {
      starred_entries: ids
    }, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      },
      auth: {
        username: activeWorkspace.email,
        password: activeWorkspace.password
      }
    })
    if (error) {
      throw new ApiError('something was wrong')
    }
    if (data) {
      return true
    }
  }
}

export async function createTagging (feedId, name) {
  const activeWorkspace = await store.get('active_workspace')
  if (activeWorkspace) {
    const {
      error,
      data
    } = await axios.post('https://api.feedbin.com/v2/taggings.json', {
      feed_id: feedId,
      name: name
    }, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      },
      auth: {
        username: activeWorkspace.email,
        password: activeWorkspace.password
      }
    })
    if (error) {
      throw new ApiError('something was wrong')
    }
    if (data) {
      vueStore.dispatch('addCategory', {
        id: data.id,
        title: data.name,
        type: 'category'
      })
      return true
    }
  }
}
