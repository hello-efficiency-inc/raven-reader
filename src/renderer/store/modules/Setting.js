import Store from 'electron-store'

const state = {
  cronSettings: '*/5 * * * *',
  darkMode: false,
  offline: false
}

const store = new Store()

const mutations = {
  LOAD_SETTINGS (state) {
    state.cronSettings = store.get('settings.cronjob')
    state.darkMode = store.get('settings.darkMode')
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
  }
}

export default {
  state,
  mutations,
  actions
}
