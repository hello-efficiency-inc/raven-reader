const state = {
  pocket_connected: false,
  instapaper_connected: false,
  feedbin_connected: false,
  keepRead: 1,
  cronSettings: '*/5 * * * *',
  themeOption: 'system',
  oldestArticles: false,
  offline: false,
  proxy: {
    http: '',
    https: '',
    bypass: ''
  }
}

const Store = window.electronstore
const store = new Store()

const mutations = {
  LOAD_SETTINGS (state) {
    state.cronSettings = store.get('settings.cronjob', '*/5 * * * *')
    state.themeOption = store.get('settings.theme_option', 'system')
    state.oldestArticles = store.get('settings.oldestArticles', false)
    state.proxy = store.get('settings.proxy', { http: '', https: '', bypass: '' })
    state.keepRead = store.get('settings.keepread', 1)
    if (store.has('pocket_token')) {
      state.pocket_connected = true
    }
    if (store.has('instapaper_creds')) {
      state.instapaper_connected = true
    }
    if (store.has('feedbin_creds')) {
      state.feedbin_connected = true
    }
  },
  CHECK_OFFLINE (state) {
    state.offline = !navigator.onLine
  },
  SET_KEEP_READ (state, data) {
    state.keepRead = data
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
  },
  UNSET_POCKET (state) {
    state.pocket_connected = false
  },
  SET_INSTAPAPER_CONNECTED (state) {
    state.instapaper_connected = true
  },
  SET_FEEDBIN_CONNECTED (state) {
    state.feedbin_connected = true
  },
  UNSET_FEEDBIN (state) {
    state.feedbin_connected = false
  },
  UNSET_INSTAPAPER (state) {
    state.instapaper_connected = false
  }
}

const actions = {
  loadSettings ({ commit }) {
    commit('LOAD_SETTINGS')
  },
  setKeepRead ({ commit }, data) {
    store.set('settings.keepread', data)
    commit('SET_KEEP_READ', data)
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
  setFeedbin ({ commit }, data) {
    store.set('feedbin_creds', data)
    commit('SET_FEEDBIN_CONNECTED')
  },
  setInstapaper ({ commit }, data) {
    store.set('instapaper_creds', data)
    commit('SET_INSTAPAPER_CONNECTED')
  },
  setPocket ({ commit }, data) {
    store.set('pocket_token', data)
    commit('SET_POCKET_CONNECTED')
  },
  unsetInstapaper ({ commit }) {
    store.delete('instapaper_creds')
    commit('UNSET_INSTAPAPER')
  },
  unsetFeedbin ({ commit }) {
    store.delete('feedbin_creds')
    commit('UNSET_FEEDBIN')
  },
  unsetPocket ({ commit }) {
    store.delete('pocket_token')
    commit('UNSET_POCKET')
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
