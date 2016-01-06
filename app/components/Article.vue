<template>
  <div class="article-read">
    <h3>{{ articletitle }}</h3>
    <p class="source-provider"><img v-bind:src="favicon" width="20" height="20"> {{ feed }} <span class="pubDate">{{ pubDate }}</span></p>
    {{{ content }}}
  </div>
</template>
<script>
  export default{
    props: ['articletitle','feed','pubDate','content','favicon']
  }
</script>
