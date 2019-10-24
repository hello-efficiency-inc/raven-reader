import db from '../../services/db'
import helper from '../../services/helpers'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import _ from 'lodash'
import Fuse from 'fuse.js'
import cacheService from '../../services/cacheArticle'
import Store from 'electron-store'

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

const store = new Store()

const filters = {
  search: (articles, search) => articles.filter(article => article.title.match(search)),
  unread: articles => articles.filter(article => !article.read),
  read: articles => articles.filter(article => article.read),
  favourites: articles => articles.filter(article => article.favourite),
  feed: (articles, feed) => articles.filter(article => article.feed_id === feed),
  category: (articles, category) => articles.filter(article => article.category === category),
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
    const sortPref = store.get('settings.oldestArticles') === 'off' ? 'desc' : 'asc'
    const orderedArticles = _.orderBy(state.articles, ['pubDate'], [sortPref])
    if (state.type !== 'feed' && state.type !== 'search') {
      return filters[state.type](orderedArticles)
    }
    if (state.type === 'search') {
      const fuse = new Fuse(state.articles, searchOption)
      if (state.search !== '') {
        return fuse.search(state.search)
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
      item.feed_title = _.truncate(item.feed_title, { length: 20 })
      item.title = _.truncate(item.title, { length: 50 })
      item.formatDate = dayjs(item.pubDate).format('DD MMMM YYYY')
      item.pubDate = dayjs(item.pubDate).unix()
      if (!('offline' in item)) {
        item.offline = false
      }
      return item
    })
  },
  ADD_ARTICLES (state, articles) {
    if (articles) {
      state.articles.unshift(...articles.map((item) => {
        item.feed_title = _.truncate(item.feed_title, {
          length: 20
        })
        item.formatDate = dayjs(item.pubDate).format('DD MMMM YYYY')
        item.pubDate = dayjs(item.pubDate).unix()
        return item
      }))
    }
  },
  MARK_ACTION (state, data) {
    const index = _.findIndex(state.articles, { _id: data.id })
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
  MARK_FEED_READ (state, id) {
    const feedArticles = _.filter(state.articles, { feed_id: id })
    for (let i = 0; i < feedArticles.length; i++) {
      const index = _.findIndex(state.articles, { _id: feedArticles[i]._id })
      state.articles[index].read = true
      db.markRead(state.articles[index]._id)
    }
  },
  DELETE_ARTICLES_CATEGORY (state, category) {
    const articles = _.filter(state.articles, { title: category })
    articles.forEach(async (article) => {
      await cacheService.uncache(`raven-${article._id}`)
    })
    db.deleteArticlesCategory(category)
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
  SET_CATEGORY_TYPE (state, category) {
    state.category = category
  },
  SET_FEED_ID (state, feed) {
    state.feed = feed
  },
  SAVE_ARTICLE (state, data) {
    const index = _.findIndex(state.articles, { _id: data.article._id })
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
    const index = _.findIndex(state.articles, {
      _id: data.article_id
    })
    if (index >= 0) {
      state.articles[index].feed_title = data.title
    }
  },
  CHANGE_FONT_STYLE (state, data) {
    state.fontStyle = data
  },
  UPDATE_ARTICLE_CATEGORY (state, data) {
    const articles = _.filter(state.articles, {
      category: data.old.title
    })
    for (let i = 0; i < articles.length; i++) {
      const index = _.findIndex(state.articles, {
        _id: articles[i]._id
      })
      db.updateArticleCategory(state.articles[index]._id, data.new.title)
      state.articles[index].category = data.new.title
    }
  },
  MARK_CATEGORY_READ (state, data) {
    const feedArticles = _.filter(state.articles, {
      category: data
    })
    for (let i = 0; i < feedArticles.length; i++) {
      const index = _.findIndex(state.articles, {
        _id: feedArticles[i]._id
      })
      state.articles[index].read = true
      db.markRead(state.articles[index]._id)
    }
  }
}

const actions = {
  loadArticles ({ commit }) {
    const activeSpace = store.get('active_workspace', null)
    let type = null
    if (activeSpace && activeSpace.type === 'feedbin') {
      type = 'feedbin'
    }
    db.fetchArticles(type, docs => {
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
  }
}

export default {
  state,
  getters,
  mutations,
  actions
}
