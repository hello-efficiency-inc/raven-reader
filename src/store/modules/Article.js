import db from '../../services/db'
import helper from '../../services/helpers'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import truncate from 'lodash.truncate'
import Fuse from 'fuse.js'
import cacheService from '../../services/cacheArticle'

dayjs.extend(relativeTime)

const state = {
  articles: [],
  type: 'unread',
  search: '',
  fontSettingOn: false,
  fontSize: 100,
  fontStyle: null,
  category: null,
  feed: ''
}

const Store = window.electronstore
const store = new Store()

const filters = {
  search: (articles, search) => articles.filter(article => article.title.match(search)),
  unread: articles => articles.filter(article => !article.read),
  played: articles => articles.filter(article => article.podcast && article.played),
  read: articles => articles.filter(article => article.read),
  favourites: articles => articles.filter(article => article.favourite),
  feed: (articles, feed) => articles.filter(article => article.feed_id === feed),
  category: (articles, category) => articles.filter(article => article.category === category),
  saved: articles => articles.filter(article => article.offline),
  all: articles => articles
}

const searchOption = {
  minMatchCharLength: 2,
  isCaseSensitive: false,
  shouldSort: true,
  findAllMatches: true,
  includeScore: true,
  threshold: 0.3,
  keys: ['title', 'content']
}

const sortBy = (key, pref) => {
  if (pref === 'asc') {
    return (a, b) => (a[key] > b[key]) ? 1 : ((b[key] > a[key]) ? -1 : 0)
  }
  return (a, b) => (a[key] < b[key]) ? 1 : ((b[key] < a[key]) ? -1 : 0)
}
const getters = {
  filteredArticles: state => {
    const sortPref = store.get('settings.oldestArticles') === 'off' ? 'desc' : 'asc'
    const orderedArticles = state.articles.concat().sort(sortBy('publishUnix', sortPref))
    if (state.type !== 'feed' && state.type !== 'search') {
      return filters[state.type](orderedArticles)
    }
    if (state.type === 'search') {
      const fuse = new Fuse(state.articles, searchOption)
      if (state.search !== '') {
        return fuse.search(state.search).map(article => article.item)
      }
      return filters.all(orderedArticles)
    }
    if (state.category) {
      return filters.category(orderedArticles, state.category)
    }
    return filters[state.type](orderedArticles, state.feed)
  }
}

