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
const MARK_READ = 'MARK_READ'
const MARK_UNREAD = 'MARK_UNREAD'
const INCREMENT_FEEDCOUNT = 'INCREMENT_FEEDCOUNT'

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
  removeFeed: REMOVE_FEED,
  markRead: MARK_READ,
  markUnread: MARK_UNREAD,
  incrementCount: INCREMENT_FEEDCOUNT
}

const mutations = {
  [SET_FEED] (state){
    service.fetchFeeds().then(function(feeds){
      state.feeds = feeds
    });
  },
  [SET_ARTICLE] (state){
    service.fetchArticles().then(function(articles){
      state.articles = articles
    })
  },
  [ADD_ARTICLE] (state,text) {
    service.addArticles(text,function(docs){
      if(state.articles.length == 0){
        state.articles = docs
      } else {
        state.articles = state.articles.concat(docs)
      }
    })
  },
  [ADD_FEED] (state,feed){
    service.addFeed(feed,function(docs){
      state.feeds.unshift(docs)
    })
  },
  [INCREMENT_FEEDCOUNT] (state,title){
    var index = _.findIndex(state.feeds,{'title': title})
    state.feeds[index].count++;
  },
  [MARK_READ] (state,id){
    service.markRead(id);
    var index = _.findIndex(state.articles, { '_id': id });
    var feed = state.articles[index].feed;
    var feedIndex = _.findIndex(state.feeds,{ 'title': String(feed) });
    console.log(feedIndex);
    state.feeds[feedIndex].count--;
    service.updateFeedCount(state.feeds[feedIndex]._id,state.feeds[feedIndex].count)
  },
  [MARK_UNREAD] (state,id){
    service.markUnread(id);
    var index = _.findIndex(state.articles, { '_id': id });
    var feed = state.articles[index].feed
    var feedIndex = _.findIndex(state.feeds,{ 'title': feed });
    state.feeds[feedIndex].count++
    service.updateFeedCount(state.feeds[feedIndex]._id,state.feeds[feedIndex].count)
  }
}

export default new Vuex.Store({
  state,
  actions,
  mutations
})
