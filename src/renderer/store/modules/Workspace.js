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
    dispatch,
    commit
  }, account) {
    store.set('active_workspace', account)
    commit('SET_WORKSPACE', account)
    await dispatch('loadCategories')
    await dispatch('loadFeeds')
    await dispatch('loadArticles')
  }
}

export default {
  state,
  mutations,
  actions
}
