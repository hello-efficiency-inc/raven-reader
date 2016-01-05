<template>
  <div class="manage-article">
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
  <div class="article-read">
    <h3>{{ title }}</h3>
    <p class="source-provider"><img v-bind:src="favicon" width="20" height="20"> {{ feed }} <span class="pubDate">{{ pubDate }}</span></p>
    {{{ content }}}
  </div>
</template>
<script>
  var service = require('../helpers/services.js');
  var store = require('../store.js')
  var read = require('node-read')
  var app = require('remote').require('app')
  var jetpack = require('fs-jetpack')
  var useDataDir = jetpack.cwd(app.getPath("userData") + '/streams/')

  const {
    markRead,
    markUnread
  } = store.actions

  export default{
    route: {
      data({ to }){
        var self = this;
         this.showModal = false
        return service.fetchOne(to.params.id).then(function(item){
            var data = jetpack.read(useDataDir.path(item.file))
            self.id = item._id
            self.title = item.title;
            self.author = item.author;
            self.favicon = item.favicon;
            self.feed = item.feed;
            self.pubDate = item.pubDate
            self.markedread = item.read
            read(data,function(err,article,res){
              self.content = article.content;
            });
        })
      }
    },
    data(){
      return {
        id: '',
        title: '',
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
    computed: {
      options(){
        return store.state.tags
      }
    },
    methods: {
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
