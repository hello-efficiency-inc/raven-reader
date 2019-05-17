<template>
  <div class="artcle-list-item"
      @click="setActiveArticleId(article)"
      mark="article"      
      v-bind:class="{ active: isArticleActive(article) }"
  >
    <router-link :to="`/article/${article._id}`" :class="{ 'article-read': article.read }" class="list-group-item list-group-item-action flex-column align-items-start">
      <div class="d-flex w-100 justify-content-between mb-3">
        <small><img v-if="article.favicon" :src="article.favicon" width="16" height="16"> {{ article.feed_title }}</small>
        <small>{{ article.formatDate}}</small>
      </div>
      <h6><strong>{{ article.title }}</strong></h6>
    </router-link>
  </div>
</template>
<script>
export default {
  methods: {
    setActiveArticleId (article) {
      return this.$store.dispatch('setActiveArticleId', article)
    },
    isArticleActive (article) {
      return !!article && article.id !== undefined && article.id === this.activeArticleId
    }
  },
  computed: {
    activeArticleId () {
      return this.$store.getters.activeArticleId
    }
  },
  props: {
    article: {
      type: Object
    }
  }
}
</script>
<style lang="scss">
.artcle-list-item {
  &.active {    
    background-color: var(--active-item-background-color);
    border-radius: 0.3rem;
  }
}
</style>