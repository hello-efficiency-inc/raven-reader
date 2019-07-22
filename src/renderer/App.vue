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

/* muli-regular - latin-ext_latin */
@font-face {
  font-family: 'Muli';
  font-style: normal;
  font-weight: 400;
  src: local('Muli Regular'), local('Muli-Regular'),
       url('./assets/fonts/muli-v13-latin-ext_latin-regular.woff2') format('woff2'), /* Chrome 26+, Opera 23+, Firefox 39+ */
       url('./assets/fonts/muli-v13-latin-ext_latin-regular.woff') format('woff'); /* Chrome 6+, Firefox 3.6+, IE 9+, Safari 5.1+ */
}
/* muli-600 - latin-ext_latin */
@font-face {
  font-family: 'Muli';
  font-style: normal;
  font-weight: 600;
  src: local('Muli SemiBold'), local('Muli-SemiBold'),
       url('./assets/fonts/muli-v13-latin-ext_latin-600.woff2') format('woff2'), /* Chrome 26+, Opera 23+, Firefox 39+ */
       url('./assets/fonts/muli-v13-latin-ext_latin-600.woff') format('woff'); /* Chrome 6+, Firefox 3.6+, IE 9+, Safari 5.1+ */
}
/* muli-italic - latin-ext_latin */
@font-face {
  font-family: 'Muli';
  font-style: italic;
  font-weight: 400;
  src: local('Muli Italic'), local('Muli-Italic'),
       url('./assets/fonts/muli-v13-latin-ext_latin-italic.woff2') format('woff2'), /* Chrome 26+, Opera 23+, Firefox 39+ */
       url('./assets/fonts/muli-v13-latin-ext_latin-italic.woff') format('woff'); /* Chrome 6+, Firefox 3.6+, IE 9+, Safari 5.1+ */
}
/* muli-800 - latin-ext_latin */
@font-face {
  font-family: 'Muli';
  font-style: normal;
  font-weight: 800;
  src: local('Muli ExtraBold'), local('Muli-ExtraBold'),
       url('./assets/fonts/muli-v13-latin-ext_latin-800.woff2') format('woff2'), /* Chrome 26+, Opera 23+, Firefox 39+ */
       url('./assets/fonts/muli-v13-latin-ext_latin-800.woff') format('woff'); /* Chrome 6+, Firefox 3.6+, IE 9+, Safari 5.1+ */
}

