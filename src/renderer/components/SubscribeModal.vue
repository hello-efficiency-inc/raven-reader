<template>
  <b-modal id="addfeed" ref="addFeedModal" hide-header :hide-footer="feeddata === null" size="lg" @shown="focusMyElement" centered @hidden="onHidden">
    <form v-on:submit.prevent="fetchFeed">
      <b-input-group size="md">
        <b-input-group-text slot="prepend">
          <strong>Add <feather-icon name="plus"></feather-icon></strong>
        </b-input-group-text>
        <b-input-group-text slot="append">
          <div class="bouncing-loader" v-if="loading">
            <div></div>
            <div></div>
            <div></div>
          </div>
          <div class="favicon-img" v-if="feeddata !== null && !loading">
            <img :src="feeddata.site.favicon" height="20">
          </div>
        </b-input-group-text>
        <b-form-input class="no-border" placeholder="Enter website or feed url" ref="focusThis" v-model="feed_url"></b-form-input>
      </b-input-group>
    </form>
    <div v-if="feeddata !== null" class="subscription-content col pt-3">
      <template v-for="(feed, index) in feeddata.feedUrls">
        <b-input-group size="md">
          <b-input-group-text slot="append">
            <b-form-checkbox v-model="selected_feed" :value="feed">
            </b-form-checkbox>
          </b-input-group-text>
          <b-form-input v-model="feed.title"></b-form-input>
        </b-input-group>
        <b-form-text id="inputLiveHelp" class="mb-3">
          {{ feed.url }}
        </b-form-text>
      </template>
    </div>
    <div slot="modal-footer">
      <button type="button" class="btn btn-secondary" @click="hideModal">Close</button>
      <button type="button" class="btn btn-primary" @click="subscribe">Subscribe</button>
    </div>
  </b-modal>
</template>
<script>
import finder from 'rss-finder'
import normalizeUrl from 'normalize-url'
import { parseFeed } from '../parsers/feed'
import he from 'he'
import uuid from 'uuid/v4'

export default {
  name: 'addfeed-modal',
  data () {
    return {
      feed_url: '',
      loading: false,
      feeddata: null,
      selected_feed: []
    }
  },
  methods: {
    fetchFeed () {
      this.loading = true
      finder(normalizeUrl(this.feed_url)).then((res) => {
        this.loading = false
        res.feedUrls.map((item) => {
          item.title = he.unescape(item.title)
          return item
        })
        if (res.feedUrls.length === 0) {
          this.feeddata = null
          this.$toast('No feed found', {
            className: 'et-alert',
            horizontalPosition: 'center'
          })
        } else {
          this.feeddata = res
        }
      })
    },
    focusMyElement (e) {
      this.$refs.focusThis.focus()
    },
    resetForm () {
      this.feed_url = ''
      this.feeddata = null
      this.url = ''
      this.selected_feed = []
      this.loading = false
    },
    hideModal () {
      this.resetForm()
      this.$refs.addFeedModal.hide()
    },
    subscribe () {
      const self = this
      const favicon = this.feeddata.site.favicon
      this.selected_feed.forEach(async function (feed) {
        const feeditem = await parseFeed(feed.url)
        feeditem.meta.favicon = favicon
        feeditem.meta.id = uuid()
        self.$store.dispatch('addFeed', feeditem.meta)
        feeditem.posts.forEach((post) => {
          post.feed_id = feeditem.meta.id
          post.meta.favicon = post.meta.favicon ? post.meta.favicon : favicon
          self.$store.dispatch('addArticle', post)
        })
      })
      this.hideModal()
    },
    onHidden () {
      this.resetForm()
    }
  }
}
</script>
<style lang="scss">
#addfeed {
  form {
    background: #f4f6f8;
    padding: 0.8rem;
  }

  .modal-body {
    padding: 0rem;
  }
  .input-group-text {
    background: transparent;
    border: 0;
  }
  .no-border {
    border: 0;
    background: #f4f6f8;

    &:focus {
      outline: 0;
      box-shadow: none;
    }
  }
}

@keyframes bouncing-loader {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0.1;
    transform: translateY(-1rem);
  }
}
.bouncing-loader {
  display: flex;
  justify-content: center;
}
.bouncing-loader > div {
  width: 0.4rem;
  height: 0.4rem;
  margin: 1rem 0rem;
  background: #000;
  border-radius: 50%;
  animation: bouncing-loader 0.6s infinite alternate;
}
.bouncing-loader > div:nth-child(2) {
  animation-delay: 0.2s;
}
.bouncing-loader > div:nth-child(3) {
  animation-delay: 0.4s;
}

.favicon-img {
  display: flex;
  justify-content: center;
}

.subscription-content {
  background: #fff;
  border-top: 1px solid #f4f6f8;
}
</style>
