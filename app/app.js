const app = require('remote').require('app')
const jetpack = require('fs-jetpack').cwd(app.getAppPath())
const fs = require('fs')
const useDataDir = jetpack.cwd(app.getPath("userData"))
const $ = require('jquery')
const select2 = require('select2')
import Vue from 'vue'
import Router from 'vue-router'
import App from './components/App.vue'
import Main from './components/Main.vue'
import AddArticle from './components/AddArticle.vue'
import Article from './components/Article.vue'
import ManageFeed from './components/ManageFeed.vue'
import Tag from './components/Tag.vue'
import store from './store'

// Check if directory for storing article exists or not
var dirYes = jetpack.exists(useDataDir.path('streams'))
var dirFavi = jetpack.exists(useDataDir.path('favicons'))

if(!dirYes){
  fs.mkdir(useDataDir.path('streams'))
}
if(!dirFavi){
  fs.mkdir(useDataDir.path('favicons'))
}

Vue.directive('select', {
  twoWay: true,
  priority: 1000,

  params: ['options'],

  bind: function () {

    var self = this
    $(this.el)
      .select2({
      	multiple:true,
        tags: true,
        data: this.params.options
      })
      .on('change', function () {
        self.set(_.pluck($(this).select2('data'),'text'))
      })
  },
  update: function (value) {
    $(this.el).val(value).trigger('change')
  },
  unbind: function () {
    $(this.el).off().select2('destroy')
  }
})

Vue.use(Router);

var router = new Router({
  hashbang:false,
  abstract:true
})

router.map({
  '/:type/:name':{
    component: Main
  },
  '/tags/':{
    component: Tag
  },
  '/article/add':{
    component: AddArticle
  },
  '/manage/feeds':{
    component: ManageFeed
  },
  '/':{
    component: Main
  },

})

store.actions.getFeed()
store.actions.getArticles()
store.actions.getTags()

router.start(App,'#app')
