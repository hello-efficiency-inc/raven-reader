<template>
  <div class="dashboard-header">
    <h2>{{ title }} </h2>
    <div class="settings-trigger refresh" dropdown>
      <i class="fa fa-refresh fa-fw"></i>
    </div>
  </div>
  <div class="dashboard-articles">
    <ul v-if="articles.length > 0" class="articles">
      <li v-for="article in articles" class="article" v-on:click="articleDetail(article._id)">
        <h3>{{ article.title }}</h3>
        <div class="provider">
          <img v-bind:src="article.favicon" width="15" height="15" alt={{ article.title }}> {{ article.feed }}
        </div>
        <div class="description">
            {{ article.summary }}
        </div>
        <ul v-for="tag in article.tags" class="article-tags">
          <li>{{ tag.text }}</li>
        </ul>
      </li>
    </ul>
    <div class="v-spinner" v-if="articles.length == 0">No feeds available</div>
  </div>
  <div class="dashboard-article-detail">
    <div class="manage-article" v-if="content">
      <div class="edit-article-tags">
        <button type="button" v-on:click="showTag()" class="toggle-tag-editor">
          <i class="fa fa-fw fa-tag"></i>
          Edit Tags
        </button>
        <div v-if="showModal" class="tags-dropdown">
          <select v-select="selected" :options="options">
          </select>
          <button type="button" class="btn-block" v-on:click="saveTags(id,selected)">Save</button>
        </div>
      </div>
      <button v-if="!markedread" v-on:click="markRead()" type="button" class="toggle-tag-editor">
        <i class="fa fa-fw fa-check"></i>
        Mark as read
      </button>
      <button v-if="markedread" v-on:click="markUnread()" type="button" class="toggle-tag-editor">
        <i class="fa fa-fw fa-history"></i>
        Mark as unread
      </button>
    </div>
    <article-detail :articletitle="articletitle" :pubdate="pubDate" :feed="feed" :content="content" :favicon="favicon" v-if="content"></article-detail>
    <div class="v-spinner" v-if="!content">Nothing selected</div>
  </div>
</template>
<script>
import store from '../store'
import PulseLoader from 'vue-spinner/src/PulseLoader.vue'
import Article from './Article.vue'
var read = require('node-read')
var app = require('remote').require('app')
var jetpack = require('fs-jetpack')
var useDataDir = jetpack.cwd(app.getPath("userData") + '/streams/')
var service = require('../helpers/services.js');

const {
  markRead,
  markUnread
} = store.actions

export default{
  route: {
    data({ to }){
      if(typeof to.params.feed != 'undefined'){
        this.title = to.params.feed
      }else {
        this.title = "All Articles"
      }
    }
  },
  components: {
    PulseLoader,
    'article-detail': Article
  },
  data(){
    return {
      title: "All Articles",
      id: '',
      articletitle: '',
      author: '',
      content: '',
      favicon: '',
      feed: '',
      pubDate: '',
      content: '',
      markedread:'',
      showModal: false,
      selected: []
    }
  },
  computed:{
    articles(){
      if(this.title !== "All Articles"){
        return _.where(store.state.articles, { 'feed': this.title });
      } else {
        return store.state.articles;
      }
    },
    options(){
      return store.state.tags
    }
  },
  methods:{
    articleDetail(id){
      var self = this;
      this.showModal = false
      return service.fetchOne(id).then(function(item){
          var data = jetpack.read(useDataDir.path(item.file))
          self.id = item._id
          self.articletitle = item.title;
          self.author = item.author;
          self.favicon = item.favicon;
          self.feed = item.feed;
          console.log(item.pubDate)
          self.pubDate = item.pubDate
          self.markedread = item.read
          read(data,function(err,article,res){
            self.content = article.content;
          });
      })
    },
    markRead(){
        markRead(this.id)
        this.markedread = true
    },
    markUnread(){
        markUnread(this.id)
        this.markedread = false
    },
    saveTags(id,selected){

    },
    showTag(){
      if(this.showModal){
        this.showModal = false
      } else {
        this.showModal = true
      }
    }
  }
}
</script>
