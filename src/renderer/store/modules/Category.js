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
  DELETE_CATEGORY (state, num) {
    const index = _.findIndex(state.categories, { '_id': num })
    state.categories.splice(index, 1)
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
  deleteCategory ({ commit }, _id) {
    db.deleteCategory(_id, num => {
      commit('DELETE_CATEGORY', num)
    })
  }
}

export default {
  state,
  mutations,
  actions
}
