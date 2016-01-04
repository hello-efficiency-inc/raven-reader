<template>
  <div class="manage-article">
    <div class="edit-article-tags">
      <button type="button" class="toggle-tag-editor">
        <i class="fa fa-fw fa-tag"></i>
        Edit Tags
      </button>
    </div>
    <button type="button" class="toggle-tag-editor">
      <i class="fa fa-fw fa-check"></i>
      Mark as read
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
  var read = require('node-read')
  var app = require('remote').require('app')
  var jetpack = require('fs-jetpack')
  var useDataDir = jetpack.cwd(app.getPath("userData") + '/streams/')

  export default{
    route: {
      data({ to }){
        var self = this;
        return service.fetchOne(to.params.id).then(function(item){
            var data = jetpack.read(useDataDir.path(item.file))
            self.title = item.title;
            self.author = item.author;
            self.favicon = item.favicon;
            self.feed = item.feed;
            self.pubDate = item.pubDate
            read(data,function(err,article,res){
              self.content = article.content;
            });
        })
      }
    },
    data(){
      return {
        title: '',
        author: '',
        content: '',
        favicon: '',
        feed: '',
        pubDate: '',
        content: ''
      }
    }
  }
</script>
