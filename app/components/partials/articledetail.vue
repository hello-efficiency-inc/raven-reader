<template>
  <div class="manage-article" v-if="articledetails">
    <div class="edit-article-tags">
      <button type="button" v-on:click="showTag()" class="toggle-tag-editor">
        <i class="fa fa-fw fa-tag"></i>
        Edit tags
      </button>
      <div v-if="showModal" class="tags-dropdown">
        <multiselect :options="taggingOptions" :selected="taggingSelected" :multiple="true" :searchable="true" :on-tag="addArticleTag" :taggable="true" tag-placeholder="Add new tag" placeholder="Add tag" :on-change="updateArticleTag" :limit="3" :show-labels="true" label="name" key="code">
          <br/>
        <button type="button" class="btn-block" v-on:click="saveTags(id,selected)">Save</button>
      </div>
    </div>
    <button v-if="!articledetails.read" v-on:click="markAsRead(article.id, article.feed_id)" type="button" class="toggle-tag-editor">
      <i class="fa fa-fw fa-check"></i>
      Mark as read
    </button>
    <button v-if="articledetails.read" v-on:click="markAsUnread(article.id, article.feed_id)" type="button" class="toggle-tag-editor">
      <i class="fa fa-fw fa-history"></i>
      Mark as unread
    </button>
    <button v-if="!articledetails.favourite" type="button" v-on:click="favourite(article.id)" class="toggle-tag-editor">
      <i class="fa fa-fw fa-star-o"></i>
      Favourite
    </button>
    <button v-if="articledetails.favourite" type="button" v-on:click="unFavourite(article.id)" class="toggle-tag-editor">
      <i class="fa fa-fw fa-star"></i>
      Favourited
    </button>
    <button v-on:click="openInBrowser(article.link)" type="button" class="toggle-tag-editor">
      <i class="fa fa-fw fa-globe"></i>
      Open in Browser
    </button>
  </div>
  <div v-if="articledetails" class="article-read">
    <h3>{{ articledetails.title }}</h3>
    <p class="source-provider"><img v-if="articledetails.favicon !== null" v-bind:src="item.favicon" width="20" height="20"> {{ articledetails.feed }} <span class="pubDate">{{ articledetails.pubDate }}</span></p>
    {{{ articledetails.content }}}
  </div>
  <div v-if="articledetails.content === null" class="v-spinner">
    Nothing selected
  </div>
</template>
<script>
import {shell} from 'electron'
import {incrementCount, decrementCount, markRead, markUnread, favouriteArticle, unFavouriteArticle, addTag, updateTag} from '../../vuex/actions'

export default {
  vuex: {
    getters: {
      tags: state => state.tags
    },
    actions: {
      incrementCount,
      decrementCount,
      markRead,
      markUnread,
      favouriteArticle,
      unFavouriteArticle,
      addTag,
      updateTag
    }
  },
  props: ['articledetails'],
  computed: {
    setTags () {
      this.taggingOptions = this.tags
    }
  },
  data () {
    return {
      showModal: false,
      taggingOptions: [],
      taggingSelected: [],
      article: null
    }
  },
  ready () {
    this.extractArticleContent(this.articledetails)
  },
  methods: {
    extractArticleContent (details) {
      console.log(details)
    },
    updateArticleTag (value) {
      this.updateTag(this.article.id, value)
    },
    addArticleTag (newTag) {
      const tag = {
        name: newTag,
        code: newTag.substring(0, 2) + Math.floor((Math.random() * 10000000))
      }
      this.addTag(this.article.id, tag)
      this.taggingOptions.push(tag)
      this.taggingSelected.push(tag)
    },
    showTag () {
      this.showModal = !this.showModal
    },
    openInBrowser (link) {
      shell.openExternal(link)
    },
    favourite (id) {
      this.favouriteArticle(id)
      this.article.favourite = true
    },
    unFavourite (id) {
      this.unFavouriteArticle(id)
      this.article.favourite = false
    },
    markAsRead (id, feedId) {
      this.markRead(id)
      this.decrementCount(feedId)
      this.article.read = true
    },
    markAsUnread (id, feedId) {
      this.markUnread(id)
      this.incrementCount(feedId)
      this.article.read = false
    }
  }
}
</script>
