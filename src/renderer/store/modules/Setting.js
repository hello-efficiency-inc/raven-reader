import Store from 'electron-store'

const state = {
  cronSettings: '*/5 * * * *',
  darkMode: false,
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
    state.darkMode = store.get('settings.darkMode')
    state.proxy = store.get('settings.proxy')
  },
  CHECK_OFFLINE (state) {
    state.offline = !navigator.onLine
  },
  SET_CRONJOB (state, data) {
    state.cronSettings = data
  },
  SET_DARKMODE (state, data) {
    state.darkMode = data
  },
  SET_OFFLINE (state, data) {
    state.offline = data === 'offline'
  },
  SET_PROXY (state, data) {
    state.proxy = data
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
  setDarkMode ({ commit }, data) {
    store.set('settings.darkMode', data)
    commit('SET_DARKMODE', data)
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
