import Vue from 'vue'
import Vuex from 'vuex'
import service from '../helpers/services'
import _ from 'lodash'
import {ipcRenderer} from 'electron'

Vue.use(Vuex)

const state = {
  articles: [],
  count: '',
  tags: [],
  feeds: [],
  offline: false
}

const mutations = {
  SET_FEED (state) {
    service.fetchFeeds().then(feeds => {
      state.feeds = feeds
    })
  },
  SET_ARTICLE (state) {
    service.fetchArticles().then(articles => {
      state.articles = articles
    })
  },
  ADD_ARTICLE (state, text) {
    service.addArticles(text, docs => {
      if (state.articles.length === 0) {
        state.articles = docs
      } else {
        if (docs.length > 0) {
          ipcRenderer.send('counter', state.count)
          docs.forEach(item => {
            state.articles.unshift(item)
          })
        } else {
          state.articles.unshift(docs)
        }
      }
      let unread = _.filter(state.articles, {'read': false}).length
      state.count = unread
      ipcRenderer.send('counter', unread)
    })
  },
  ADD_FEED (state, feed, callback) {
    service.addFeed(feed, docs => {
      state.feeds.unshift(docs)
      callback(docs)
    })
  },
  REMOVE_FEED (state, id) {
    let index = _.findIndex(state.feeds, { '_id': id })
    service.deleteFeed(id)
    state.feeds.splice(index, 1)
  },
  REMOVE_ARTICLE (state, id) {
    let index = _.findIndex(state.articles, { '_id': id })
    service.deleteArticle(id)
    state.articles.splice(index, 1)
    state.count = _.filter(state.articles, {'read': false}).length
    ipcRenderer.send('counter', state.count)
  },
  APP_STATUS (state, data) {
    state.offline = data
  },
  INCREMENT_FEEDCOUNT (state, id) {
    let index = _.findIndex(state.feeds, {'_id': id})
    state.feeds[index].count++
    service.updateFeedCount(state.feeds[index]._id, state.feeds[index].count)
  },
  DECREMENT_FEEDCOUNT (state, id) {
    let index = _.findIndex(state.feeds, {'_id': id})
    state.feeds[index].count--
    service.updateFeedCount(state.feeds[index]._id, state.feeds[index].count)
  },
  MARK_READ (state, id) {
    let index = _.findIndex(state.articles, { '_id': id })
    state.articles[index].read = true
    state.count--
    console.log(state.count)
    ipcRenderer.send('counter', state.count)
    service.markRead(id)
  },
  MARK_UNREAD (state, id) {
    let index = _.findIndex(state.articles, { '_id': id })
    state.articles[index].read = false
    state.count++
    ipcRenderer.send('counter', state.count)
    service.markUnread(id)
  },
  FAVOURITE_ARTICLE (state, id) {
    let index = _.findIndex(state.articles, { '_id': id })
    state.articles[index].favourite = true
    service.favouriteArticle(id)
  },
  UNFAVOURITE_ARTICLE (state, id) {
    let index = _.findIndex(state.articles, { '_id': id })
    state.articles[index].favourite = false
    service.unFavouriteArticle(id)
  },
  SET_BADGE (state) {
    service.fetchArticles().then(articles => {
      let unread = _.filter(articles, {'read': false})
      state.count = unread.length
      ipcRenderer.send('counter', unread.length)
    })
  },
  SET_TAG (state) {
    service.fetchTags().then(response => {
      state.tags = response.map(item => {
        let object = {
          name: item.name,
          code: item.code
        }
        return object
      })
    })
  },
  ADD_TAG (state, id, value) {
    state.tags.push(value)
    service.addTag(value, item => {
      let index = _.findIndex(state.articles, { '_id': id })
      state.articles[index].tags.push({ name: item.name, code: item.code })
      service.updateTag(state.articles[index].tags, id)
    })
  },
  UPDATE_TAG (state, id, value) {
    let index = _.findIndex(state.articles, { '_id': id })
    state.articles[index].tags = value
    service.updateTag(value, id)
  }
}

export default new Vuex.Store({
  state,
  mutations
})
