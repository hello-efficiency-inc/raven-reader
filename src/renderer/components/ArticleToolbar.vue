<template>
  <div class="article-toolbar" v-if="article !== null && article.content !== null">
    <div class="site-info">
      <div class="wrap">
        <button class="btn btn-toolbar">
          <span v-if="article.favicon" class="favicon-wrap">
            <img :src="article.favicon" width="16" height="16">
          </span>
          <span :class="{ 'ml-4': article.favicon }">{{ article.sitetitle }}</span>
        </button>
      </div>
    </div>
    <div class="article-buttons">
      <div class="wrap">
        <button class="btn btn-toolbar" @click="markFavourite" v-b-tooltip.hover :title="markFavouriteButton">
          <feather-icon name="star" :filled="article.favourite"></feather-icon>
        </button>
      </div>
      <div class="wrap">
        <button class="btn btn-toolbar" @click="markRead" v-b-tooltip.hover :title="markReadButton">
          <feather-icon name="circle" :filled="article.read"></feather-icon>
        </button>
      </div>
      <div class="wrap">
        <a :href="article.url" class="btn btn-toolbar js-external-link" v-b-tooltip.hover title="Open in browser" ref="openlink">
          <feather-icon name="external-link"></feather-icon>
        </a>
      </div>
      <div class="wrap">
        <button class="btn btn-toolbar" @click="saveArticle" v-b-tooltip.hover title="Save article" ref="saveoffline">
          <feather-icon name="wifi-off" :success="article.offline"></feather-icon>
        </button>
      </div>
      <div class="wrap">
        <b-dropdown variant="link" no-caret toogle-class="btn-toolbar">
          <template slot="button-content" class="pt-1">
            <feather-icon name="share-2"></feather-icon>
          </template>
          <b-dropdown-item href="#" v-if="pocket_connected" @click="saveToPocket(article.url)">
                Pocket
            </b-dropdown-item>
          <b-dropdown-item href="#">
              <social-sharing :url="article.url" inline-template>
                <network network="email">
                  Email
                </network>
              </social-sharing>
            </b-dropdown-item>
          <b-dropdown-item href="#">
              <social-sharing :url="article.url" inline-template>
                <network network="facebook">
                  Facebook
                </network>
              </social-sharing>
            </b-dropdown-item>
            <b-dropdown-item href="#">
              <social-sharing :url="article.url" inline-template>
                <network network="twitter">
                    Twitter
                </network>
              </social-sharing>
            </b-dropdown-item>
            <b-dropdown-item href="#">
               <social-sharing :url="article.url" inline-template>
                  <network network="linkedin">
                    Linkedin
                  </network>
               </social-sharing>
            </b-dropdown-item>
        </b-dropdown>
      </div>
    </div>
  </div>
</template>
<script>
import cacheService from '../services/cacheArticle'
import Store from 'electron-store'
import axios from 'axios'

const markTypes = {
  favourite: 'FAVOURITE',
  unfavourite: 'UNFAVOURITE',
  read: 'READ',
  unread: 'UNREAD',
  cache: 'CACHE',
  uncache: 'UNCACHE'
}

const store = new Store()

export default {
  data () {
    return {
      pocket_connected: false
    }
  },
  props: {
    article: {
      type: Object
    }
  },
  mounted () {
    if (store.get('pocket_token')) {
      this.pocket_connected = true
    }
  },
  computed: {
    markFavouriteButton () {
      return this.article.favourite ? 'Mark as unfavourite' : 'Mark as favourite'
    },
    markReadButton () {
      return this.article.read ? 'Mark as unread' : 'Mark as read'
    }
  },
  methods: {
    markFavourite () {
      if (this.article.favourite) {
        this.$store.dispatch('markAction', {
          type: markTypes.unfavourite,
          id: this.$route.params.id
        })
      } else {
        this.$store.dispatch('markAction', {
          type: markTypes.favourite,
          id: this.$route.params.id
        })
      }
      this.article.favourite = !this.article.favourite
    },
    saveArticle () {
      const self = this
      if (this.article.offline && !this.$store.state.Setting.offline) {
        cacheService.uncache(`raven-${this.article._id}`).then(() => {
          self.article.offline = false
          self.$store.dispatch('saveArticle', {
            type: markTypes.uncache,
            article: self.article
          })
        })
      } else {
        cacheService.cacheArticleData(self.article).then(() => {
          self.article.offline = true
          self.$store.dispatch('saveArticle', {
            type: markTypes.cache,
            article: self.article
          })
        })
      }
    },
    saveToPocket (url) {
      var credentials = JSON.parse(store.get('pocket_token'))
      axios.post('https://getpocket.com/v3/add', {
        url: url,
        access_token: credentials.access_token,
        consumer_key: credentials.consumer_key
      }).then((data) => {
        this.$toasted.show('Saved to pocket.', {
          theme: 'outline',
          position: 'top-center',
          duration: 3000
        })
      })
    },
    markRead () {
      if (this.article.read) {
        this.$store.dispatch('markAction', {
          type: markTypes.unread,
          id: this.$route.params.id
        })
      } else {
        this.$store.dispatch('markAction', {
          type: markTypes.read,
          id: this.$route.params.id
        })
      }
      this.article.read = !this.article.read
    }
  }
}
</script>
<style lang="scss">

// Default color mode
:root {
  & .article-toolbar {
    --feather-success-color: green;
  }
}

// Dark color mode
.app-darkmode {  
  & .article-toolbar {
    --feather-success-color: green;
  }
}

.article-toolbar {
  display: flex;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 3;
  width: 100%;
  border-bottom: 1px solid var(--border-color);
  height: 41px;

  background-color: var(--background-color);
  
  .article-buttons,
  .site-info {
    background: var(--background-color);
    span {
      color: var(--text-color);
    }
    .feather {
      color: var(--text-color);
    }

    .feather-filled {
      fill: var(--text-color);
    }

    .feather-success {
      color: var(--feather-success-color);
    }
  }
}

.site-info,
.article-buttons {
  display: block;
  position: absolute;
  top: 0;
  width: 270px;
  height: 40px;
  z-index: 1;
  background-image: linear-gradient(to right, rgba(255,255,255,0) 0%, #fff 10%);
}

.site-info {
  width: 350px;
  left: 0;

  .btn-toolbar {
    width: 100%;
  }

  .wrap {
    float: left;
  }
}

.article-buttons {
  right:0 ;

  .wrap {
    float: right;
  }
}

.btn-toolbar {
  color: black;
  display: block !important;
  z-index: 2;
  background: transparent;
  border: none;
  border-radius: 0;
  width: 44px;
  height: 40px;
  padding: 0;
  position: relative;

  &:hover {
    color: black;
  }
  &:focus {
    outline: 0;
    box-shadow: none;
  }
}

.favicon-wrap {
  position: absolute;
  box-shadow: none;
  height: 20px;
  width: 20px;
  left: 12px;
  top: 17px;
  display: flex;
  align-items: center;
  pointer-events: none;
  z-index: 0;
}

.dropdown-item span {
  color: #000 !important;
}
</style>
