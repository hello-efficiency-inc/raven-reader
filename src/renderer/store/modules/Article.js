import db from '../../services/db'
import helper from '../../services/helpers'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import _ from 'lodash'
import Fuse from 'fuse.js'
import cacheService from '../../services/cacheArticle'

dayjs.extend(relativeTime)

const state = {
  articles: [],
  type: 'all',
  search: '',
  feed: ''
}

const filters = {
  search: (articles, search) => articles.filter(article => article.title.match(search)),
  unread: articles => articles.filter(article => !article.read),
  read: articles => articles.filter(article => article.read),
  favourites: articles => articles.filter(article => article.favourite),
  feed: (articles, feed) => articles.filter(article => article.feed_id === feed),
  saved: articles => articles.filter(article => article.offline),
  all: articles => articles
}

const searchOption = {
  caseSensitive: true,
  shouldSort: true,
  threshold: 0.6,
  location: 0,
  distance: 100,
  maxPatternLength: 100,
  minMatchCharLength: 1,
  keys: ['title']
}

const getters = {
  filteredArticles: state => {
    const orderedArticles = _.orderBy(state.articles, ['pubDate'], ['desc'])
    if (state.type !== 'feed' && state.type !== 'search') {
      return filters[state.type](orderedArticles)
    }
    if (state.type === 'search') {
      const fuse = new Fuse(state.articles, searchOption)
      if (state.search !== '') {
        return fuse.search(state.search)
      }
      return filters['all'](orderedArticles)
    }
    return filters[state.type](orderedArticles, state.feed)
  }
}

const mutations = {
  LOAD_ARTICLES (state, articles) {
    state.articles = articles.map((item) => {
      item.meta.title = _.truncate(item.meta.title, { length: 20 })
      item.pubdate = dayjs(item.pubdate).fromNow()
      if (!('offline' in item)) {
        item.offline = false
      }
      return item
    })
  },
  ADD_ARTICLES (state, articles) {
    if (articles) {
      articles.meta.title = _.truncate(articles.meta.title, { length: 20 })
      articles.pubdate = dayjs(articles.pubdate).fromNow()
      state.articles.unshift(articles)
    }
  },
  MARK_ACTION (state, data) {
    const index = _.findIndex(state.articles, { '_id': data.id })
    if (data.type === 'FAVOURITE') {
      state.articles[index].favourite = true
    }

    if (data.type === 'UNFAVOURITE') {
      state.articles[index].favourite = false
    }
    if (data.type === 'READ') {
      state.articles[index].read = true
    }

    if (data.type === 'UNREAD') {
      state.articles[index].read = false
    }
  },
  MARK_ALL_READ (state) {
    for (let i = 0; i < state.articles.length; i++) {
      state.articles[i].read = true
      db.markRead(state.articles[i]._id)
    }
  },
  DELETE_ARTICLES (state, id) {
    const articles = _.filter(state.articles, { feed_id: id })
    articles.forEach(async (article) => {
      await cacheService.uncache(`raven-${article._id}`)
    })
    db.deleteArticles(id)
  },
  REFRESH_FEEDS (state, feeds) {
    if (feeds.length > 0) {
      helper.subscribe(feeds, null, true)
    }
  },
  CHANGE_TYPE (state, type) {
    state.type = type
  },
  SET_SEARCH_TERM (state, search) {
    state.search = search
  },
  SET_FEED_ID (state, feed) {
    state.feed = feed
  },
  SAVE_ARTICLE (state, data) {
    const index = _.findIndex(state.articles, { '_id': data.article._id })
    state.articles[index].offline = data.type === 'CACHE'
  }
}

const actions = {
  loadArticles ({ commit }) {
    db.fetchArticles(docs => {
      commit('LOAD_ARTICLES', docs)
    })
  },
  addArticle ({ commit }, article) {
    db.addArticles(article, docs => {
      commit('ADD_ARTICLES', docs)
    })
  },
  markAction ({ commit }, data) {
    switch (data.type) {
      case 'FAVOURITE':
        db.markFavourite(data.id)
        break
      case 'UNFAVOURITE':
        db.markUnfavourite(data.id)
        break
      case 'READ':
        db.markRead(data.id)
        break
      case 'UNREAD':
        db.markUnread(data.id)
        break
    }
    commit('MARK_ACTION', data)
  },
  saveArticle ({ commit }, data) {
    switch (data.type) {
      case 'CACHE':
        db.markOffline(data.article._id)
        break
      case 'UNCACHE':
        db.markOnline(data.article._id)
        break
    }
    commit('SAVE_ARTICLE', data)
  },
  markAllRead ({ commit }) {
    commit('MARK_ALL_READ')
  },
  async deleteArticle ({ dispatch, commit }, id) {
    commit('DELETE_ARTICLES', id)
    await dispatch('loadArticles')
  },
  refreshFeeds ({ commit }) {
    db.fetchFeeds(docs => {
      commit('REFRESH_FEEDS', docs)
    })
  },
  changeType ({ commit }, type) {
    commit('CHANGE_TYPE', type)
  },
  setSearch ({ commit }, search) {
    commit('SET_SEARCH_TERM', search)
  },
  setFeed ({ commit }, feed) {
    commit('SET_FEED_ID', feed)
  }
}

export default {
  state,
  getters,
  mutations,
  actions
}
