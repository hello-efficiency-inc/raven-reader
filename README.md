# RSS Reader

> Simple Desktop RSS Reader made using VueJS

<p align="left">
<a href="https://travis-ci.org/mrgodhani/rss-reader">
<img src="https://travis-ci.org/mrgodhani/rss-reader.svg?branch=master">
</a>
<a href="https://codeclimate.com/github/mrgodhani/rss-reader/maintainability"><img src="https://api.codeclimate.com/v1/badges/8d9991777a7a3c4b4de5/maintainability" />
</a>
<a href="https://david-dm.org/mrgodhani/rss-reader">
<img src="https://david-dm.org/mrgodhani/rss-reader" />
</a>
<a href="https://david-dm.org/mrgodhani/rss-reader?type=dev" title="devDependencies status">
<img src="https://david-dm.org/mrgodhani/rss-reader/dev-status.svg"/></a>
</p>

![screenshot](/screenshot.png)

## Features

- [x] Full Article Read
- [x] Subscribing to news feed
- [x] Marking as read/unread
- [x] Marking as favourite
- [x] Open article link in external browser
- [x] Responsive
- [ ] Exporting feed in OPML format
- [ ] Offline reading


## Developer Notes

#### Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:9080
npm run dev

# build electron application for production
npm run build


# lint all JS/Vue component files in `src/`
npm run lint

```

## Powered by

- [Electron Vue](https://github.com/SimulatedGREG/electron-vue)
- [Vue](https://www.vuejs.org) & [Vuex](https://vuex.vuejs.org)
- [NeDB](https://github.com/louischatriot/nedb)
- [Mercury Parser](https://mercury.postlight.com/web-parser/)
