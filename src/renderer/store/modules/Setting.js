import Store from 'electron-store'

const state = {
  pocket_connected: false,
  cronSettings: '*/5 * * * *',
  themeOption: null,
  oldestArticles: false,
  offline: false,
  proxy: {
    http: '',
    https: '',
    bypass: ''
  }
}

const store = new Store()

const mutations = {
  LOAD_SETTINGS (state) {
    state.cronSettings = store.get('settings.cronjob')
    state.themeOption = store.get('settings.theme_option')
    state.oldestArticles = store.get('settings.oldestArticles')
    state.proxy = store.get('settings.proxy')
    if (store.get('pocket_token')) {
      state.pocket_connected = true
    }
  },
  CHECK_OFFLINE (state) {
    state.offline = !navigator.onLine
  },
  SET_CRONJOB (state, data) {
    state.cronSettings = data
  },
  SET_THEME_OPTION (state, data) {
    state.darkMode = data
  },
  SET_SORT_PREFERENCE (state, data) {
    state.oldestArticles = data
  },
  SET_OFFLINE (state, data) {
    state.offline = data === 'offline'
  },
  SET_PROXY (state, data) {
    state.proxy = data
  },
  SET_POCKET_CONNECTED (state) {
    state.pocket_connected = true
  }
}

const actions = {
  loadSettings ({ commit }) {
    commit('LOAD_SETTINGS')
  },
  setCronJob ({ commit }, data) {
    store.set('settings.cronjob', data)
    commit('SET_CRONJOB', data)
  },
  setOffline ({ commit }, data) {
    commit('SET_OFFLINE', data)
  },
  setThemeOption ({ commit }, data) {
    store.set('settings.theme_option', data)
    commit('SET_THEME_OPTION', data)
  },
  setPocket ({ commit }, data) {
    store.set('pocket_token', data)
    commit('SET_POCKET_CONNECTED')
  },
  async setSortPreference ({ dispatch, commit }, data) {
    store.set('settings.oldestArticles', data)
    commit('SET_SORT_PREFERENCE', data)
    await dispatch('loadArticles')
  },
  checkOffline ({ commit }) {
    commit('CHECK_OFFLINE')
  },
  setProxy ({ commit }, data) {
    store.set('settings.proxy', data)
    commit('SET_PROXY')
  }
}

export default {
  state,
  mutations,
  actions
}
