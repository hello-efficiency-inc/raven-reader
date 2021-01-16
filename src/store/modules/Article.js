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

dayjs.tz.setDefault(Intl.DateTimeFormat().resolvedOptions().timeZone)
dayjs.extend(relativeTime)
dayjs.extend(timezone)
dayjs.extend(advanced)

const sortBy = (key, pref) => {
  if (pref === 'asc') {
    return (a, b) => (a.articles[key] > b.articles[key] ? 1 : b.articles[key] > a.articles[key] ? -1 : 0)
  }
  return (a, b) => (a.articles[key] < b.articles[key] ? 1 : b.articles[key] < a.articles[key] ? -1 : 0)
}

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
    state.articles = Object.freeze(data.data)
  },
  MARK_ACTION (state, data) {
    const index = state.articles.findIndex(item => item.articles.uuid === data.data.id)
    const source = state.articles[index].articles.source
    if (data.rootState.Setting.feedbin_connected && source === 'feedbin') {
      feedbin.markItem(data.rootState.Setting.feedbin, data.data.type, [state.articles[index].articles.source_id])
    }
    if (data.rootState.Setting.selfhost_connected && source === 'greader') {
      greader.markItem(data.rootState.Setting.selfhost, data.data.type, [state.articles[index].articles.source_id])
    }
    if (data.rootState.Setting.inoreader_connected && source === 'inoreader') {
      inoreader.markItem(data.rootState.Setting.inoreader, data.data.type, [state.articles[index].articles.source_id])
    }
  },
  MARK_ALL_READ (state, rootState) {
    const unreadArticles = state.articles.reduce((arr, item) => {
      if (!item.articles.read) {
        arr.push(item.articles.uuid)
      }
      return arr
    }, [])
    const sourceIds = state.articles.reduce((arr, item) => {
      if (!item.articles.read) {
        arr.push(item.articles.source_id)
      }
      return arr
    }, [])
    db.markAllRead(unreadArticles)
    if (rootState.Setting.feedbin_connected) {
      feedbin.markItem(rootState.Setting.feedbin, 'READ', sourceIds.filter(item => item !== null))
    }

    if (rootState.Setting.selfhost_connected) {
      greader.markItem(rootState.Setting.selfhost, 'READ', sourceIds.filter(item => item !== null))
    }

    if (rootState.Setting.inoreader_connected) {
      inoreader.markItem(rootState.Setting.inoreader, 'READ', sourceIds.filter(item => item !== null))
    }
  },
  DELETE_ARTICLES (state, id) {
    const articles = state.articles.filter(item => item.feed_id === id)
    for (let i = 0; i < articles.length; i++) {
      cacheService.uncache(`raven-${articles[i]._id}`)
    }
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
    db.markCategoryRead(data)
  }
}

const actions = {
  async loadArticles ({ commit, rootState }) {
    commit('LOAD_ARTICLES', {
      root: rootState,
      data: await db.fetchArticles()
    })
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
