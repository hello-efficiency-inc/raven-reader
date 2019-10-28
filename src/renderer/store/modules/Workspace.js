import Store from 'electron-store'

const store = new Store()
const state = {
  activeWorkspace: null
}

const mutations = {
  LOAD_ACTIVE_WORKSPACE (state, account) {
    state.activeWorkspace = account
  },
  SET_WORKSPACE (state, docs) {
    state.activeWorkspace = docs
  }
}

const actions = {
  loadActiveWorkspace ({
    commit
  }) {
    commit('LOAD_ACTIVE_WORKSPACE', store.get('active_workspace'))
  },
  async setWorkspace ({
    commit
  }, account) {
    return new Promise((resolve, reject) => {
      store.set('active_workspace', account)
      commit('SET_WORKSPACE', account)
      console.log('SET WORKSPACE')
      resolve()
    })
  }
}

export default {
  state,
  mutations,
  actions
}
