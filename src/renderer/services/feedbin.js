import axios from 'axios'
import Store from 'electron-store'
import vueStore from '../store'
import dayjs from 'dayjs'
import db from './db'
import uuid from 'uuid-by-string'
import _ from 'lodash'

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
  vueStore.dispatch('loadFeeds')
  vueStore.dispatch('loadArticles')
}

export async function getSubscriptions () {
  console.log('get feeds')
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
      var tags = await getTagging()
      tags.map((tag) => {
        tag.id = uuid(`${activeWorkspace.id}-${tag.name}`)
        tag.title = tag.name
        tag.type = 'category'
        tag.workspace = activeWorkspace.id
        return tag
      })
      var feeds = data.map((item) => {
        var tagIndex = _.findIndex(tags, {
          feed_id: item.feed_id
        })
        if (tagIndex > -1) {
          vueStore.dispatch('addCategory', tags[tagIndex])
        }
        item.link = item.site_url
        item.xmlurl = item.feed_url
        item.favicon = `https://www.google.com/s2/favicons?domain=${item.site_url}`
        item.category = tagIndex > -1 ? tags[tagIndex].title : null
        item.workspace = activeWorkspace.id
        return item
      })
      return new Promise((resolve, reject) => {
        vueStore.dispatch('addFeed', feeds)
        resolve(true)
      })
    }
  }
}

export async function getEntries () {
  console.log('get entries')
  const today = dayjs().subtract(10, 'day').toISOString()
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
        item.guid = uuid(`${activeWorkspace.type}-${feed.id}-${item.url}`)
        item.link = item.url
        item.pubDate = item.published
        item.category = feed.category
        item.feed_id = parseInt(feed.id)
        item.feed_title = feed.title
        item.feed_url = feed.xmlurl
        item.feed_link = feed.link
        item.read = false
        item.favourite = false
        item.offline = false
        item.favicon = `https://www.google.com/s2/favicons?domain=${item.url}`
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
  console.log('unread items')
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
  console.log('Star entries')
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

export async function getTagging () {
  const activeWorkspace = await store.get('active_workspace')
  if (activeWorkspace) {
    const {
      error,
      data
    } = await axios.get('https://api.feedbin.com/v2/taggings.json', {
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
      return data
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

export async function deleteSubscription (feedId) {
  const activeWorkspace = await store.get('active_workspace')
  if (activeWorkspace) {
    const {
      error,
      data
    } = await axios.delete(`https://api.feedbin.com/v2/subscriptions/${feedId}.json`, {
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

export async function updateSubscription (feedId, feeddata) {
  const activeWorkspace = await store.get('active_workspace')
  if (activeWorkspace) {
    const { error } = await axios.post(`https://api.feedbin.com/v2/subscriptions/${feedId}/update.json`, {
      title: feeddata
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
    return true
  }
}

export async function createSubscription (feedUrl) {
  const activeWorkspace = await store.get('active_workspace')
  if (activeWorkspace) {
    const {
      error,
      data
    } = await axios.post('https://api.feedbin.com/v2/subscriptions.json', {
      feed_url: feedUrl
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
      await vueStore.dispatch('addFeed', {
        id: data.id,
        title: data.title,
        feed_id: data.feed_id,
        feed_url: data.feed_url,
        site_url: data.site_url,
        link: data.site_url,
        xmlurl: data.feed_url,
        favicon: `https://www.google.com/s2/favicons?domain=${data.site_url}`,
        category: null,
        workspace: activeWorkspace.id
      })
      await syncFeedbin()
      return true
    }
  }
}
