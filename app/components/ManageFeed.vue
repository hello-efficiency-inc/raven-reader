<template>
  <div class="dashboard-header">
    <div class="menu-btn" v-on:click="toggleMenu()" v-el:menu-btn>
      <i v-bind:class="['fa', 'fa-fw', $parent.menuOpen ? 'fa-times' : 'fa-bars']"></i>
    </div>

    <h2>Organize Feeds</h2>
  </div>

  <div class="add-feed-container">
    <section class="add-feed-section">
      <h2>Add Feed</h2>
      <p>Type or copy/paste link to website you want to subscribe to (it could be URL to entire site, or direct link to RSS file).</p>
      <div class="add-feed-input">
        <input type="url" class="form-control" v-model="feedurl" v-on:keyup.enter="addFeed()" placeholder="Put link here">
      </div>
      <div v-if="alert" class="alert danger">
        <p>{{ alertmessage }}</p>
      </div>
      <p><button v-bind:disabled="processed" v-on:click="addFeed()" type="button" class="add-button">Add</button></p>
    </section>
    <br/>
    <section>
      <h2>Feed List</h2>
      <p>Note: This would purge feed including webpages stored for offline purpose.</p>
      <div id="feedlist">
        <ul class="list-feeds" v-if="feeds.length > 0">
          <li v-for="feed in feeds">
            <img v-if="feed.favicon !== null" v-bind:src="feed.favicon" width="20" height="20"> <i v-if="feed.favicon === null" class="fa fa-fw fa-rss"></i> {{ feed.title }}
            <button class="delete-btn" type="button" v-on:click="deleteFeed(feed._id)">Delete</button>
          </li>
        </ul>
      </div>
      <div v-if="feeds.length == 0">
        <strong>No feeds found.</strong>
      </div>
    </section>
    <br/>
    <section class="add-feed-section">
      <h2>Import Feeds</h2>
      <button class="add-button" v-bind:disabled="processed" type="button" v-on:click="importFile()">Select file to import</button>
    </section>
    <br/>
    <section>
      <h2>Export Feeds</h2>
      <p> If you want to use feeds in another application, click button below. All feeds will be exported in one file and you can then import this file to other reader.</p>
      <br/>
      <button class="export-btn" type="button" v-on:click="openFile()">Save feed as a file</button>
    </section>
  </div>
</template>
<script>
import store from '../store.js'
import feed from '../helpers/feed'
import favicon from '../helpers/favicon'
import service from '../helpers/services'
import queue from '../helpers/queue'
import _ from 'lodash'
import online from 'is-online'
import async from 'async'
var app = require('remote').require('app')
var jetpack = require('fs-jetpack')
var useDataDir = jetpack.cwd(app.getPath("userData") + '/streams/')
var Ps = require('perfect-scrollbar');
var dialog = require('remote').require('dialog')
var opml = require('../helpers/opml.js')
var services = require('../helpers/services.js')

const {
  removeFeed,
  removeArticle,
  removeTag,
  addFeed,
  addArticles
} = store.actions

export default{
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
    feeds(){
      return store.state.feeds
    },
    offline(){
      return store.state.offline
    }
  },
  ready(){
    var container = document.getElementById('feedlist');
    Ps.initialize(container);

    setTimeout(function(){
      store.actions.checkOffline()
    },1000)

    if(!this.offline){
      this.processed = true
      this.alert = true
      this.alertmessage = "You are currently offline."
    }
  },
  methods: {
    deleteFeed(id){
      var articles = _.where(store.state.articles, { 'feed_id': id });
      var tags = [];
      articles.forEach(function(item){
        if(item.tags){
          tags.push(item.tags);
        }
        jetpack.remove(useDataDir.path(item.file))
        removeArticle(item._id)
      });
      tags.forEach(function(tag){
          articles = _.where(store.state.articles, { 'tags' : [tag[0]] })
          if(articles.length <= 1)
          {
            removeTag(tag._id)
          }
      })
      removeFeed(id)
    },
    importFile(){
      var self = this;
      self.processed = true;

      dialog.showOpenDialog({
        title: 'Select OPML File',
        filters: [
          { name: 'opml', extensions: ['opml']}
        ],
        properties: [ 'openFile', 'openDirectory']
      },
      function(fileNames) {
        if (fileNames) {
          opml.importFeed(fileNames[0], function(err, feeds) {
            if (err) {
              self.alert = true;
              self.alertmessage = "Sorry. There was a problem reading the file.";
              self.processed = false
            }
            feeds.forEach(function(feed) {
              self.feedurl = feed.feedUrl;
              self.addFeed();
            })
          });
        }
      }
    );
    },
    openFile(){
      // Open dialog to save file to destination specified by user.
      dialog.showSaveDialog({
        defaultPath:'rssfeed-export',
        filters: [
          { name: 'opml' , extensions: ['opml'] }
        ]
      },
      function(fileName){
        if (fileName === undefined) return;
        opml.exportFeed(fileName)
      });
    },
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
    },
    toggleMenu() {
      this.$parent.toggleMenu();
    }
  }
}
</script>
