import db from '../../services/db'
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
    articles.pubdate = dayjs(articles.pubdate).fromNow()
    state.articles.unshift(articles)
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
  markFavourite ({ commit }, id) {
    commit('MARK_FAVOURITE', id)
  },
  markUnfavourite ({ commit }, id) {
    commit('MARK_UNFAVOURITE', id)
  },
  markRead ({ commit }, id) {
    commit('MARK_READ', id)
  },
  markUnread ({ commit }, id) {
    commit('MARK_UNREAD', id)
  },
  deleteArticle ({ commit }, id) {
    commit('DELETE_ARTICLES', id)
  }
}

export default {
  state,
  mutations,
  actions
}
