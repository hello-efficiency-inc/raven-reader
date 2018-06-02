<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
  export default {
    name: 'rss-reader'
  }
</script>

<style lang="scss">
  @import 'node_modules/bootstrap/scss/bootstrap';

  body {
     -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
</style>
