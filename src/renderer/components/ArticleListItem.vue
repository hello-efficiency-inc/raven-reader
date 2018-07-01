<template>
  <div>
    <router-link :to="`/article/${article._id}`" :class="{ 'article-read': article.read }" class="list-group-item list-group-item-action flex-column align-items-start">
      <div class="d-flex w-100 justify-content-between mb-3">
        <small><img v-if="article.meta.favicon" :src="article.meta.favicon" width="16" height="16"> {{ article.meta.title }}</small>
        <small>{{ article.pubdate }}</small>
      </div>
      <h6><strong>{{ article.title }}</strong></h6>
    </router-link>
  </div>
</template>
<script>
export default {
  props: {
    article: {
      type: Object
    }
  }
}
</script>
