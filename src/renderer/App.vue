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

html,
#app,
body {
  height: 100%;
  width: 100%;
  padding: 0;
  margin: 0;
}

body {
  overflow: hidden;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.sidebar {
  position: relative;
  flex-grow: 0;
  width: 300px;
  height: 100%;
  box-shadow: inset -1px 0 0 rgba(0, 0, 0, 0.1);

  &::after {
    content: '';
    position: absolute;
    left: 0;
    bottom: 0;
    width: 99.5%;
    height: 20px;
    background: linear-gradient(
    rgba(255, 255, 255, 0.5),
    white
    ); /* transparent keyword is broken in Safari */
    pointer-events: none;
  }
}

.sidebar-sticky {
  position: relative;
  top: 0;
  height: calc(100vh - 48px);
  padding-top: 0.5rem;
  overflow-x: hidden;
  overflow-y: auto;
}

@supports ((position: -webkit-sticky) or (position: sticky)) {
  .sidebar-sticky {
    position: -webkit-sticky;
    position: sticky;
  }
}
.sidebar .nav-link {
  font-weight: 600;
  color: #000;
}

.sidebar .nav-link .feather {
  margin-right: 10px;
  color: #999;
}

.sidebar .nav-link.active {
  color: #007bff;
}

.sidebar .nav-link:hover .feather,
.sidebar .nav-link.active .feather {
  color: inherit;
}

.sidebar .nav-link:focus {
  outline: 0;
}

.sidebar-heading {
  font-weight: 600;
  font-size: 0.85rem;
  text-transform: uppercase;
}

.list-group a {
  border-top-left-radius: 0 !important;
  border-top-right-radius: 0 !important;
}

.list-group-item:first-of-type {
  border-top: 0;
}

.list-group-item {
  border-left: 0;
  border-right: 0;
  border-radius: 0 !important
}
</style>
