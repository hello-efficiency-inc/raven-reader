<template>
  <div class="dashboard-header">
    <h2>{{ title }} </h2>
    <div v-if="state != 'tag'" v-on:click="refreshFeed()" class="settings-trigger refresh" dropdown>
      <i class="fa fa-refresh fa-fw"></i>
    </div>
    <label for="searchbar">
      <input type="text" id="searchbar" class="telescope" placeholder="Search" v-model="searchQuery">
      <i class="fa fa-search"></i>
    </label>
    <div class="manage-feed" v-on:click="manageFeed()">
      <i class="fa fa-fw fa-cog"></i> Manage feeds
    </div>
  </div>
  <div class="dashboard-articles">
    <ul v-if="articles.length > 0 && refreshing == false" class="articles">
      <li :class="{ readed : article.read }" v-for="article in articles | filterBy searchQuery in 'title' 'summary' 'tags'" class="article" v-on:click="articleDetail(article._id)">
        <h3>{{ article.title }}</h3>
        <div class="provider">
          <img v-bind:src="article.favicon" width="15" height="15" alt={{ article.title }}> {{ article.feed }} <span class="published-date">{{ article.pubDate }}</span>
        </div>
        <div class="description">
          {{ article.summary }}
        </div>
        <ul class="article-tags">
          <li v-for="tag in article.tags" v-on:click="setTag(tag)">{{ tag.text }}</li>
        </ul>
      </li>
    </ul>
    <div class="v-spinner" v-if="articles.length == 0">No feeds available</div>
    <pulse-loader v-if="refreshing"></pulse-loader>
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
import refresh from '../helpers/refresh.js'
var read = require('node-read')
var app = require('remote').require('app')
var jetpack = require('fs-jetpack')
var useDataDir = jetpack.cwd(app.getPath("userData") + '/streams/')
var service = require('../helpers/services.js');
var moment = require('moment')

const {
  markRead,
  markUnread,
  updateTag
} = store.actions

export default{
  route: {
    data({ to }){
      console.log(to.params.name)
      if(to.params.type === "feed"){
        this.title = to.params.name
        this.state = 'feed'
      }
      else if(to.params.type === "tag"){
        this.state = 'tag'
        this.title = to.params.name
      }
      else if(to.params.type === "article" && to.params.name === "read"){
        this.state = 'read'
        this.title = "Read Articles"
      }
      else if(to.params.type === "article" && to.params.name === "unread"){
        this.state = "unread"
        this.title = "Unread Articles"
      }
      else {
        this.title = "All Articles"
        this.state = "all"
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
      refreshing: false,
      selected: [],
      state: ''
    }
  },
  computed:{
    articles(){
      var articles;
      if(this.state === "feed" ){
        var foundarticle = _.where(store.state.articles, { 'feed': this.title });
        articles = _.sortByOrder(foundarticle,'pubDate','desc');
      }
      else if(this.state === "tag"){
        var tag = _.where(store.state.tags,{ 'text': this.title })
        articles = _.where(store.state.articles, { 'tags' : [tag[0]] })
      }
      else if(this.state === "read"){
        articles = _.where(store.state.articles,{ 'read' : true })
      }
      else if(this.state === "unread"){
        articles = _.where(store.state.articles,{ 'read' : false })
      }
      else {
        articles = store.state.articles
      }
      return articles.map(function(item){
        var checkValid = moment(item.pubDate,"MMMM Do YYYY",true).isValid();
        if(!checkValid){
          item.pubDate = moment.unix(item.pubDate).format("MMMM Do YYYY")
        }
        return item
      });
    },
    offline(){
      return store.state.offline
    },
    options(){
      return store.state.tags
    }
  },
  ready(){

    setTimeout(function(){
      store.actions.checkOffline()
    },1000)

    if(this.offline){
      setTimeout(function(){
        refresh.refreshfeed(this.title)
      },900000)
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
        self.pubDate = moment.unix(item.pubDate).format("MMMM Do YYYY")
        self.markedread = item.read
        if(!item.read){
            self.markedread = true
            markRead(id)
        } else {
          self.markedread = item.read
        }
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
      var self = this;
      updateTag(this.id,this.selected)
      this.showModal = false
    },
    showTag(){
      if(this.showModal){
        this.showModal = false
      } else {
        var self = this;
        service.fetchOne(this.id).then(function(item){
          self.selected = _.pluck(item.tags,'id')
        })
        this.showModal = true
      }
    },
    setTag(item){
      return this.$route.router.go({ path: '/tag/' + item.text })
    },
    manageFeed(){
      return this.$route.router.go({ path: '/manage/feeds' })
    },
    refreshFeed(){
      var self = this;
      this.refreshing = true;
      if(this.offline){
        refresh.refreshfeed(this.title).then(function(){
          self.refreshing = false;
        });
      } else {
        alert("You need to be online in order to perform this action.")
      }
    }
  }
}
</script>
