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
  search: (articles, search) => articles.filter(article => article.articles.title.match(search)),
  unread: articles => articles.filter(article => !article.articles.read),
  played: articles => articles.filter(article => article.articles.podcast && article.articles.played),
  read: articles => articles.filter(article => article.articles.read),
  favourites: articles => articles.filter(article => article.articles.favourite),
  feed: (articles, feed) => articles.filter(article => article.articles.feed_uuid === feed),
  category: (articles, category) => articles.filter(article => article.articles.category === category),
  saved: articles => articles.filter(article => article.articles.offline),
  all: articles => articles
}

const searchOption = {
  minMatchCharLength: 2,
  isCaseSensitive: false,
  shouldSort: true,
  findAllMatches: true,
  includeScore: true,
  threshold: 0.3,
  keys: ['articles.title', 'articles.content']
}

const sortBy = (key, pref) => {
  if (pref === 'asc') {
    return (a, b) => (a.articles[key] > b.articles[key]) ? 1 : ((b.articles[key] > a.articles[key]) ? -1 : 0)
  }
  return (a, b) => (a.articles[key] < b.articles[key]) ? 1 : ((b.articles[key] < a.articles[key]) ? -1 : 0)
}
const getters = {
  filteredArticles: state => {
    const sortPref = store.get('settings.oldestArticles') === 'off' ? 'desc' : 'asc'
    const orderedArticles = state.articles.concat().sort(sortBy('publishUnix', sortPref))
    if (state.type !== 'feed' && state.type !== 'search') {
      return filters[state.type](orderedArticles)
    }
    if (state.type === 'search') {
      const searchIndex = Fuse.createIndex(searchOption.keys, state.articles)
      const fuse = new Fuse(state.articles, searchOption, searchIndex)
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
    state.articles = Object.freeze(articles.map((item) => {
      item.feeds.title = truncate(item.feeds.title, { length: 20 })
      item.articles.title = truncate(item.articles.title, { length: 250 })
      item.articles.contentSnippet = truncate(item.articles.contentSnippet, {
        length: 100
      })
      item.formatDate = dayjs(item.articles.pubDate).format('DD MMMM YYYY')
      if (!('offline' in item.articles)) {
        item.articles.offline = false
      }
      return item
    }))
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
    const index = state.articles.findIndex(item => item.articles.uuid === data.id)
    if (data.type === 'FAVOURITE') {
      state.articles[index].articles.favourite = true
    }

    if (data.type === 'UNFAVOURITE') {
      state.articles[index].articles.favourite = false
    }
    if (data.type === 'READ') {
      state.articles[index].articles.read = true
      if (state.articles[index].articles.podcast) {
        state.articles[index].articles.played = true
      }
    }

    if (data.type === 'UNREAD') {
      state.articles[index].articles.read = false
      if (state.articles[index].articles.podcast) {
        state.articles[index].articles.played = false
      }
    }
  },
  MARK_ALL_READ (state) {
    db.markAllRead(state.articles.map(item => item.articles.uuid))
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
    console.log(data.article)
    const index = state.articles.findIndex(item => item.articles.uuid === data.article._id)
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
  CHANGE_FONT_STYLE (state, data) {
    state.fontStyle = data
  },
  UPDATE_ARTICLE_CATEGORY (state, data) {
    const articles = state.articles.filter(item => item.articles.category === data.old.title)
    for (let i = 0; i < articles.length; i++) {
      const index = state.articles.findIndex(item => item.articles.uuid === articles[i].articles.uuid)
      db.updateArticleCategory(state.articles[index].articles.uuid, data.new.title)
      state.articles[index].articles.category = data.new.title
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
  async loadArticles ({ commit }) {
    commit('LOAD_ARTICLES', await db.fetchArticles())
  },
  async addArticle ({ commit }, article) {
    commit('ADD_ARTICLES', await db.addArticles(article))
  },
  markAction ({ commit }, data) {
    switch (data.type) {
      case 'FAVOURITE':
        db.markFavourite(data.id, true)
        break
      case 'UNFAVOURITE':
        db.markFavourite(data.id, false)
        break
      case 'READ':
        db.markRead(data.id, data.podcast, true)
        break
      case 'UNREAD':
        db.markRead(data.id, data.podcast, false)
        break
    }
    commit('MARK_ACTION', data)
  },
  saveArticle ({ commit }, data) {
    db.markOffline(data.article._id, data.type === 'CACHE')
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
  async refreshFeeds ({ dispatch, commit }) {
    commit('REFRESH_FEEDS', await db.fetchFeeds())
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
  updateArticleFeedTitle ({ commit }, data) {
    db.updateArticleFeedCategory(data.id, data.category)
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