/* playfair-display-regular - latin-ext_cyrillic_latin */
@font-face {
  font-family: 'Playfair Display';
  font-style: normal;
  font-weight: 400;
  src: url('./assets/fonts/playfair-display-v14-latin-ext_cyrillic_latin-regular.eot'); /* IE9 Compat Modes */
  src: local('Playfair Display Regular'), local('PlayfairDisplay-Regular'),
       url('./assets/fonts/playfair-display-v14-latin-ext_cyrillic_latin-regular.eot?#iefix') format('embedded-opentype'), /* IE6-IE8 */
       url('./assets/fonts/playfair-display-v14-latin-ext_cyrillic_latin-regular.woff2') format('woff2'), /* Super Modern Browsers */
       url('./assets/fonts/playfair-display-v14-latin-ext_cyrillic_latin-regular.woff') format('woff'), /* Modern Browsers */
       url('./assets/fonts/playfair-display-v14-latin-ext_cyrillic_latin-regular.ttf') format('truetype'), /* Safari, Android, iOS */
       url('./assets/fonts/playfair-display-v14-latin-ext_cyrillic_latin-regular.svg#PlayfairDisplay') format('svg'); /* Legacy iOS */
}
/* playfair-display-italic - latin-ext_cyrillic_latin */
@font-face {
  font-family: 'Playfair Display';
  font-style: italic;
  font-weight: 400;
  src: url('./assets/fonts/playfair-display-v14-latin-ext_cyrillic_latin-italic.eot'); /* IE9 Compat Modes */
  src: local('Playfair Display Italic'), local('PlayfairDisplay-Italic'),
       url('./assets/fonts/playfair-display-v14-latin-ext_cyrillic_latin-italic.eot?#iefix') format('embedded-opentype'), /* IE6-IE8 */
       url('./assets/fonts/playfair-display-v14-latin-ext_cyrillic_latin-italic.woff2') format('woff2'), /* Super Modern Browsers */
       url('./assets/fonts/playfair-display-v14-latin-ext_cyrillic_latin-italic.woff') format('woff'), /* Modern Browsers */
       url('./assets/fonts/playfair-display-v14-latin-ext_cyrillic_latin-italic.ttf') format('truetype'), /* Safari, Android, iOS */
       url('./assets/fonts/playfair-display-v14-latin-ext_cyrillic_latin-italic.svg#PlayfairDisplay') format('svg'); /* Legacy iOS */
}
/* playfair-display-700 - latin-ext_cyrillic_latin */
@font-face {
  font-family: 'Playfair Display';
  font-style: normal;
  font-weight: 700;
  src: url('./assets/fonts/playfair-display-v14-latin-ext_cyrillic_latin-700.eot'); /* IE9 Compat Modes */
  src: local('Playfair Display Bold'), local('PlayfairDisplay-Bold'),
       url('./assets/fonts/playfair-display-v14-latin-ext_cyrillic_latin-700.eot?#iefix') format('embedded-opentype'), /* IE6-IE8 */
       url('./assets/fonts/playfair-display-v14-latin-ext_cyrillic_latin-700.woff2') format('woff2'), /* Super Modern Browsers */
       url('./assets/fonts/playfair-display-v14-latin-ext_cyrillic_latin-700.woff') format('woff'), /* Modern Browsers */
       url('./assets/fonts/playfair-display-v14-latin-ext_cyrillic_latin-700.ttf') format('truetype'), /* Safari, Android, iOS */
       url('./assets/fonts/playfair-display-v14-latin-ext_cyrillic_latin-700.svg#PlayfairDisplay') format('svg'); /* Legacy iOS */
}
/* playfair-display-900 - latin-ext_cyrillic_latin */
@font-face {
  font-family: 'Playfair Display';
  font-style: normal;
  font-weight: 900;
  src: url('./assets/fonts/playfair-display-v14-latin-ext_cyrillic_latin-900.eot'); /* IE9 Compat Modes */
  src: local('Playfair Display Black'), local('PlayfairDisplay-Black'),
       url('./assets/fonts/playfair-display-v14-latin-ext_cyrillic_latin-900.eot?#iefix') format('embedded-opentype'), /* IE6-IE8 */
       url('./assets/fonts/playfair-display-v14-latin-ext_cyrillic_latin-900.woff2') format('woff2'), /* Super Modern Browsers */
       url('./assets/fonts/playfair-display-v14-latin-ext_cyrillic_latin-900.woff') format('woff'), /* Modern Browsers */
       url('./assets/fonts/playfair-display-v14-latin-ext_cyrillic_latin-900.ttf') format('truetype'), /* Safari, Android, iOS */
       url('./assets/fonts/playfair-display-v14-latin-ext_cyrillic_latin-900.svg#PlayfairDisplay') format('svg'); /* Legacy iOS */
}

