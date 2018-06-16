import db from '../../services/db'

const state = {
  feeds: []
}

const mutations = {
  LOAD_FEEDS (state, feed) {
    state.feeds = feed
  },
  ADD_FEED (state, docs) {
    state.feeds.unshift(docs)
  },
  DELETE_FEED (state) {
  }
}

const actions = {
  loadFeeds ({ commit }) {
    db.fetchFeeds(docs => {
      commit('LOAD_FEEDS', docs)
    })
  },
  addFeed ({ commit, state }, feed) {
    db.addFeed(feed, docs => {
      commit('ADD_FEED', docs)
    })
  },
  deleteFeed ({ commit }) {
    commit('DELETE_FEED')
  }
}

export default {
  state,
  mutations,
  actions
}
