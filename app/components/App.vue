<template>
  <div class="dashboard">
    <div class="dashboard-sidebar">
      <div class="sidebar-header">
        <h3 class="sidebar-header-text">Articles</h3>
      </div>
      <ul class="dashboard-list">
        <li class="dashboard-list-item" v-on:click="allArticles()">
          <i class="fa fa-fw fa-list"></i> All Articles
        </li>
        <li class="dashboard-list-item" v-on:click="tags()">
          <i class="fa fa-fw fa-tags"></i> Tags
        </li>
        <li class="dashboard-list-item" v-on:click="readArticles()">
          <i class="fa fa-fw fa-check"></i> Read Articles
        </li>
        <li class="dashboard-list-item" v-on:click="unreadArticles()">
          <i class="fa fa-fw fa-history"></i> Unread Articles
        </li>
      </ul>
      <div class="sidebar-header">
        <h3 class="sidebar-header-text">Feeds</h3>
        <button v-on:click="addFeed()" class="btn-add-feed" type="button"><i class="fa fa-plus"></i></button>
      </div>
      <ul class="dashboard-list">
        <li v-on:click="goFeed(feed.orgtitle ? feed.orgtitle : feed.title)" v-for="feed in feeds" class="dashboard-list-item">
          <img v-if="feed.favicon !== null" v-bind:src="feed.favicon" width="20" height="20" alt="{{ feed.title }}"/>
          <i class="fa fa-fw fa-rss" v-if="feed.favicon === null"></i>
          {{ feed.title }}
          <span class="tagged-count">{{ feed.count }}</span>
        </li>
      </ul>
    </div>
    <router-view></router-view>
  </div>
</template>
<script>
import store from '../store'
import string from 'underscore.string'

export default{
  computed: {
    feeds(){
      return store.state.feeds.map(function(item){
        if(item.title.length >= 20){
          item.orgtitle = item.title
        }
        item.title = string.prune(item.title,20)
        return item
      })
    }
  },
  methods: {
    allArticles(){
      return this.$route.router.go({path: '/',replace: true})
    },
    tags(){
      return this.$route.router.go({path: '/tags',replace: true})
    },
    unreadArticles(){
      return this.$route.router.go({path: '/article/unread' });
    },
    readArticles(){
      return this.$route.router.go({path: '/article/read' });
    },
    goFeed(title){
      return this.$route.router.go({path: '/feed/' + title })
    },
    addFeed(){
      return this.$route.router.go({path:'/article/add' ,replace: true})
    }
  }
}
</script>
