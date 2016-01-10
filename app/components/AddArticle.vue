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
  import jetpack from 'fs-jetpack'
  import store from '../store'
  import got from 'got'
  import _ from 'lodash'
  import online from 'is-online'
  const app = require('remote').require('app')
  const useDataDirFavicon = jetpack.cwd(app.getPath("userData") + '/favicons/')
  const useDataDirStream = jetpack.cwd(app.getPath("userData") + '/streams/')
  const randomstring = require("randomstring")

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
        processed: false
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
      addFeed(){
        var self = this;
        this.processed = true
        var articles = feed.fetchFeed(this.feedurl)
        articles.then(function(data){
          if(data === null){
            self.alert = true;
            self.alertmessage = "Sorry. I couldn't figure out any RSS feed on this address. Try to find link to RSS feed on that site by yourself and paste it here.";
            self.processed = false
          } else {
            self.alert = false;
            var meta_data = data.meta
            var articles = data.articles
            service.checkFeed(meta_data.title,function(count){
              if(count === 0){
                var icon = favicon.fetchIcon(data.meta.link).then(function(data){
                  var path = useDataDirFavicon.path(randomstring.generate() + '.' + data.format);
                  useDataDirFavicon.writeAsync(path,data.bytes);
                  meta_data.favicon = path;
                  meta_data.count = articles.length
                  addFeed(meta_data);
                  articles.map(function(item){
                    var html_filename = randomstring.generate() + '.html';
                    item.feed = meta_data.title;
                    item.file = html_filename;
                    item.read = false;
                    item.favicon = path;
                    got.stream(item.link).pipe(useDataDirStream.createWriteStream(html_filename))
                    return item;
                  })
                  addArticles(articles);
                })
              } else {
                console.log("Feed Exists");
                self.processed = false
              }
            })
            self.processed = false
            return self.$route.router.go({path: '/',replace: true})
          }
        },function(err){
          self.processed = false
          self.alert = true;
          self.alertmessage = "Sorry. Unfortunately this website is not supported.";
        });
      }
    }
  }
  </script>
