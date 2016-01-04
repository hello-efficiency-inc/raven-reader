import Vue from 'vue'
import Vuex from 'vuex'
import _ from 'lodash'
var service = require('./helpers/services.js')

Vue.use(Vuex)

const ADD_ARTICLE = 'ADD_ARTICLE'
const SET_ARTICLE = 'SET_ARTICLE'
const UPDATE_TAG = 'UPDATE_TAG'
const SET_TAG = 'SET_TAG'
const SET_FEED = 'SET_FEED'
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
  getFeed: SET_FEED,
  removeFeed: REMOVE_FEED
}

const mutations = {
  [SET_FEED] (state){
    service.fetchFeeds().then(function(feeds){
      state.feeds = feeds
    })
  },
  [SET_ARTICLE] (state){
    service.fetchArticles().then(function(articles){
      state.articles = articles
    })
  },
  [ADD_ARTICLE] (state,text) {
    service.addArticles(text,function(docs){
      state.articles.unshift(docs)
    })
  },
  [ADD_FEED] (state,feed){
    service.addFeed(feed,function(docs){
      state.feeds.unshift(docs)
    })
  }
}

export default new Vuex.Store({
  state,
  actions,
  mutations
})
