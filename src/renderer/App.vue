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

/* open-sans-300 - latin_cyrillic-ext */
@font-face {
  font-family: 'Open Sans';
  font-style: normal;
  font-weight: 300;
  src: local('Open Sans Light'), local('OpenSans-Light'),
       url('./assets/fonts/open-sans-v15-latin_cyrillic-ext-300.woff2') format('woff2'), /* Chrome 26+, Opera 23+, Firefox 39+ */
       url('./assets/fonts/open-sans-v15-latin_cyrillic-ext-300.woff') format('woff'); /* Chrome 6+, Firefox 3.6+, IE 9+, Safari 5.1+ */
}
/* open-sans-300italic - latin_cyrillic-ext */
@font-face {
  font-family: 'Open Sans';
  font-style: italic;
  font-weight: 300;
  src: local('Open Sans Light Italic'), local('OpenSans-LightItalic'),
       url('./assets/fonts/open-sans-v15-latin_cyrillic-ext-300italic.woff2') format('woff2'), /* Chrome 26+, Opera 23+, Firefox 39+ */
       url('./assets/fonts/open-sans-v15-latin_cyrillic-ext-300italic.woff') format('woff'); /* Chrome 6+, Firefox 3.6+, IE 9+, Safari 5.1+ */
}
/* open-sans-regular - latin_cyrillic-ext */
@font-face {
  font-family: 'Open Sans';
  font-style: normal;
  font-weight: 400;
  src: local('Open Sans Regular'), local('OpenSans-Regular'),
       url('./assets/fonts/open-sans-v15-latin_cyrillic-ext-regular.woff2') format('woff2'), /* Chrome 26+, Opera 23+, Firefox 39+ */
       url('./assets/fonts/open-sans-v15-latin_cyrillic-ext-regular.woff') format('woff'); /* Chrome 6+, Firefox 3.6+, IE 9+, Safari 5.1+ */
}
/* open-sans-italic - latin_cyrillic-ext */
@font-face {
  font-family: 'Open Sans';
  font-style: italic;
  font-weight: 400;
  src: local('Open Sans Italic'), local('OpenSans-Italic'),
       url('./assets/fonts/open-sans-v15-latin_cyrillic-ext-italic.woff2') format('woff2'), /* Chrome 26+, Opera 23+, Firefox 39+ */
       url('./assets/fonts/open-sans-v15-latin_cyrillic-ext-italic.woff') format('woff'); /* Chrome 6+, Firefox 3.6+, IE 9+, Safari 5.1+ */
}
/* open-sans-600 - latin_cyrillic-ext */
@font-face {
  font-family: 'Open Sans';
  font-style: normal;
  font-weight: 600;
  src: local('Open Sans SemiBold'), local('OpenSans-SemiBold'),
       url('./assets/fonts/open-sans-v15-latin_cyrillic-ext-600.woff2') format('woff2'), /* Chrome 26+, Opera 23+, Firefox 39+ */
       url('./assets/fonts/open-sans-v15-latin_cyrillic-ext-600.woff') format('woff'); /* Chrome 6+, Firefox 3.6+, IE 9+, Safari 5.1+ */
}
/* open-sans-600italic - latin_cyrillic-ext */
@font-face {
  font-family: 'Open Sans';
  font-style: italic;
  font-weight: 600;
  src: local('Open Sans SemiBold Italic'), local('OpenSans-SemiBoldItalic'),
       url('./assets/fonts/open-sans-v15-latin_cyrillic-ext-600italic.woff2') format('woff2'), /* Chrome 26+, Opera 23+, Firefox 39+ */
       url('./assets/fonts/open-sans-v15-latin_cyrillic-ext-600italic.woff') format('woff'); /* Chrome 6+, Firefox 3.6+, IE 9+, Safari 5.1+ */
}
/* open-sans-700 - latin_cyrillic-ext */
@font-face {
  font-family: 'Open Sans';
  font-style: normal;
  font-weight: 700;
  src: local('Open Sans Bold'), local('OpenSans-Bold'),
       url('./assets/fonts/open-sans-v15-latin_cyrillic-ext-700.woff2') format('woff2'), /* Chrome 26+, Opera 23+, Firefox 39+ */
       url('./assets/fonts/open-sans-v15-latin_cyrillic-ext-700.woff') format('woff'); /* Chrome 6+, Firefox 3.6+, IE 9+, Safari 5.1+ */
}
/* open-sans-700italic - latin_cyrillic-ext */
@font-face {
  font-family: 'Open Sans';
  font-style: italic;
  font-weight: 700;
  src: local('Open Sans Bold Italic'), local('OpenSans-BoldItalic'),
       url('./assets/fonts/open-sans-v15-latin_cyrillic-ext-700italic.woff2') format('woff2'), /* Chrome 26+, Opera 23+, Firefox 39+ */
       url('./assets/fonts/open-sans-v15-latin_cyrillic-ext-700italic.woff') format('woff'); /* Chrome 6+, Firefox 3.6+, IE 9+, Safari 5.1+ */
}
/* open-sans-800 - latin_cyrillic-ext */
@font-face {
  font-family: 'Open Sans';
  font-style: normal;
  font-weight: 800;
  src: local('Open Sans ExtraBold'), local('OpenSans-ExtraBold'),
       url('./assets/fonts/open-sans-v15-latin_cyrillic-ext-800.woff2') format('woff2'), /* Chrome 26+, Opera 23+, Firefox 39+ */
       url('./assets/fonts/open-sans-v15-latin_cyrillic-ext-800.woff') format('woff'); /* Chrome 6+, Firefox 3.6+, IE 9+, Safari 5.1+ */
}
/* open-sans-800italic - latin_cyrillic-ext */
@font-face {
  font-family: 'Open Sans';
  font-style: italic;
  font-weight: 800;
  src: local('Open Sans ExtraBold Italic'), local('OpenSans-ExtraBoldItalic'),
       url('./assets/fonts/open-sans-v15-latin_cyrillic-ext-800italic.woff2') format('woff2'), /* Chrome 26+, Opera 23+, Firefox 39+ */
       url('./assets/fonts/open-sans-v15-latin_cyrillic-ext-800italic.woff') format('woff'); /* Chrome 6+, Firefox 3.6+, IE 9+, Safari 5.1+ */
}

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
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial,'Open Sans', sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
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
