import db from '../../services/db'
import _ from 'lodash'

const state = {
  categories: []
}

const mutations = {
  LOAD_CATEGORY (state, data) {
    state.categories = data.map((item) => {
      item.title = _.truncate(item.title, { length: 22 })
      return item
    })
  },
  ADD_CATEGORY (state, data) {
    if (data) {
      data.title = _.truncate(data.title, { length: 22 })
      state.categories.unshift(data)
    }
  },
  DELETE_CATEGORY (state, data) {
    const index = _.findIndex(state.categories, { 'title': data })
    db.deleteCategory(state.categories[index].title)
    state.categories.splice(index, 1)
  },
  RENAME_CATEGORY (state, category, title) {
    const index = _.findIndex(state.categories, { title: category })
    state.categories[index].title = title
    db.updateCategory(category, title)
  }
}

const actions = {
  loadCategories ({ commit }) {
    db.fetchCategories(docs => {
      commit('LOAD_CATEGORY', docs)
    })
  },
  addCategory ({ commit }, category) {
    db.addCategory(category, docs => {
      commit('ADD_CATEGORY', docs)
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
