<template>
<div>
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
        <button class="btn btn-toolbar" @click="openSettings" v-b-tooltip.hover title="Format Options">
          <feather-icon name="settings"></feather-icon>
        </button>
      </div>
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
        <b-dropdown variant="link" no-caret ref="socialshare" toogle-class="btn-toolbar">
          <template slot="button-content" class="pt-1">
            <feather-icon name="share-2"></feather-icon>
          </template>
          <b-dropdown-item v-if="pocket_connected" @click="saveToPocket(article.url)">
                Pocket
            </b-dropdown-item>
          <b-dropdown-item>
              <social-sharing :url="article.url" inline-template>
                <network network="email">
                  Email
                </network>
              </social-sharing>
            </b-dropdown-item>
          <b-dropdown-item>
              <social-sharing :url="article.url" inline-template>
                <network network="facebook">
                  Facebook
                </network>
              </social-sharing>
            </b-dropdown-item>
            <b-dropdown-item>
              <social-sharing :url="article.url" inline-template>
                <network network="twitter">
                    Twitter
                </network>
              </social-sharing>
            </b-dropdown-item>
            <b-dropdown-item>
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
  <div class="article-setting" v-bind:class="{ hidden: !settingspanel }">
      <div class="settings-wrap">
        <button class="btn btn-link" @click="decreaseFontSize">
          <svg class="icon-smaller-text" xmlns="http://www.w3.org/2000/svg" width="48" height="48"><path d="M17.973 29.845v-.321c.446-.051.781-.219 1.004-.504.223-.286.606-1.067 1.148-2.345l3.617-8.52h.346l4.326 9.842c.288.651.519 1.056.69 1.21s.463.26.869.316v.321h-4.415v-.321c.507-.046.835-.101.981-.166.146-.064.221-.223.221-.476a2.08 2.08 0 0 0-.086-.447 4.885 4.885 0 0 0-.236-.675l-.695-1.67h-4.575a85.484 85.484 0 0 0-.808 2.079c-.087.25-.131.448-.131.595 0 .293.119.495.356.607.146.067.423.118.829.152v.321h-3.441zm7.476-4.458l-1.989-4.782-1.999 4.782h3.988z"></path></svg>
        </button>
      </div>
      <div class="settings-wrap">
        <button class="btn btn-link" @click="increaseFontSize">
          <svg class="icon-smaller-text" xmlns="http://www.w3.org/2000/svg" width="48" height="48"><path d="M11.654 36v-.661c.916-.104 1.604-.448 2.062-1.034s1.244-2.191 2.356-4.812L23.499 12h.709l8.881 20.207c.592 1.338 1.063 2.166 1.419 2.482.354.317.948.534 1.783.649V36h-9.064v-.661c1.042-.093 1.713-.205 2.016-.339.301-.132.451-.458.451-.978 0-.173-.058-.479-.174-.919a9.874 9.874 0 0 0-.487-1.385l-1.427-3.429h-9.393c-.926 2.332-1.479 3.755-1.659 4.269s-.27.922-.27 1.222c0 .601.244 1.017.73 1.247.301.139.868.242 1.702.312V36h-7.062zm15.35-9.154L22.92 17.03l-4.104 9.816h8.188z"></path></svg>
        </button>
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
      pocket_connected: false,
      settingspanel: false
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
    decreaseFontSize () {
      this.$store.dispatch('decreaseFont')
    },
    increaseFontSize () {
      this.$store.dispatch('increaseFont')
    },
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
        this.$refs.socialshare.hide(true)
      })
    },
    openSettings () {
      this.settingspanel = !this.settingspanel
      this.$store.dispatch('turnOnFontSetting', this.settingspanel)
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

.dropdown > .btn-link {
  color: #000;
}

.article-setting {
  z-index: 5;
  position: absolute;
  top: 41px;
  width: 100%;
  height: 49px;
  border-bottom: 1px solid #e9e9e9;
  background-color: #f5f5f7;
  left: 0;
  display: flex;
}

.app-darkmode {
  .article-setting {
    background-color: #1A1A1A;
  }

  .icon-smaller-text {
    fill: #fff;
}

  .setting-wrap {
    border-right: 1ox solid #333333;
  }
}

.settings-wrap {
  display: flex;
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  padding: 0;
  color: black;
  font-weight: 700;
  font-size: 18px;
  border-right: 1px solid #e9e9eb;
}

.icon-smaller-text {
    fill: #0D1623;
}

.hidden {
  display: none;
}
</style>
