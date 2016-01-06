import Vue from 'vue'
import Vuex from 'vuex'
import _ from 'lodash'
import got from 'got'
import jetpack from 'fs-jetpack'
var service = require('./helpers/services.js')
var feed = require('./helpers/feed.js')
const app = require('remote').require('app')
const useDataDirStream = jetpack.cwd(app.getPath("userData") + '/streams/')
const randomstring = require("randomstring")

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
  markUnread: MARK_UNREAD
}

const mutations = {
  [SET_FEED] (state){
    service.fetchFeeds().then(function(feeds){
      state.feeds = feeds
      // if(feeds.length > 0){
      //   feeds.forEach(function(item,index){
      //     var favicon = item.favicon;
      //     var title = item.title;
      //     var count = item.count;
      //     feed.fetchNewArticles(item.url).then(function(newarticles){
      //       var newArticles = newarticles.articles;
      //       service.fetchArticles().then(function(articles){
      //         var oldArticles = articles;
      //         newArticles.forEach(function(articleItem){
      //           if(_.where(oldArticles,{ title: articleItem.title }).length == 0){
      //             var html_filename = randomstring.generate() + '.html';
      //             articleItem.feed = title;
      //             articleItem.file = html_filename;
      //             articleItem.read = false;
      //             articleItem.favicon = favicon;
      //             got.stream(articleItem.link).pipe(useDataDirStream.createWriteStream(html_filename))
      //             service.addArticles(articleItem,function(docs){})
      //             state.feeds[index].count++;
      //             service.updateFeedCount(state.feeds[index]._id,state.feeds[index].count)
      //           }
      //         });
      //       });
      //     });
      //   });
      // }
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
  [MARK_READ] (state,id){
    service.markRead(id);
    var index = _.findIndex(state.articles, { '_id': id });
    var feed = state.articles[index].feed
    var feedIndex = _.findIndex(state.feeds,{ 'title': feed });
    state.feeds[feedIndex].count--
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
