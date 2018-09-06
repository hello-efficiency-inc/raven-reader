import Store from 'electron-store'

const state = {
  cronSettings: '*/5 * * * *',
  darkMode: false
}

const store = new Store()

const mutations = {
  LOAD_SETTINGS (state) {
    state.cronSettings = store.get('settings.cronjob', '*/5 * * * *')
    state.darkMode = store.get('settings.darkMode', 'off')
  },
  SET_CRONJOB (state, data) {
    state.cronSettings = data
  },
  SET_DARKMODE (state, data) {
    state.darkMode = data
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
  setDarkMode ({ commit }, data) {
    store.set('settings.darkMode', data)
    commit('SET_DARKMODE', data)
  }
}

export default {
  state,
  mutations,
  actions
}
