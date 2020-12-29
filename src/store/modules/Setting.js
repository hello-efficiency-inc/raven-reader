const state = {
  pocket_connected: false,
  pocket: null,
  inoreader: null,
  instapaper_connected: false,
  inoreader_connected: false,
  instapaper: {
    username: null,
    password: null
  },
  feedbin_connected: false,
  feedbin: {
    endpoint: 'https://api.feedbin.com/v2/',
    email: null,
    password: null
  },
  selfhost_connected: false,
  selfhost: {
    endpoint: null,
    username: null,
    password: null,
    auth: null
  },
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

const electronstore = window.electronstore

const mutations = {
  LOAD_SETTINGS (state) {
    const settings = JSON.parse(JSON.stringify(electronstore.getSettings()))
    if (typeof settings.feedbin !== 'undefined') {
      settings.feedbin = JSON.parse(settings.feedbin)
    }
    if (typeof settings.inoreader !== 'undefined') {
      settings.inoreader = JSON.parse(settings.inoreader)
    }
    if (settings.pocket_creds) {
      settings.pocket = JSON.parse(settings.pocket_creds)
    }
    if (settings.selfhost_creds) {
      settings.selfhost = JSON.parse(settings.selfhost_creds)
    }
    Object.assign(state, settings)
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
  SET_SELFHOST_CONNECTED (state, data) {
    state.selfhost_connected = true
    state.selfhost = data
  },
  SET_INOREADER_CONNECTED (state, data) {
    state.inoreader_connected = true
    state.inoreader = JSON.parse(data)
  },
  SET_POCKET_CONNECTED (state, data) {
    state.pocket_connected = true
    state.pocket = data
  },
  UNSET_POCKET (state) {
    state.pocket_connected = false
    state.pocket = null
  },
  SET_INSTAPAPER_CONNECTED (state, data) {
    state.instapaper_connected = true
    state.instapaper = data
  },
  SET_FEEDBIN_CONNECTED (state, data) {
    state.feedbin_connected = true
    state.feedbin = data
  },
  UNSET_INOREADER (state) {
    state.inoreader_connected = false
    state.inoreader = null
  },
  UNSET_SELFHOST (state) {
    state.selfhost_connected = false
    state.selfhost = {
      endpoint: null,
      username: null,
      password: null,
      auth: null
    }
  },
  UNSET_FEEDBIN (state) {
    state.feedbin_connected = false
    state.feedbin = {
      endpoint: 'https://api.feedbin.com/v2/',
      email: null,
      password: null
    }
  },
  UNSET_INSTAPAPER (state) {
    state.instapaper_connected = false
    state.instapaper = {
      username: null,
      password: null
    }
  }
}

const actions = {
  loadSettings ({ commit }) {
    commit('LOAD_SETTINGS')
  },
  setKeepRead ({ commit }, data) {
    electronstore.storeSetSettingItem('set', 'settings.keepread', data)
    commit('SET_KEEP_READ', data)
  },
  setCronJob ({ commit }, data) {
    electronstore.storeSetSettingItem('set', 'settings.cronjob', data)
    commit('SET_CRONJOB', data)
  },
  setOffline ({ commit }, data) {
    commit('SET_OFFLINE', data)
  },
  setThemeOption ({ commit }, data) {
    electronstore.storeSetSettingItem('set', 'settings.theme_option', data)
    commit('SET_THEME_OPTION', data)
  },
  setInoreader ({ commit }, data) {
    electronstore.storeSetSettingItem('set', 'inoreader_creds', data)
    commit('SET_INOREADER_CONNECTED', data)
  },
  setFeedbin ({ commit }, data) {
    electronstore.storeSetSettingItem('set', 'feedbin_creds', data)
    commit('SET_FEEDBIN_CONNECTED', data)
  },
  setSelfhost ({ commit }, data) {
    electronstore.storeSetSettingItem('set', 'selfhost_creds', data)
    commit('SET_SELFHOST_CONNECTED', data)
  },
  setInstapaper ({ commit }, data) {
    electronstore.storeSetSettingItem('set', 'instapaper_creds', data)
    commit('SET_INSTAPAPER_CONNECTED', data)
  },
  setPocket ({ commit }, data) {
    electronstore.storeSetSettingItem('set', 'pocket_creds', data)
    commit('SET_POCKET_CONNECTED', data)
  },
  unsetInoreader ({ commit }) {
    electronstore.storeSetSettingItem('delete', 'inoreader_creds')
    commit('UNSET_INOREADER')
  },
  unsetInstapaper ({ commit }) {
    electronstore.storeSetSettingItem('delete', 'instapaper_creds')
    commit('UNSET_INSTAPAPER')
  },
  unsetFeedbin ({ commit }) {
    electronstore.storeSetSettingItem('delete', 'feedbin_creds')
    commit('UNSET_FEEDBIN')
  },
  unsetSelfhost ({ commit }) {
    electronstore.storeSetSettingItem('delete', 'selfhost_creds')
    commit('UNSET_SELFHOST')
  },
  unsetPocket ({ commit }) {
    electronstore.storeSetSettingItem('delete', 'pocket_creds')
    commit('UNSET_POCKET')
  },
  async setSortPreference ({ dispatch, commit }, data) {
    electronstore.storeSetSettingItem('set', 'settings.oldestArticles', data)
    commit('SET_SORT_PREFERENCE', data)
    await dispatch('loadArticles')
  },
  checkOffline ({ commit }) {
    commit('CHECK_OFFLINE')
  },
  setProxy ({ commit }, data) {
    electronstore.storeSetSettingItem('set', 'settings.proxy', data)
    commit('SET_PROXY')
  }
}

export default {
  state,
  mutations,
  actions
}
