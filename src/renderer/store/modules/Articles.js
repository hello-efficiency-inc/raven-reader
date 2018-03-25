import _ from 'lodash'
import db from '../../helpers/services'

const state = {
  articles: []
}

const mutations = {
  SET_ARTICLES (state, docs) {
    state.articles = docs
  },
  ADD_ARTICLES (state, docs) {
    if (!_.isUndefined(docs)) {
      state.articles.unshift(docs)
    }
  },
  REMOVE_ARTICLES (state) {
    state.main++
  },
  MARK_FAVOURITE (state) {

  },
  MARK_UNFAVOURITE (state) {

  },
  MARK_READ (state) {

  },
  MARK_UNREAD (state) {

  }
}

const actions = {
  loadArticles ({ commit }) {
    db.fetchArticles(docs => {
      commit('SET_ARTICLES', docs)
    })
  },
  addArticles ({ commit }, article) {
    db.addArticles(article, docs => {
      commit('ADD_ARTICLES', docs)
    })
  }
}

export default {
  state,
  mutations,
  actions
}
