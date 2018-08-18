import db from '../../services/db'
import _ from 'lodash'

const state = {
  feeds: []
}

const mutations = {
  LOAD_FEEDS (state, feed) {
    state.feeds = feed.map((item) => {
      item.title = _.truncate(item.title, { length: 22 })
      return item
    })
  },
  ADD_FEED (state, docs) {
    if (docs) {
      docs.title = _.truncate(docs.title, { length: 22 })
      state.feeds.unshift(docs)
    }
  },
  DELETE_FEED (state, id) {
    const index = _.findIndex(state.feeds, { 'id': id })
    db.deleteFeed(id)
    state.feeds.splice(index, 1)
  }
}

const actions = {
  loadFeeds ({ commit }) {
    db.fetchFeeds(docs => {
      commit('LOAD_FEEDS', docs)
    })
  },
  addFeed ({ commit }, feed) {
    db.addFeed(feed, docs => {
      commit('ADD_FEED', docs)
    })
  },
  async deleteFeed ({ dispatch, commit }, id) {
    await dispatch('deleteArticle', id)
    commit('DELETE_FEED', id)
  }
}

export default {
  state,
  mutations,
  actions
}
