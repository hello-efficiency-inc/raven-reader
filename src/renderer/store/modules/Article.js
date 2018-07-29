import db from '../../services/db'
import helper from '../../services/helpers'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import _ from 'lodash'

dayjs.extend(relativeTime)

const state = {
  articles: [],
  type: 'all',
  search: ''
}

const filters = {
  search: (articles, search) => articles.filter(article => article.title.match(search)),
  unread: articles => articles.filter(article => !article.read),
  read: articles => articles.filter(article => article.read),
  favourites: articles => articles.filter(article => article.favourite),
  feed: (articles, feed) => articles.filter(article => article.feed_id === feed),
  all: articles => articles
}

const getters = {
  filteredArticles: state => {
    const orderedArticles = _.orderBy(state.articles, ['pubDate'], ['desc'])
    if (state.type !== 'feed' && state.type !== 'search') {
      return filters[state.type](orderedArticles)
    }
    if (state.type === 'search') {
      return orderedArticles.filter(article => article.title.toLowerCase().match(state.search.toLowerCase()))
    }
    return filters[this.type](orderedArticles, this.feed)
  }
}

const mutations = {
  LOAD_ARTICLES (state, articles) {
    state.articles = articles.map((item) => {
      item.meta.title = _.truncate(item.meta.title, { length: 20 })
      item.pubdate = dayjs(item.pubdate).fromNow()
      return item
    })
  },
  ADD_ARTICLES (state, articles) {
    if (articles) {
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
  DELETE_ARTICLES (state, id) {
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
    }
    commit('MARK_ACTION', data)
  },
  deleteArticle ({ commit }, id) {
    commit('DELETE_ARTICLES', id)
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
  }
}

export default {
  state,
  getters,
  mutations,
  actions
}
