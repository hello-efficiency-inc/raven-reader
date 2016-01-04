<template>
  <div class="dashboard-header">
    <h2>{{ title }}</h2>
  </div>
  <div class="dashboard-articles">
    <ul class="articles">
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
  </div>
  <div class="dashboard-article-detail">
    <router-view></router-view>
  </div>
</template>
<script>
import store from '../store'

export default{
  route: {
    data({ to }){
      if(typeof to.params.feed != 'undefined'){
        this.title = to.params.feed
      }
    }
  },
  data(){
    return {
      title: "All Articles"
    }
  },
  computed:{
    articles(){
      if(this.title !== "All Articles"){
        return _.where(store.state.articles, { 'feed': this.title });
      } else {
        return store.state.articles;
      }
    }
  },
  methods:{
    articleDetail(id){
      return this.$route.router.go({path: '/article/' + id,replace: true})
    }
  }
}
</script>
