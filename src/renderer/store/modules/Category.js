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
    db.deleteCategory(state.categories[index])
    state.categories.splice(index, 1)
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
  }
}

export default {
  state,
  mutations,
  actions
}
