<template>
  <div class="add-feed-container">
    <section>
      <h2>Organize Feed</h2>
      <p>Note: This would purge feed including webpages stored for offline purpose.</p>
      <br/>
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
    <section>
      <h2>Export Feed</h2>
      <p> If you want to use feeds in another application, click button below. All feeds will be exported in one file and you can then import this file to other reader.</p>
      <br/>
      <button class="export-btn" type="button" v-on:click="openFile()">Save feed as a file</button>
    </section>
  </div>
</template>
<script>
import store from '../store.js'
var app = require('remote').require('app')
var jetpack = require('fs-jetpack')
var useDataDir = jetpack.cwd(app.getPath("userData") + '/streams/')
var Ps = require('perfect-scrollbar');
var dialog = require('remote').require('dialog')
var opmlexport = require('../helpers/opml.js')
var services = require('../helpers/services.js')

const {
  removeFeed,
  removeArticle,
  removeTag
} = store.actions

export default{
  computed: {
    feeds(){
      return store.state.feeds
    }
  },
  ready(){
    var container = document.getElementById('feedlist');
    Ps.initialize(container);
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
        opmlexport.exportFeed(fileName)
      });
    }
  }
}
</script>
