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
  }
}

export default {
  state,
  mutations,
  actions
}
