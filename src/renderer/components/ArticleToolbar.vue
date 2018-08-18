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
        <button class="btn btn-toolbar" @click="markFavourite">
          <feather-icon name="star" :filled="article.favourite"></feather-icon>
        </button>
      </div>
      <div class="wrap">
        <button class="btn btn-toolbar" @click="markRead">
          <feather-icon name="circle" :filled="article.read"></feather-icon>
        </button>
      </div>
      <div class="wrap">
        <a :href="article.url" class="btn btn-toolbar js-external-link">
          <feather-icon name="external-link"></feather-icon>
        </a>
      </div>
    </div>
  </div>
</template>
<script>
const markTypes = {
  favourite: 'FAVOURITE',
  unfavourite: 'UNFAVOURITE',
  read: 'READ',
  unread: 'UNREAD'
}
export default {
  props: {
    article: {
      type: Object
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
  left: 0;

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
</style>
