import db from '../../services/db'
import truncate from 'lodash.truncate'

const state = {
  categories: []
}

const mutations = {
  LOAD_CATEGORY (state, data) {
    state.categories = Object.freeze(data.map((item) => {
      item.title = truncate(item.title, { length: 22 })
      return item
    }))
  },
  ADD_CATEGORY (state, data) {
    if (data) {
      data.title = truncate(data.title, { length: 22 })
      state.categories.unshift(data)
    }
  },
  DELETE_CATEGORY (state, data) {
    const index = state.categories.findIndex(item => item.title === data)
    db.deleteCategory(state.categories[index].title)
    state.categories.splice(index, 1)
  },
  RENAME_CATEGORY (state, category) {
    const index = state.categories.findIndex(item => item.id === category.id)
    state.categories[index].title = category.title
    db.updateCategory(category.id, category.title)
  }
}

const actions = {
  async loadCategories ({ commit }) {
    commit('LOAD_CATEGORY', await db.fetchCategories())
  },
  addCategory ({ commit }, category) {
    db.addCategory(category).then((result) => {
      commit('ADD_CATEGORY', result)
    })
  },
  deleteCategory ({ commit }, category) {
    commit('DELETE_CATEGORY', category)
  },
  renameCategory ({ commit }, title) {
    commit('RENAME_CATEGORY', title)
  }
}

export default {
  state,
  mutations,
  actions
}
