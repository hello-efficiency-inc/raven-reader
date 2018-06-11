import db from '../../services/db'

const state = {
  articles: []
}

const mutations = {
  LOAD_ARTICLES (state, articles) {
    state.articles = articles
  },
  ADD_ARTICLES (state, articles) {
    state.articles.unshift(articles)
  },
  DELETE_ARTICLES (state) {
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
  deleteArticle ({ commit }) {
    commit('DELETE_ARTICLES')
  }
}

export default {
  state,
  mutations,
  actions
}
