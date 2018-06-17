<template>
  <div class="articles-list">
    <div class="articles-inner">
      <article-search></article-search>
      <div class="articles">
        <div class="list-group">
          <router-link v-if="articles.length > 0" :to="`/article/${article._id}`" class="list-group-item list-group-item-action flex-column align-items-start" v-for="article in articles" :key="article._id">
            <div class="d-flex w-100 justify-content-between mb-3">
              <small><img :src="article.meta.favicon" width="16" height="16"> {{ article.meta.title }}</small>
              <small>{{ article.pubdate }}</small>
            </div>
            <h6><strong>{{ article.title }}</strong></h6>
          </router-link>
          <div class="no-articles" v-if="articles.length === 0">
            No articles available
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import _ from 'lodash'

export default {
  computed: {
    articles () {
      const orderedArticles = _.orderBy(this.$store.state.Article.articles, ['pubDate'], ['desc'])
      return orderedArticles
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
</style>
