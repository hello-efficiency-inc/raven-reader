import _ from 'lodash'
import db from '../../helpers/services'

const state = {
  categories: []
}

const mutations = {
  SET_CATEGORIES (state, docs) {
    state.categories = docs
  },
  ADD_CATEGORY (state, data) {
    if (!_.isUndefined(data)) {
      state.categories.unshift(data)
    }
  },
  DELETE_CATEGORY (state) {
    state.main++
  }
}

const actions = {
  loadCategory ({ commit }) {
    db.fetchCategories(docs => {
      commit('SET_CATEGORIES', docs)
    })
  },
  addCategory ({ commit }, data) {
    db.addCategory(data, docs => {
      commit('ADD_CATEGORY', docs)
    })
  },
  deleteCategory ({ commit }) {
    commit('DELETE_CATEGORY')
  }
}

export default {
  state,
  mutations,
  actions
}
