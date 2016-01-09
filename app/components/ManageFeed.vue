<template>
  <div class="add-feed-container">
    <h2>Manage Feeds</h2>
    <p>Note: This would purge feed including webpages stored for offline purpose.</p>
    <br/>
    <ul class="list-feeds" v-if="feeds.length > 0">
      <li v-for="feed in feeds">
        <img v-bind:src="feed.favicon" width="20" height="20"> {{ feed.title }}
        <button class="delete-btn" type="button" v-on:click="deleteFeed(feed.title)">Delete</button>
      </li>
    </ul>
    <div class="v-spinner" v-if="feeds.length == 0">
      No feeds found.
    </div>
  </div>
</template>
<script>
import store from '../store.js'
var app = require('remote').require('app')
var jetpack = require('fs-jetpack')
var useDataDir = jetpack.cwd(app.getPath("userData") + '/streams/')

const {
  removeFeed,
  removeArticle,
} = store.actions

export default{
  computed: {
    feeds(){
      return store.state.feeds
    }
  },
  methods: {
    deleteFeed(title){
      var articles = _.where(store.state.articles, { 'feed': title });

      articles.forEach(function(item){
        jetpack.remove(useDataDir.path(item.file))
        removeArticle(item._id)
      });

      removeFeed(title)
    }
  }
}
</script>
