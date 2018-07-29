import db from '../../services/db'
import _ from 'lodash'

const state = {
  feeds: []
}

const getters = {
  feedsMapped: state => {
    return state.feeds.map((item) => {
      item.title = _.truncate(item.title, { length: 25 })
      return item
    })
  }
}

const mutations = {
  LOAD_FEEDS (state, feed) {
    state.feeds = feed
  },
  ADD_FEED (state, docs) {
    if (docs) {
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
  deleteFeed ({ commit }, id) {
    commit('DELETE_FEED', id)
  }
}

export default {
  state,
  getters,
  mutations,
  actions
}
