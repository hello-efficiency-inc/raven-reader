import db from '../../services/db'
import _ from 'lodash'

const state = {
  accounts: []
}

const mutations = {
  LOAD_ACCOUNTS (state, accounts) {
    state.accounts = accounts
  },
  ADD_ACCOUNT (state, docs) {
    if (docs) {
      state.accounts.unshift(docs)
    }
  },
  DELETE_ACCOUNT (state, id) {
    const index = _.findIndex(state.feeds, {
      id: id
    })
    db.deleteFeed(id)
    state.feeds.splice(index, 1)
  }
}

const actions = {
  loadAccounts ({
    commit
  }) {
    db.fetchAccounts(async docs => {
      commit('LOAD_ACCOUNTS', docs)
    })
  },
  addAccount ({
    dispatch,
    commit
  }, account) {
    db.addAccounts(account, async docs => {
      commit('ADD_ACCOUNT', docs)
      docs.id = `${docs.type}_${docs._id}`
      await dispatch('setWorkspace', docs)
      await dispatch('loadCategories')
      await dispatch('loadFeeds')
      await dispatch('loadArticles')
    })
  },
  async deleteAccount ({
    commit
  }, id) {
    commit('DELETE_ACCOUNT', id)
  }
}

export default {
  state,
  mutations,
  actions
}
