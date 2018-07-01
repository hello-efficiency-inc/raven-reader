import db from '../../services/db'
import helper from '../../services/helpers'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import _ from 'lodash'

dayjs.extend(relativeTime)

const state = {
  articles: []
}

const mutations = {
  LOAD_ARTICLES (state, articles) {
    state.articles = articles.map((item) => {
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
  MARK_FAVOURITE (state, id) {
    const index = _.findIndex(state.articles, { '_id': id })
    db.markFavourite(id)
    state.articles[index].favourite = true
  },
  MARK_UNFAVOURITE (state, id) {
    db.markUnfavourite(id)
    const index = _.findIndex(state.articles, { '_id': id })
    state.articles[index].favourite = false
  },
  MARK_READ (state, id) {
    const index = _.findIndex(state.articles, { '_id': id })
    db.markRead(id)
    state.articles[index].read = true
  },
  MARK_UNREAD (state, id) {
    const index = _.findIndex(state.articles, { '_id': id })
    db.markUnread(id)
    state.articles[index].read = false
  },
  DELETE_ARTICLES (state, id) {
    db.deleteArticles(id)
    const articles = _.filter(state.articles, { 'feed_id': id })
    articles.forEach((index) => {
      state.articles.splice(index, 1)
    })
  },
  REFRESH_FEEDS (state, feeds) {
    if (feeds.length > 0) {
      helper.subscribe(feeds, null, true)
    }
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
        commit('MARK_FAVOURITE', data.id)
        break
      case 'UNFAVOURITE':
        commit('MARK_UNFAVOURITE', data.id)
        break
      case 'READ':
        commit('MARK_READ', data.id)
        break
      case 'UNREAD':
        commit('MARK_UNREAD', data.id)
    }
  },
  deleteArticle ({ commit }, id) {
    commit('DELETE_ARTICLES', id)
  },
  refreshFeeds ({ commit }) {
    db.fetchFeeds(docs => {
      commit('REFRESH_FEEDS', docs)
    })
  }
}

export default {
  state,
  mutations,
  actions
}