/* roboto-slab-100 - cyrillic-ext_cyrillic_latin */
@font-face {
  font-family: 'Roboto Slab';
  font-style: normal;
  font-weight: 100;
  src: url('./assets/fonts/roboto-slab-v8-cyrillic-ext_cyrillic_latin-100.eot'); /* IE9 Compat Modes */
  src: local('Roboto Slab Thin'), local('RobotoSlab-Thin'),
       url('./assets/fonts/roboto-slab-v8-cyrillic-ext_cyrillic_latin-100.eot?#iefix') format('embedded-opentype'), /* IE6-IE8 */
       url('./assets/fonts/roboto-slab-v8-cyrillic-ext_cyrillic_latin-100.woff2') format('woff2'), /* Super Modern Browsers */
       url('./assets/fonts/roboto-slab-v8-cyrillic-ext_cyrillic_latin-100.woff') format('woff'), /* Modern Browsers */
       url('./assets/fonts/roboto-slab-v8-cyrillic-ext_cyrillic_latin-100.ttf') format('truetype'), /* Safari, Android, iOS */
       url('./assets/fonts/roboto-slab-v8-cyrillic-ext_cyrillic_latin-100.svg#RobotoSlab') format('svg'); /* Legacy iOS */
}
/* roboto-slab-300 - cyrillic-ext_cyrillic_latin */
@font-face {
  font-family: 'Roboto Slab';
  font-style: normal;
  font-weight: 300;
  src: url('./assets/fonts/roboto-slab-v8-cyrillic-ext_cyrillic_latin-300.eot'); /* IE9 Compat Modes */
  src: local('Roboto Slab Light'), local('RobotoSlab-Light'),
       url('./assets/fonts/roboto-slab-v8-cyrillic-ext_cyrillic_latin-300.eot?#iefix') format('embedded-opentype'), /* IE6-IE8 */
       url('./assets/fonts/roboto-slab-v8-cyrillic-ext_cyrillic_latin-300.woff2') format('woff2'), /* Super Modern Browsers */
       url('./assets/fonts/roboto-slab-v8-cyrillic-ext_cyrillic_latin-300.woff') format('woff'), /* Modern Browsers */
       url('./assets/fonts/roboto-slab-v8-cyrillic-ext_cyrillic_latin-300.ttf') format('truetype'), /* Safari, Android, iOS */
       url('./assets/fonts/roboto-slab-v8-cyrillic-ext_cyrillic_latin-300.svg#RobotoSlab') format('svg'); /* Legacy iOS */
}
/* roboto-slab-regular - cyrillic-ext_cyrillic_latin */
@font-face {
  font-family: 'Roboto Slab';
  font-style: normal;
  font-weight: 400;
  src: url('./assets/fonts/roboto-slab-v8-cyrillic-ext_cyrillic_latin-regular.eot'); /* IE9 Compat Modes */
  src: local('Roboto Slab Regular'), local('RobotoSlab-Regular'),
       url('./assets/fonts/roboto-slab-v8-cyrillic-ext_cyrillic_latin-regular.eot?#iefix') format('embedded-opentype'), /* IE6-IE8 */
       url('./assets/fonts/roboto-slab-v8-cyrillic-ext_cyrillic_latin-regular.woff2') format('woff2'), /* Super Modern Browsers */
       url('./assets/fonts/roboto-slab-v8-cyrillic-ext_cyrillic_latin-regular.woff') format('woff'), /* Modern Browsers */
       url('./assets/fonts/roboto-slab-v8-cyrillic-ext_cyrillic_latin-regular.ttf') format('truetype'), /* Safari, Android, iOS */
       url('./assets/fonts/roboto-slab-v8-cyrillic-ext_cyrillic_latin-regular.svg#RobotoSlab') format('svg'); /* Legacy iOS */
}
/* roboto-slab-700 - cyrillic-ext_cyrillic_latin */
@font-face {
  font-family: 'Roboto Slab';
  font-style: normal;
  font-weight: 700;
  src: url('./assets/fonts/roboto-slab-v8-cyrillic-ext_cyrillic_latin-700.eot'); /* IE9 Compat Modes */
  src: local('Roboto Slab Bold'), local('RobotoSlab-Bold'),
       url('./assets/fonts/roboto-slab-v8-cyrillic-ext_cyrillic_latin-700.eot?#iefix') format('embedded-opentype'), /* IE6-IE8 */
       url('./assets/fonts/roboto-slab-v8-cyrillic-ext_cyrillic_latin-700.woff2') format('woff2'), /* Super Modern Browsers */
       url('./assets/fonts/roboto-slab-v8-cyrillic-ext_cyrillic_latin-700.woff') format('woff'), /* Modern Browsers */
       url('./assets/fonts/roboto-slab-v8-cyrillic-ext_cyrillic_latin-700.ttf') format('truetype'), /* Safari, Android, iOS */
       url('./assets/fonts/roboto-slab-v8-cyrillic-ext_cyrillic_latin-700.svg#RobotoSlab') format('svg'); /* Legacy iOS */
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
  width: 260px;
  font-size: 14px;
  height: 100%;
  box-shadow: inset -1px 0 0 rgba(0, 0, 0, 0.1);
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
  color: initial;
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
  border-radius: 0 !important;
  overflow-wrap: break-word;
}

.btn-primary {
  color: #fff !important;
}

.ps__rail-y {
  z-index: 5;
}

select {
  -webkit-appearance: none;
  border-radius: 0;
}
</style>
