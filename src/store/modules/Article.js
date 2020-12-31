import db from '../../services/db'
import helper from '../../services/helpers'
import dayjs from 'dayjs'
import advanced from 'dayjs/plugin/advancedFormat'
import timezone from 'dayjs/plugin/timezone'
import relativeTime from 'dayjs/plugin/relativeTime'
import Fuse from 'fuse.js'
import cacheService from '../../services/cacheArticle'
import feedbin from '../../services/feedbin'
import inoreader from '../../services/inoreader'
import greader from '../../services/greader'

dayjs.extend(relativeTime)
dayjs.extend(timezone)
dayjs.extend(advanced)

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

const truncateString = (string, maxLength = 50) => {
  if (!string) return null
  if (string.length <= maxLength) return string
  return `${string.substring(0, maxLength)}...`
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

const markItem = (type, rootState, state, index) => {
  if (rootState.Setting.feedbin_connected) {
    feedbin.markItem(rootState.Setting.feedbin, type, [state.articles[index].articles.source_id])
  }
  if (rootState.Setting.selfhost_connected) {
    greader.markItem(rootState.Setting.selfhost, type, [state.articles[index].articles.source_id])
  }
  if (rootState.Setting.inoreader_connected) {
    inoreader.markItem(rootState.Setting.inoreader, type, [state.articles[index].articles.source_id])
  }
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
  LOAD_ARTICLES (state, data) {
    state.articles = Object.freeze(data.data.map((item) => {
      item.articles.contentSnippet = truncateString(item.articles.contentSnippet, 100)
      dayjs.tz.setDefault(Intl.DateTimeFormat().resolvedOptions().timeZone)
      if (data.root.Setting.inoreader_connected || data.root.Setting.selfhost_connected) {
        item.formatDate = dayjs.unix(item.articles.pubDate).format('DD MMMM YYYY h:mm A')
      } else {
        item.formatDate = dayjs(item.articles.pubDate)
          .format('DD MMMM YYYY h:mm A')
      }
      if (!('offline' in item.articles)) {
        item.articles.offline = false
      }
      return item
    }))
  },
  ADD_ARTICLES (state, articles) {
    if (articles) {
      state.articles.unshift(...articles.map((item) => {
        item.feed_title = truncateString(item.feed_title, 20)
        item.formatDate = dayjs(item.pubDate).format('DD MMMM YYYY')
        item.pubDate = dayjs(item.pubDate).unix()
        return item
      }))
    }
  },
  FAVOURITE (state, data) {
    db.markFavourite(data.data.id, true)
    const clone = JSON.parse(JSON.stringify(state.articles))
    const index = state.articles.findIndex(item => item.articles.uuid === data.data.id)
    clone[index].articles.favourite = true
    state.articles = Object.freeze(clone)
    markItem('FAVOURITE', data.rootState, state, index)
  },
  UNFAVOURITE (state, data) {
    db.markFavourite(data.data.id, false).then()
    const clone = JSON.parse(JSON.stringify(state.articles))
    const index = state.articles.findIndex(item => item.articles.uuid === data.data.id)
    clone[index].articles.favourite = false
    state.articles = Object.freeze(clone)
    markItem('UNFAVOURITE', data.rootState, state, index)
  },
  READ (state, data) {
    const clone = JSON.parse(JSON.stringify(state.articles))
    const index = clone.findIndex(item => item.articles.uuid === data.data.id)
    if (clone[index].articles.read) {
      return
    }
    clone[index].articles.read = true
    if (clone[index].articles.podcast) {
      clone[index].articles.played = true
    }
    state.articles = Object.freeze(clone)
    db.markRead(data.data.id, data.data.podcast, true)
    markItem('READ', data.rootState, state, index)
  },
  UNREAD (state, data) {
    const clone = JSON.parse(JSON.stringify(state.articles))
    const index = clone.findIndex(item => item.articles.uuid === data.data.id)
    clone[index].articles.read = false
    if (clone[index].articles.podcast) {
      clone[index].articles.played = false
    }
    state.articles = Object.freeze(clone)
    db.markRead(data.data.id, data.data.podcast, false)
    markItem('UNREAD', data.rootState, state, index)
  },
  MARK_ALL_READ (state, rootState) {
    db.markAllRead(state.articles.filter(item => !item.articles.read).map(item => item.articles.uuid))
    const ids = JSON.parse(JSON.stringify(state.articles)).map(item => item.articles.source_id)
    if (rootState.Setting.feedbin_connected) {
      feedbin.markItem(rootState.Setting.feedbin, 'READ', ids.filter(item => item !== null))
    }

    if (rootState.Setting.selfhost_connected) {
      greader.markItem(rootState.Setting.selfhost, 'READ', ids.filter(item => item !== null))
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
    const clone = JSON.parse(JSON.stringify(state.articles))
    const index = state.articles.findIndex(item => item.articles.uuid === data.article._id)
    clone[index].articles.offline = data.type === 'CACHE'
    state.articles = Object.freeze(clone)
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
  async loadArticles ({ commit, rootState }) {
    const data = await db.fetchArticles()
    commit('LOAD_ARTICLES', {
      root: rootState,
      data: data
    })
  },
  async addArticle ({ commit }, article) {
    commit('ADD_ARTICLES', await db.addArticles(article))
  },
  markAction ({ commit, rootState }, data) {
    commit(data.type, {
      rootState: rootState,
      data: data
    })
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
