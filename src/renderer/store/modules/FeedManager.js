const state = {
  activeFeedId: null,
  activeArticleId: null,
  isFeedIdValid: null,
  isArticleIdValid: null
}

const getId = item => !!item && item.id !== undefined && !!(item.id) ? item.id : null

const getters = {
  activeFeedId: state => {
    return state.activeFeedId
  },
  activeArticleId: state => {
    return state.activeArticleId
  }
}

const mutations = {
  SET_ACTIVE_FEED_ID (state, id) {
    state.activeFeedId = id
    state.isFeedIdValid = !!(id)
  },
  SET_ACTIVE_ARTICLE_ID (state, id) {
    state.activeArticleId = id
    state.isArticleIdValid = !!(id)
  }
}

const actions = {
  setActiveFeedId ({ commit }, feed) {
    commit('SET_ACTIVE_FEED_ID', getId(feed))
  },
  setActiveArticleId ({ commit }, article) {
    commit('SET_ACTIVE_ARTICLE_ID', getId(article))
  }
}

export default {
  state,
  getters,
  mutations,
  actions
}
