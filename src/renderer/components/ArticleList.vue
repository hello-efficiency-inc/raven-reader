<template>
  <div class="articles-list">
    <div class="articles-inner">
      <form class="search-form">
        <div class="search-input input-group mb-0">
          <div class="input-group-prepend">
            <span class="input-group-text">
              <feather-icon name="search"></feather-icon>
            </span>
          </div>
          <input type="text" class="form-control" placeholder="Search" aria-label="Search" v-model="search">
        </div>
      </form>
      <div class="articles">
          <perfect-scrollbar class="list-group">
            <article-item v-if="filteredArticles.length > 0" :article="article" v-for="article in mapArticles(filteredArticles)" :key="article._id"></article-item>
            <div class="no-articles" v-if="filteredArticles.length === 0">
              No articles available
            </div>
          </perfect-scrollbar>
      </div>
      <div class="statusBar" ref="statusBar">
        <button @click="fold" class="btn foldBtn">
          <feather-icon :name="featherIcon"></feather-icon>
        </button>
        <span ref="statusMsg" class="statusMsg"></span>
      </div>
    </div>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'

export default {
  data () {
    return {
      search: null,
      featherIcon: 'chevron-left'
    }
  },
  props: {
    type: {
      type: String,
      default: 'all'
    },
    feed: {
      type: String
    }
  },
  watch: {
    search (val) {
      this.$store.dispatch('changeType', 'search')
      this.$store.dispatch('setSearch', val)
    },
    filteredArticles: 'itemsChange'
  },
  computed: {
    ...mapGetters([
      'filteredArticles'
    ]),
    activeArticleId () {
      return this.$store.getters.activeArticleId
    }
  },
  methods: {
    mapArticles (articles) {
      return articles.map(article => ({ ...article, id: article._id, isActive: this.isArticleActive(article) }))
    },
    isArticleActive (article) {
      return !!article && article.id !== undefined && article.id === this.activeArticleId
    },
    itemsChange () {
      this.$refs.statusMsg.innerText = `${this.filteredArticles.length} items`
    },
    fold () {
      this.$parent.$refs.sidebar.hidden = !this.$parent.$refs.sidebar.hidden
      if (this.$parent.$refs.sidebar.hidden) {
        this.featherIcon = 'chevron-right'
      } else {
        this.featherIcon = 'chevron-left'
      }
    }
  }
}
</script>
<style lang="scss">
.articles-inner {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow:hidden;
}

// Default color mode
:root {
  & .articles-list {
    --input-background-color: var(--background-color);
    --input-color: #495057;
  }
}

// Dark color mode
.app-darkmode {
  & .articles-list {
    --input-background-color: var(--background-color);
    --input-color: #c8cacc;    
  }
}

.articles-list {
  position: relative;
  flex-grow: 0;
  font-size: 14px;
  width: 350px;
  height: 100%;
  border-right: 1px solid var(--border-color);

  &:after {
    content: '';
    position: absolute;
    bottom: 0;
    width: 100%;
    height: 25px;
    background: linear-gradient(rgba(255, 255, 255, 0.001), white ); /* transparent keyword is broken in Safari */
    pointer-events: none;
  }

  .search-form {
    border-bottom-color: var(--border-color);
    
    .form-control {
      background: var(--input-background-color);
      color: var(--input-color);
    }
  }
  .articles-inner .search-form,
  .articles-inner .articles,
  .articles-inner .list-group-item {
    background: var(--background-color);
    color: var(--text-color);
  }
  .articles-inner .list-group-item {
    background: var(--background-color);
    border-bottom-color: var(--border-color);
  }

  &::after {
    background: var(--after-background);
  }
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
  height: calc(100% - 80px);
}

.no-articles {
  display: flex;
  height: 90vh;
  justify-content: center;
  align-items: center;
}

.article-read {
  opacity: 0.7;
}

.search-input {
  position: absolute;
  top: 0;
  bottom: 0;

  color: var(--text-color);

  .feather {
    color: var(--text-color);
  }

  .form-control::placeholder {
    color: var(--text-color);
  }

  .input-group-text {
    background: none;
    border: 0;
  }
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

  .form-control {
    border-radius: 0;
    border: 0;

    &:focus {
      box-shadow: none;
      outline: 0;
    }
  }
}

.statusBar {
  color: var(--text-color);
  height: 40px;
  line-height: 30px;
  width: 100%;
  background-color: var(--background-color);
  position: absolute;
  bottom: 0;
  border-top: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  z-index: 20;

  & .feather {
    color: var(--text-color);
  }
}

.statusMsg {
  line-height: 30px;
  width: 100%;
  font-size: 12px;
  text-align: center;
}

.foldBtn {
  left: 0;
  margin: 0 !important;
  padding: 0 !important;
}

.foldBtn:hover {
  color: #3399FF !important;
}

.foldBtn:focus {
  outline: none !important;
  box-shadow: none !important;
}

.foldBtn:active {
  outline: none !important;
  box-shadow: none !important;
}

.list-group {
  height: 100%;
}
</style>
