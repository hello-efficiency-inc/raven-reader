<template>
  <div>
    <div class="dashboard-header">
      <div class="dashboard-content">
        <h2>{{ feedtitle }}</h2>
        <div class="manage-feed" v-if="state === 'feed'" v-on:click="deleteFeed(title)">
          <i class="fa fa-fw fa-trash-o" aria-hidden="true"></i>
        </div>
        <label for="searchbar">
          <input type="text" id="searchbar" class="telescope" placeholder="Search" v-model="searchQuery">
          <i class="fa fa-search"></i>
        </label>
      </div>
    </div>
    <div class="dashboard-articles">
      <ul v-if="getArticles.length > 0" class="articles">
        <li class="article" v-for="article in getArticles | filterBy searchQuery in 'title' 'summary' 'tags'" @click="articleDetail(article)">
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
    </div>
    <div class="dashboard-article-detail">
      <div class="manage-article" v-if="content">
        <div class="edit-article-tags">
          <!-- <button type="button" v-on:click="showTag()" class="toggle-tag-editor">
            <i class="fa fa-fw fa-tag"></i>
            Edit tags
          </button>
          <div v-if="showModal" class="tags-dropdown">
            <multiselect :options="taggingOptions" :selected="taggingSelected" :multiple="true" :searchable="true" :on-tag="addArticleTag" :taggable="true" tag-placeholder="Add new tag" placeholder="Add tag" :on-change="updateArticleTag" :limit="3" :show-labels="true" label="name" key="code">
              <br/>
            <button type="button" class="btn-block" v-on:click="saveTags(id,selected)">Save</button>
          </div> -->
        </div>
        <button v-if="!markedread" v-on:click="markAsRead()" type="button" class="toggle-tag-editor">
          <i class="fa fa-fw fa-check"></i>
          Mark as read
        </button>
        <button v-if="markedread" v-on:click="markAsUnread()" type="button" class="toggle-tag-editor">
          <i class="fa fa-fw fa-history"></i>
          Mark as unread
        </button>
        <button v-if="!favourited" type="button" v-on:click="favourite()" class="toggle-tag-editor">
          <i class="fa fa-fw fa-star-o"></i>
          Favourite
        </button>
        <button v-if="favourited" type="button" @click="unFavourite()" class="toggle-tag-editor">
          <i class="fa fa-fw fa-star"></i>
          Favourited
        </button>
        <button @click="openInBrowser()" type="button" class="toggle-tag-editor">
          <i class="fa fa-fw fa-globe"></i>
          Open in Browser
        </button>
      </div>
      <articledetail :articletitle='title' :link='link' :feed='feed' :pubdate='pubDate' :content='content' :favicon='favicon' v-if='content'></articledetail>
      <div class="v-spinner" v-if="!content">Nothing selected</div>
    </div>
  </div>
</template>
<script>
import { incrementCount, decrementCount, markRead, markUnread, favouriteArticle, unFavouriteArticle, addTag, updateTag, removeFeed, removeArticle } from '../../vuex/actions'
import {shell, remote} from 'electron'
import jetpack from 'fs-jetpack'
import _ from 'lodash'
import moment from 'moment'
import read from 'node-read'
import refresh from '../../helpers/refresh.js'
const useDataDir = jetpack.cwd(remote.app.getPath('userData') + '/streams/')

export default {
  vuex: {
    getters: {
      feeds: state => state.feeds,
      articles: state => state.articles,
      tags: state => state.tags,
      offline: state => state.offline
    },
    actions: {
      incrementCount,
      decrementCount,
      markRead,
      markUnread,
      favouriteArticle,
      unFavouriteArticle,
      addTag,
      updateTag,
      removeFeed,
      removeArticle
    }
  },
  route: {
    data ({ to }) {
      if (to.params.type === 'feed') {
        this.feedtitle = to.params.name
        this.state = 'feed'
      } else if (to.params.type === 'article' && to.params.name === 'read') {
        this.state = 'read'
        this.feedtitle = 'Read Articles'
      } else if (to.params.type === 'article' && to.params.name === 'unread') {
        this.state = 'unread'
        this.feedtitle = 'Unread Articles'
      } else if (to.params.type === 'article' && to.params.name === 'favourites') {
        this.state = 'favourites'
        this.feedtitle = 'Favourites'
      } else {
        this.feedtitle = 'All Articles'
        this.state = 'all'
      }
    }
  },
  data () {
    return {
      queryData: '',
      articleItem: '',
      id: '',
      count: '',
      feedtitle: '',
      title: '',
      feed: '',
      feed_id: '',
      state: '',
      content: '',
      link: '',
      pubDate: '',
      markedread: '',
      favourited: '',
      taggingOptions: [],
      taggingSelected: [],
      showModal: false
    }
  },
  created () {
    setInterval(this.refreshFeed, 70000)
  },
  computed: {
    getFeed () {
      if (this.state === 'feed') {
        let foundfeed = _.filter(this.feeds, { 'title': this.feedtitle })
        return foundfeed[0]
      }
    },
    getArticles () {
      let articlesdata
      if (this.state === 'feed') {
        let foundarticle = _.filter(this.articles, { 'feed': this.feedtitle })
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
    deleteFeed (title) {
      let self = this
      self.removeFeed(this.getFeed._id)
      this.getArticles.forEach(item => {
        jetpack.remove(useDataDir.path(item.file))
        self.removeArticle(item._id)
      })
      this.content = ''
      this.title = ''
      return this.$route.router.go({path: '/', replace: true})
    },
    articleDetail (item) {
      let self = this
      this.showModal = false
      let data = jetpack.read(useDataDir.path(item.file))
      this.id = item._id
      this.title = item.title
      console.log(item.favicon)
      this.favicon = item.favicon
      this.feed = item.feed
      this.feed_id = item.feed_id
      this.pubDate = item.pubDate
      this.link = item.link
      this.markedread = item.read
      this.favourited = item.favourite
      this.taggingSelected = item.tags
      read(data, (err, article, res) => {
        if (err) {}
        self.content = article.content
      })
    },
    updateArticleTag (value) {
      this.updateTag(this.id, value)
    },
    addArticleTag (newTag) {
      const tag = {
        name: newTag,
        code: newTag.substring(0, 2) + Math.floor((Math.random() * 10000000))
      }
      this.addTag(this.id, tag)
      this.taggingOptions.push(tag)
      this.taggingSelected.push(tag)
    },
    showTag () {
      this.showModal = !this.showModal
    },
    openInBrowser () {
      shell.openExternal(this.link)
    },
    favourite (id) {
      this.favouriteArticle(this.id)
      this.favourited = true
    },
    unFavourite (id) {
      this.unFavouriteArticle(this.id)
      this.favourited = false
    },
    markAsRead () {
      this.markRead(this.id)
      this.decrementCount(this.feed_id)
      this.markedread = true
    },
    markAsUnread () {
      this.markUnread(this.id)
      this.incrementCount(this.feed_id)
      this.markedread = false
    },
    refreshFeed () {
      if (!this.offline) {
        refresh.refreshfeed(this.feedtitle).then(() => {
        })
      }
    }
  }
}
</script>
