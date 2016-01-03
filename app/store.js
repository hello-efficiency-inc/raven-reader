import Vue from 'vue'
import Vuex from 'vuex'
import _ from 'lodash'

Vue.use(Vuex)

const ADD_ARTICLE = 'ADD_ARTICLE'
const SET_ARTICLE = 'SET_ARTICLE'
const UPDATE_TAG = 'UPDATE_TAG'
const SET_TAG = 'SET_TAG'
const ADD_FEED = 'ADD_FEED'
const REMOVE_FEED = 'REMOVE_FEED'

const state = {
  articles : [],
  tags: [],
  feeds: []
}

const actions = {
  addArticles: ADD_ARTICLE,
  getArticles: SET_ARTICLE,
  getTags: SET_TAG,
  updateTag: UPDATE_TAG,
  addFeed: ADD_FEED,
  removeFeed: REMOVE_FEED
}

const mutations = {

}

export default new Vuex.Store({
  state,
  actions,
  mutations
})
