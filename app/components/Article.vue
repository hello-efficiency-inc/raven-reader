<template>
  <div class="article-read" v-if="content">
    <h3>{{ articletitle }}</h3>
    <p class="source-provider"><img v-if="favicon !== null" v-bind:src="favicon" width="20" height="20"> {{ feed }} <span class="pubDate">{{ pubdate }}</span></p>
    {{{ content }}}
  </div>
  <div class="v-spinner" v-if="!content">
    Sorry this content is only available online view
  </div>
</template>
<script>
  export default{
    props: ['articletitle','feed','pubdate','content','favicon']
  }
</script>
