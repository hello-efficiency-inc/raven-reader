import db from '../../services/db'
import helper from '../../services/helpers'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import truncate from 'lodash.truncate'
import Fuse from 'fuse.js'
import cacheService from '../../services/cacheArticle'
import feedbin from '../../services/feedbin'
import inoreader from '../../services/inoreader'

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

const filters = {
  search: (articles, search) => articles.filter(article => article.articles.title.match(search)),
  unread: articles => articles.filter(article => !article.articles.read),
  played: articles => articles.filter(article => article.articles.played),
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
  threshold: 0.4,
  keys: ['articles.title', 'articles.content']
}

const sortBy = (key, pref) => {
  if (pref === 'asc') {
    return (a, b) => (a.articles[key] > b.articles[key]) ? 1 : ((b.articles[key] > a.articles[key]) ? -1 : 0)
  }
  return (a, b) => (a.articles[key] < b.articles[key]) ? 1 : ((b.articles[key] < a.articles[key]) ? -1 : 0)
}
const getters = {
  filteredArticles: (state, getters, rootState) => {
    const sortPref = rootState.Setting.oldestArticles === 'off' ? 'desc' : 'asc'
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
      item.articles.contentSnippet = truncate(item.articles.contentSnippet, {
        length: 100
      })
      item.formatDate = dayjs(item.articles.pubDate).format('DD MMMM YYYY h:mm A', {
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      })
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
    const index = state.articles.findIndex(item => item.articles.uuid === data.data.id)
    if (data.data.type === 'FAVOURITE') {
      state.articles[index].articles.favourite = true
    }

    if (data.data.type === 'UNFAVOURITE') {
      state.articles[index].articles.favourite = false
    }
    if (data.data.type === 'READ') {
      state.articles[index].articles.read = true
      if (state.articles[index].articles.podcast) {
        state.articles[index].articles.played = true
      }
    }

    if (data.data.type === 'UNREAD') {
      state.articles[index].articles.read = false
      if (state.articles[index].articles.podcast) {
        state.articles[index].articles.played = false
      }
    }
    if (data.rootState.Setting.feedbin_connected) {
      feedbin.markItem(data.rootState.Setting.feedbin, data.data.type, [state.articles[index].articles.source_id])
    }
    if (data.rootState.Setting.inoreader_connected) {
      inoreader.markItem(data.rootState.Setting.inoreader, data.data.type, [state.articles[index].articles.source_id])
    }
  },
  MARK_ALL_READ (state, rootState) {
    db.markAllRead(state.articles.map(item => item.articles.uuid))
    const ids = JSON.parse(JSON.stringify(state.articles)).map(item => item.articles.source_id)
    if (rootState.Setting.feedbin_connected) {
      feedbin.markItem(rootState.Setting.feedbin, 'READ', ids.filter(item => item !== null))
    }

    if (rootState.Setting.inoreader_connected) {
      inoreader.markItem(rootState.Setting.inoreader, 'READ', ids.filter(item => item !== null))
    }
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
      helper.subscribe(feeds.filter(item => item.source === 'local' || typeof item.source === 'undefined'), null, true)
    }
  },
  CHANGE_TYPE (state, type) {
    state.type = type.type
    state.category = type.category
    state.feed = type.feed
    state.search = type.search
  },
  SAVE_ARTICLE (state, data) {
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
      .map(item => item.articles.uuid)
    db.updateArticleCategory(articles, data.new.title)
  },
  MARK_CATEGORY_READ (state, data) {
    const feedArticles = state.articles.filter(item => item.category === data)
    for (let i = 0; i < feedArticles.length; i++) {
      const index = state.articles.findIndex(item => item._id === feedArticles[i]._id)
      state.articles[index].read = true
      db.markRead(state.articles[index]._id)
    }
  }
}

const actions = {
  async loadArticles ({ commit }) {
    commit('LOAD_ARTICLES', await db.fetchArticles())
  },
  async addArticle ({ commit }, article) {
    commit('ADD_ARTICLES', await db.addArticles(article))
  },
  markAction ({ commit, rootState }, data) {
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
    commit('MARK_ACTION', { rootState: rootState, data: data })
  },
  saveArticle ({ commit }, data) {
    db.markOffline(data.article._id, data.type === 'CACHE')
    commit('SAVE_ARTICLE', data)
  },
  markAllRead ({ commit, rootState }) {
    commit('MARK_ALL_READ', rootState)
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
  }
}

export default {
  state,
  getters,
  mutations,
  actions
}
