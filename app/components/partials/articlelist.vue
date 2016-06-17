<template>
  <ul v-if="getArticles.length > 0" class="articles">
    <li @click="setArticle(article)" class="article" v-for="article in getArticles | filterBy filterquery in 'title' 'summary' 'tags'">
      <h3>{{ article.title }}</h3>
      <div class="provider">
        <img v-if="article.favicon" v-bind:src="article.favicon" height="15"><i v-if="article.favicon === null" class="fa fa-fw fa-rss"></i> <span class="published-date">{{ article.pubDate }}</span>
      </div>
      <div class="description">
        {{ article.summary }}
      </div>
      <ul class="article-tags" v-if="article.tags.length > 0">
        <li v-for="item in article.tags" v-on:click="setTag(tag)">
          {{ item.name }}
        </li>
      </ul>
    </li>
  </ul>
  <div class="v-spinner" v-if="getArticles.length == 0">No feeds available</div>
</template>
<script>
import moment from 'moment'
import read from 'node-read'
import jetpack from 'fs-jetpack'
import _ from 'lodash'
import {remote} from 'electron'
const useDataDir = jetpack.cwd(remote.app.getPath('userData') + '/streams/')

export default {
  vuex: {
    getters: {
      articles: state => state.articles
    }
  },
  props: ['filterquery', 'state', 'title', 'selectedarticle'],
  computed: {
    getArticles () {
      let articlesdata
      if (this.state === 'feed') {
        let foundarticle = _.filter(this.articles, { 'feed': this.title })
        articlesdata = _.sortBy(foundarticle, ['pubDate', 'desc'])
      } else if (this.state === 'read') {
        let readarticles = _.filter(this.articles, { 'read': true })
        articlesdata = _.sortBy(readarticles, ['pubDate', 'desc'])
      } else if (this.state === 'unread') {
        let unreadarticles = _.filter(this.articles, { 'read': false })
        articlesdata = _.sortBy(unreadarticles, ['pubDate', 'desc'])
      } else if (this.state === 'favourites') {
        let favouritedarticles = _.filter(this.articles, { 'favourite': true })
        articlesdata = _.sortBy(favouritedarticles, ['pubDate', 'desc'])
      } else {
        articlesdata = this.articles
      }
      return articlesdata.map(item => {
        let checkValid = moment(item.pubDate, 'MMMM Do YYYY', true).isValid()
        if (!checkValid) {
          item.pubDate = moment.unix(item.pubDate).format('MMMM Do YYYY')
        }
        return item
      })
    }
  },
  methods: {
    setArticle (item) {
      var data = jetpack.read(useDataDir.path(item.file))
      var content
      read(data, function (err, article, res) {
        if (err) {}
        content = article.content
      })
      item.content = content
      this.selectedarticle = item
    }
  }
}
</script>
