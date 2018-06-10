<template>
  <div class="app-wrapper">
    <nav class="bg-light sidebar">
      <div class="subscribe-toolbar">
        <button class="btn btn-subscribe" v-b-modal.addfeed>
          <svg class="feather">
            <use xlink:href="static/feather-sprite.svg#plus"/>
          </svg>
          Add
        </button>
        <b-modal id="addfeed" ref="addFeedModal" hide-header :hide-footer="!feeddata" size="lg" @shown="focusMyElement" centered @hidden="onHidden">
          <form v-on:submit.prevent="fetchFeed">
          <b-input-group size="md">
            <b-input-group-text slot="prepend">
              <strong>Add <svg class="feather">
                <use xlink:href="static/feather-sprite.svg#plus"/>
              </svg></strong>
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
          <div v-if="feeddata" class="subscription-content col pt-3">
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
      </div>
      <div class="sidebar-sticky">
        <ul class="nav flex-column">
          <li class="nav-item">
            <a class="nav-link" href="#">
              <svg class="feather">
                <use xlink:href="static/feather-sprite.svg#list"/>
              </svg>
              All Feeds <span class="sr-only">(current)</span>
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#">
              <svg class="feather">
                <use xlink:href="static/feather-sprite.svg#star"/>
              </svg>
              Favourites
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#">
              <svg class="feather">
                <use xlink:href="static/feather-sprite.svg#archive"/>
              </svg>
              Archives
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#">
              <svg class="feather">
                <use xlink:href="static/feather-sprite.svg#circle"/>
              </svg>
              Unread Articles
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#">
              <svg class="feather feather-filled">
                <use xlink:href="static/feather-sprite.svg#circle"/>
              </svg>
              Recently Read
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#">
              <svg class="feather">
                <use xlink:href="static/feather-sprite.svg#settings"/>
              </svg>
              Settings
            </a>
          </li>
        </ul>
        <h6 class="sidebar-heading d-flex justify-content-between align-items-center px-3 mt-4 mb-1 text-muted">
          <span>Categories</span>
          <a class="d-flex align-items-center text-muted" href="#">
            <svg class="feather">
              <use xlink:href="static/feather-sprite.svg#plus-circle"/>
            </svg>
          </a>
        </h6>
        <h6 class="sidebar-heading d-flex justify-content-between align-items-center px-3 mt-4 mb-1 text-muted">
          <span>Subscriptions</span>
          <a class="d-flex align-items-center text-muted" href="#">
            <svg class="feather">
              <use xlink:href="static/feather-sprite.svg#plus-circle"/>
            </svg>
          </a>
        </h6>
      </div>
    </nav>
    <div class="articles-list">
      <div class="articles-inner">
        <form class="search-form">
          <div class="search-input input-group mb-0">
            <div class="input-group-prepend">
              <span class="input-group-text" id="basic-addon1">
                <svg class="feather">
                  <use xlink:href="static/feather-sprite.svg#search"/>
                </svg>
              </span>
            </div>
            <input type="text" class="form-control" placeholder="Search" aria-label="Search" aria-describedby="basic-addon1">
          </div>
        </form>
        <div class="articles">
          <div class="list-group">
            <a href="#" class="list-group-item list-group-item-action flex-column align-items-start">
              <div class="d-flex w-100 justify-content-between mb-3">
                <small><img src="https://techcrunch.com/wp-content/uploads/2015/02/cropped-cropped-favicon-gradient.png?w=32" width="16" height="16"> Techcrunch</small>
                <small>3 days ago</small>
              </div>
              <h6><strong>Looks like macOS 10.14 will have a new dark mode and an Apple News app</strong></h6>
              <p class="mb-1">Donec id elit non mi porta gravida at eget metus. Maecenas sed diam eget risus varius blandit.</p>
            </a>
            <a href="#" class="list-group-item list-group-item-action flex-column align-items-start">
              <div class="d-flex w-100 justify-content-between mb-3">
                <small><img src="https://techcrunch.com/wp-content/uploads/2015/02/cropped-cropped-favicon-gradient.png?w=32" width="16" height="16"> Techcrunch</small>
                <small>3 days ago</small>
              </div>
              <h6><strong>Looks like macOS 10.14 will have a new dark mode and an Apple News app</strong></h6>
              <p class="mb-1">Donec id elit non mi porta gravida at eget metus. Maecenas sed diam eget risus varius blandit.</p>
            </a>
            <a href="#" class="list-group-item list-group-item-action flex-column align-items-start">
              <div class="d-flex w-100 justify-content-between mb-3">
                <small><img src="https://techcrunch.com/wp-content/uploads/2015/02/cropped-cropped-favicon-gradient.png?w=32" width="16" height="16"> Techcrunch</small>
                <small>3 days ago</small>
              </div>
              <h6><strong>Looks like macOS 10.14 will have a new dark mode and an Apple News app</strong></h6>
              <p class="mb-1">Donec id elit non mi porta gravida at eget metus. Maecenas sed diam eget risus varius blandit.</p>
            </a>
          </div>
        </div>
      </div>
    </div>
    <div class="article-detail px-5">
      <div class="content-wrapper">
        <div class="article-toolbar">
          <div class="article-buttons">
            <div class="wrap">
              <button class="btn btn-toolbar">
                <svg class="feather">
                  <use xlink:href="static/feather-sprite.svg#star"/>
                </svg>
              </button>
            </div>
            <div class="wrap">
              <button class="btn btn-toolbar">
                <svg class="feather">
                  <use xlink:href="static/feather-sprite.svg#circle"/>
                </svg>
              </button>
            </div>
            <div class="wrap">
              <button class="btn btn-toolbar">
                <svg class="feather">
                  <use xlink:href="static/feather-sprite.svg#external-link"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
        <div class="article-content">
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import finder from 'rss-finder'
import normalizeUrl from 'normalize-url'
import { parseFeed } from '../parsers/feed'

