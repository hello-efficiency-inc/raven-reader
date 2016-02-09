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
    </section>
  </div>
</template>
<script>
import store from '../store.js'
var app = require('remote').require('app')
var jetpack = require('fs-jetpack')
var useDataDir = jetpack.cwd(app.getPath("userData") + '/streams/')
var Ps = require('perfect-scrollbar');

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
  ready(){
    var container = document.getElementById('feedlist');
    Ps.initialize(container);
  },
  methods: {
    deleteFeed(id){
      var articles = _.where(store.state.articles, { 'feed_id': id });
      articles.forEach(function(item){
        jetpack.remove(useDataDir.path(item.file))
        removeArticle(item._id)
      });

      removeFeed(id)
    }
  }
}
</script>