const mutations = {
  LOAD_ARTICLES (state, articles) {
    state.articles = articles.map((item) => {
      item.feed_title = truncate(item.feed_title, { length: 20 })
      item.title = truncate(item.title, { length: 250 })
      item.formatDate = dayjs(item.pubDate).format('DD MMMM YYYY')
      if (!('offline' in item)) {
        item.offline = false
      }
      return item
    })
  },
  ADD_ARTICLES (state, articles) {
    if (articles) {
      state.articles.unshift(...articles.map((item) => {
        item.feed_title = truncate(item.feed_title, {
          length: 20
        })
        item.formatDate = dayjs(item.pubDate).format('DD MMMM YYYY')
        item.pubDate = dayjs(item.pubDate).unix()
        return item
      }))
    }
  },
  MARK_ACTION (state, data) {
    const index = state.articles.findIndex(item => item._id === data.id)
    if (data.type === 'FAVOURITE') {
      state.articles[index].favourite = true
    }

    if (data.type === 'UNFAVOURITE') {
      state.articles[index].favourite = false
    }
    if (data.type === 'READ') {
      state.articles[index].read = true
      if (state.articles[index].podcast) {
        state.articles[index].played = true
      }
    }

    if (data.type === 'UNREAD') {
      state.articles[index].read = false
      if (state.articles[index].podcast) {
        state.articles[index].played = false
      }
    }
  },
  MARK_ALL_READ (state) {
    for (let i = 0; i < state.articles.length; i++) {
      state.articles[i].read = true
      db.markRead(state.articles[i]._id, null)
    }
  },
  MARK_FEED_READ (state, id) {
    const feedArticles = state.articles.filter(item => item.feed_id === id)
    for (let i = 0; i < feedArticles.length; i++) {
      const index = state.articles.findIndex(item => item._id === feedArticles[i]._id)
      state.articles[index].read = true
      db.markRead(state.articles[index]._id, null)
    }
  },
  DELETE_ARTICLES_CATEGORY (state, category) {
    const articles = state.articles.filter(item => item.title === category)
    articles.forEach(async (article) => {
      await cacheService.uncache(`raven-${article._id}`)
    })
    db.deleteArticlesCategory(category)
  },
  DELETE_ARTICLES (state, id) {
    const articles = state.articles.filter(item => item.feed_id === id)
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
  SET_CATEGORY_TYPE (state, category) {
    state.category = category
  },
  SET_FEED_ID (state, feed) {
    state.feed = feed
  },
  SAVE_ARTICLE (state, data) {
    const index = state.articles.findIndex(item => item._id === data.article._id)
    state.articles[index].offline = data.type === 'CACHE'
  },
  INCREASE_FONT (state) {
    if (state.fontSize <= 150) {
      state.fontSize += 5
    }
  },
  DRECREASE_FONT (state) {
    if (state.fontSize !== 100) {
      state.fontSize -= 5
    }
  },
  FONT_SETTINGS_ON (state, data) {
    state.fontSettingOn = data
  },
  UPDATE_FEED_TITLE (state, data) {
    const index = state.articles.findIndex(item => item._id === data.article_id)
    if (index >= 0) {
      state.articles[index].feed_title = data.title
    }
  },
  CHANGE_FONT_STYLE (state, data) {
    state.fontStyle = data
  },
  UPDATE_ARTICLE_CATEGORY (state, data) {
    const articles = state.articles.filter(item => item.category === data.old.title)
    for (let i = 0; i < articles.length; i++) {
      const index = state.articles.findIndex(item => item._id === articles[i]._id)
      db.updateArticleCategory(state.articles[index]._id, data.new.title)
      state.articles[index].category = data.new.title
    }
  },
  MARK_CATEGORY_READ (state, data) {
    const feedArticles = state.articles.filter(item => item.category === data)
    for (let i = 0; i < feedArticles.length; i++) {
      const index = state.articles.findIndex(item => item._id === feedArticles[i]._id)
      state.articles[index].read = true
      db.markRead(state.articles[index]._id)
    }
  },
  REMOVE_OLD_READ (state) {
    const week = store.get('settings.keepread', 1)
    db.removeOldReadItems(dayjs().subtract(week, 'week').unix())
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
        db.markRead(data.id, data.podcast)
        break
      case 'UNREAD':
        db.markUnread(data.id, data.podcast)
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
  async deleteArticleCategory ({ dispatch, commit }, category) {
    commit('DELETE_ARTICLES_CATEGORY', category)
    await dispatch('loadArticles')
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
  setCategory ({ commit }, title) {
    commit('SET_CATEGORY_TYPE', title)
  },
  setFeed ({ commit }, feed) {
    commit('SET_FEED_ID', feed)
  },
  decreaseFont ({ commit }) {
    commit('DRECREASE_FONT')
  },
  increaseFont ({ commit }) {
    commit('INCREASE_FONT')
  },
  changeFontStyle ({ commit }, font) {
    commit('CHANGE_FONT_STYLE', font)
  },
  turnOnFontSetting ({ commit }, data) {
    commit('FONT_SETTINGS_ON', data)
  },
  updateArticleCategory ({ commit }, data) {
    commit('UPDATE_ARTICLE_CATEGORY', data)
  },
  async updateArticleFeedTitle ({ dispatch, commit }, data) {
    db.updateArticleFeedTitle(data.id, data.title, data.category)
    commit('UPDATE_FEED_TITLE', data)
    await dispatch('loadArticles')
  },
  markCategoryRead ({
    commit
  }, id) {
    commit('MARK_CATEGORY_READ', id)
  },
  markFeedRead ({
    commit
  }, id) {
    commit('MARK_FEED_READ', id)
  },
  async removeOldReadItems ({ dispatch, commit }) {
    commit('REMOVE_OLD_READ')
    await dispatch('loadArticles')
  }
}

export default {
  state,
  getters,
  mutations,
  actions
}
