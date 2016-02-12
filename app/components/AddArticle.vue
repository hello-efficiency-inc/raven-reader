<template>
  <div class="add-feed-container">
    <h2>Add Feed</h2>
    <p>Type or copy/paste link to website you want to subscribe to (it could be URL to entire site, or direct link to RSS file).</p>
    <div class="add-feed-input">
      <input type="url" class="form-control" v-model="feedurl" v-on:keyup.enter="addFeed()" placeholder="Put link here">
    </div>
    <div v-if="alert" class="alert danger">
      <p>{{ alertmessage }}</p>
    </div>
    <p><button v-bind:disabled="processed" v-on:click="addFeed()" type="button" class="add-button">Add</button></p>
  </div>
</template>
<script>

import feed from '../helpers/feed'
import favicon from '../helpers/favicon'
import service from '../helpers/services'
import queue from '../helpers/queue'
import store from '../store'
import _ from 'lodash'
import online from 'is-online'
import async from 'async'

const {
  addFeed,
  addArticles
} = store.actions

export default {
  data(){
    return {
      feedurl: '',
      alert: false,
      alertmessage: '',
      processed: false,
      meta:{},
      articles:{}
    }
  },
  computed: {
    offline(){
      return store.state.offline
    }
  },
  ready(){

    setTimeout(function(){
      store.actions.checkOffline()
    },1000)

    if(!this.offline){
      this.processed = true
      this.alert = true
      this.alertmessage = "You are currently offline."
    }
  },
  methods:{
    fetchFeed(callback){
      feed.fetchFeed(this.feedurl).then(function(result){
        if(result === null){
          var error = "Sorry. I couldn't figure out any RSS feed on this address. Try to find link to RSS feed on that site by yourself and paste it here.";
          callback(error)
        } else {
          callback(null,result)
        }
      },function(err){
        var error = "Sorry. Unfortunately this website is not supported.";
        callback(error)
      })
    },
    checkFeed(data,callback){
      service.checkFeed(data.meta.title,function(count){
        if(count === 0){
          callback(null,data);
        } else {
          callback('Feed Exists');
        }
      });
    },
    fetchIcon(data,callback){
      favicon.fetchIcon(data.meta.link).then(function(result){
        var path;
        if(result !== null){
          path = queue.queueTask('favicon',result);
        } else {
          path = null;
        }
        data.meta.favicon = path;
        data.meta.count = data.articles.length;
        callback(null,data)
      })
    },
    addFeedItem(data,callback){
      addFeed(data.meta,function(result){
        data.meta = result
        callback(null,data);
      })
    },
    addArticles(data,callback){
      data.articles.map(function(item){
        var html_filename = queue.queueTask('html',item.link);
        item.feed = data.meta.title;
        item.feed_id = data.meta._id;
        item.file = html_filename;
        item.read = false;
        item.favicon = data.meta.favicon;
        return item;
      })
      addArticles(data.articles);
      callback(null,'done');
    },
    addFeed(){
      var self = this;
      this.processed = true
      async.waterfall([
        this.fetchFeed,
        this.checkFeed,
        this.fetchIcon,
        this.addFeedItem,
        this.addArticles
      ],function(err,result){
        if(!err){
          self.processed = false
          return self.$route.router.go({path: '/',replace: true})
        } else {
          self.alert = true;
          self.alertmessage = err;
          self.processed = false
        }
      })
    }
  }
}
</script>
