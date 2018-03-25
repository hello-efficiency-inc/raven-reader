import _ from 'lodash'
import db from '../../helpers/services'

const state = {
  feeds: []
}

const mutations = {
  LOAD_FEEDS (state, feed) {
    state.feeds = feed
  },
  ADD_FEED (state, feed) {
    if (!_.isUndefined(feed)) {
      state.feeds.unshift(feed)
    }
  },
  UNSUBSCRIBE_FEED (state) {
    state.main++
  }
}

const actions = {
  loadFeed ({ commit }) {
    db.fetchFeeds(docs => {
      commit('LOAD_FEEDS', docs)
    })
  },
  addFeed ({ commit, state }, feed) {
    db.addFeed(feed, docs => {
      commit('ADD_FEED', docs)
    })
  },
  unsubscribeFeed ({ commit }) {
    commit('UNSUBSCRIBE_FEED')
  }
}

export default {
  state,
  mutations,
  actions
}
