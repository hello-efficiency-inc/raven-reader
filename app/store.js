import Vue from 'vue'
import Vuex from 'vuex'
import _ from 'lodash'
import online from 'is-online'
var service = require('./helpers/services.js')

Vue.use(Vuex)

const ADD_ARTICLE = 'ADD_ARTICLE'
const SET_ARTICLE = 'SET_ARTICLE'
const UPDATE_TAG = 'UPDATE_TAG'
const SET_TAG = 'SET_TAG'
const SET_FEED = 'SET_FEED'
const ADD_FEED = 'ADD_FEED'
const REMOVE_FEED = 'REMOVE_FEED'
const REMOVE_ARTICLE = 'REMOVE_ARTICLE'
const MARK_READ = 'MARK_READ'
const MARK_UNREAD = 'MARK_UNREAD'
const INCREMENT_FEEDCOUNT = 'INCREMENT_FEEDCOUNT'
const CHECK_OFFLINE = 'CHECK_OFFLINE'

const state = {
  articles : [],
  tags: [],
  feeds: [],
  offline: true
}

const actions = {
  addArticles: ADD_ARTICLE,
  getArticles: SET_ARTICLE,
  getTags: SET_TAG,
  updateTag: UPDATE_TAG,
  addFeed: ADD_FEED,
  getFeed: SET_FEED,
  removeFeed: REMOVE_FEED,
  removeArticle: REMOVE_ARTICLE,
  markRead: MARK_READ,
  markUnread: MARK_UNREAD,
  incrementCount: INCREMENT_FEEDCOUNT,
  checkOffline: CHECK_OFFLINE
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
        if(docs.length > 0){
          docs.forEach(function(item){
            state.articles.unshift(item)
          })
        } else {
          state.articles.unshift(docs)
        }
      }
    })
  },
  [ADD_FEED] (state,feed,callback){
    service.addFeed(feed,function(docs){
      state.feeds.unshift(docs)
      callback(docs)
    })
  },
  [INCREMENT_FEEDCOUNT] (state,title){
    var index = _.findIndex(state.feeds,{'title': title})
    state.feeds[index].count++;
  },
  [MARK_READ] (state,id){
    service.markRead(id);
    var index = _.findIndex(state.articles, { '_id': id });
    var feed = state.articles[index].feed_id;
    var feedIndex = _.findIndex(state.feeds,{ '_id': feed });
    state.feeds[feedIndex].count--;
    state.articles[index].read = true
    service.updateFeedCount(state.feeds[feedIndex]._id,state.feeds[feedIndex].count)
  },
  [MARK_UNREAD] (state,id){
    service.markUnread(id);
    var index = _.findIndex(state.articles, { '_id': id });
    var feed = state.articles[index].feed_id
    var feedIndex = _.findIndex(state.feeds,{ '_id': feed });
    state.feeds[feedIndex].count++
    state.articles[index].read = false
    service.updateFeedCount(state.feeds[feedIndex]._id,state.feeds[feedIndex].count)
  },
  [CHECK_OFFLINE] (state){
    online(function(err,online){
      state.offline = online
    })
  },
  [SET_TAG] (state){
    service.fetchTags().then(function(tag){
      state.tags = tag
    })
  },
  [UPDATE_TAG] (state,id,value){
    var current_text = _.pluck(state.tags,"text")
    service.addTag(value,function(item){
      service.updateTag(item,id)
      var index = _.findIndex(state.articles, '_id', id)
      state.articles[index].tags = item
      item.forEach(function(item){
        if(current_text.indexOf(item.text) < 0){
          state.tags.push(item)
        }
      })
    })
  },
  [REMOVE_FEED] (state,id){
    var index = _.findIndex(state.feeds, '_id', id);
    service.deleteFeed(id);
    state.feeds.splice(index,1)
  },
  [REMOVE_ARTICLE] (state,id){
    var index = _.findIndex(state.articles, '_id', id);
    service.deleteArticle(id)
    state.articles.splice(index,1)
  }
}

export default new Vuex.Store({
  state,
  actions,
  mutations
})
