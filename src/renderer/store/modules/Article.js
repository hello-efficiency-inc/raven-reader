import db from '../../services/db'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

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