export default {
  name: 'dashboard',
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
        this.feeddata = res
      })
    },
    focusMyElement (e) {
      this.$refs.focusThis.focus()
    },
    resetForm () {
      this.feed_url = ''
      this.feeddata = null
      this.url = ''
      this.loading = false
    },
    hideModal () {
      this.resetForm()
      this.$refs.addFeedModal.hide()
    },
    subscribe () {
      console.log(this.selected_feed)
      this.selected_feed.forEach(async function (feed) {
        const posts = await parseFeed(feed.url)
        console.log(posts)
      })
    },
    onHidden () {
      this.resetForm()
    }
  }
}
</script>
<style lang="scss">
.app-wrapper {
  display: flex;
  height: 100%;
  align-items: flex-start;
}

.articles-inner {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow:hidden;
}

.search-form {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  margin: 0;
  border-bottom: 1px solid transparent;
  border-color: #dcdee0;
  background-color: #FFFFFF;
  height: 41px;
}

.articles-list {
  position: relative;
  flex-grow: 0;
  width: 350px;
  border-right: 1px solid rgba(0, 0, 0, 0.1);
  height: 100%;
}

.articles-list:after {
  content: '';
  position: absolute;
  bottom: 0;
  width: 100%;
  height: 25px;
  background: linear-gradient(
  rgba(255, 255, 255, 0.001),
  white
  ); /* transparent keyword is broken in Safari */
  pointer-events: none;
}

.articles {
  position: absolute;
  top: 41px;
  bottom: 0;
  left: 0;
  right: 0;
  overflow-y: auto;
  background: #fff;
  overflow-x: hidden;
}

.search-input {
  position: absolute;
  top: 0;
  bottom: 0;
}

.search-form {
  .form-control {
    border-radius: 0;
    border: 0;

    &:focus {
      box-shadow: none;
      outline: 0;
    }
  }
}

.search-input .input-group-text {
  background: none;
  border: 0;
}

.article-detail {
  position: relative;
  flex-grow: 1;
  height: 100%;

  &::after {
    content: '';
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 30px;
    background: linear-gradient(
    rgba(255, 255, 255, 0.001),
    white
    ); /* transparent keyword is broken in Safari */
    pointer-events: none;
    z-index: 3;
  }
}

.content-wrapper {
  overflow: hidden;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
}

.article-toolbar {
  display: flex;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 3;
  width: 100%;
  border-bottom: 1px solid #e3e3e3;
  height: 41px;
}

.article-buttons {
  display: block;
  position: absolute;
  top: 0;
  right:0 ;
  width: 270px;
  height: 40px;
  z-index: 1;
  background-image: linear-gradient(to right, rgba(255,255,255,0) 0%, #fff 10%);

  .wrap {
    float: right;
  }
}

.article-content {
  background-color: #fff;
  display: block;
  position: absolute;
  height: auto;
  bottom: 0;
  left: 0;
  right: 0;
  top: 41px;
  margin: 0;
  overflow-x: hidden;
  overflow-y: auto;
  z-index: 2;
  padding: 15px;
}

.btn-toolbar {
  display: block;
  z-index: 2;
  background: transparent;
  border: none;
  border-radius: 0;
  width: 44px;
  height: 40px;
  padding: 0;
  position: relative;
}

.subscribe-toolbar {
  height: 41px;
  border-bottom: 1px solid #e3e3e3;
}

.btn-subscribe {
  border-radius: 0;
  user-select: none;
  line-height: 41px;
  cursor: pointer;
  position: relative;
  display: block;
  width: 100%;
  text-align:left;
  padding: 0 0 0 16px;
  background: transparent;
  color: #3399FF;
  font-weight: 700;

  &:focus {
    outline: 0;
    box-shadow: none;
  }

  .feather {
    margin-right: 5px;
  }
}

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
