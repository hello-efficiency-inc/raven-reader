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
    return new Promise((resolve, reject) => {
      db.addAccounts(account, async (err, docs) => {
        if (err) {
          reject(new Error('Already registered'))
        }
        if (docs) {
          commit('ADD_ACCOUNT', docs)
          await dispatch('setWorkspace', docs)
        }
        console.log('ADD ACCOUNT')
        resolve()
      })
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
