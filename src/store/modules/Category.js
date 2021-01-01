import db from '../../services/db'
import truncate from '../../services/truncate'
import * as database from '../../db'

const state = {
  categories: []
}

const mutations = {
  LOAD_CATEGORY (state, data) {
    state.categories = Object.freeze(data.map((item) => {
      item.title = truncate(item.title, 22)
      return item
    }))
  },
  RENAME_CATEGORY (state, category) {
    db.updateCategory(category.id, category.title)
  }
}

const actions = {
  async loadCategories ({ commit }) {
    commit('LOAD_CATEGORY', await db.fetchCategories())
  },
  addCategory ({ commit }, category) {
    db.addCategory([database.categoryTable.createRow(category)])
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
