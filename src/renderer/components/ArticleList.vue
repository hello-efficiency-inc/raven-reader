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
        <div class="list-group">
          <article-item v-if="filteredArticles.length > 0" :article="article" v-for="article in filteredArticles" :key="article._id"></article-item>
          <div class="no-articles" v-if="filteredArticles.length === 0">
            No articles available
          </div>
        </div>
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
    ])
  },
  methods: {
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

.articles-list {
  position: relative;
  flex-grow: 0;
  font-size: 14px;
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
  background: linear-gradient(rgba(255, 255, 255, 0.001), white ); /* transparent keyword is broken in Safari */
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

.app-darkmode {
  .search-input {
    color: #fff;

    .feather {
      color: #fff;
    }

    .form-control::placeholder {
      color: #fff;
    }
  }
  .statusBar {
    color: #fff;
    background:#373737;
    border-top-color: #000;

    .feather {
      color: #fff;
    }
  }
}

.statusBar {
  height: 40px;
  line-height: 30px;
  width: 100%;
  background: #fff;
  position: absolute;
  bottom: 0;
  border-top: 1px solid #dcdee0;
  display: flex;
  align-items: center;
  z-index: 20;
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
</style>
