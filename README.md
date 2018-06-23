# RSS Reader

> Simple Desktop RSS Reader made using VueJS

<p align="left">
<a href="https://travis-ci.org/mrgodhani/rss-reader">
<img src="https://travis-ci.org/mrgodhani/rss-reader.svg?branch=master">
</a>
<a href="https://codeclimate.com/github/mrgodhani/rss-reader/maintainability"><img src="https://api.codeclimate.com/v1/badges/8d9991777a7a3c4b4de5/maintainability" />
</a>
<a href="https://david-dm.org/mrgodhani/rss-reader" title="dependencies status">
<img src="https://david-dm.org/mrgodhani/rss-reader/status.svg"/>
</a>
<a href="https://david-dm.org/mrgodhani/rss-reader?type=dev" title="devDependencies status">
<img src="https://david-dm.org/mrgodhani/rss-reader/dev-status.svg"/></a>
</p>

![screenshot](/screenshot.png)

## Download

To download, please visit [https://github.com/mrgodhani/rss-reader/releases](https://github.com/mrgodhani/rss-reader/releases)

## Features

- [x] Full Article Read
- [x] Subscribing to news feed
- [x] Marking as read/unread
- [x] Marking as favourite
- [x] Open article link in external browser
- [x] Responsive
- [ ] Exporting feed in OPML format
- [ ] Offline reading
- [ ] Windows support


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

# copy config.example.js in renderer to config.js by executing cp config.example.js config.js and set Mercury parser token
cd src/renderer/config.example.js config.js

```

## Powered by

- [Electron Vue](https://github.com/SimulatedGREG/electron-vue)
- [Vue](https://www.vuejs.org) & [Vuex](https://vuex.vuejs.org)
- [NeDB](https://github.com/louischatriot/nedb)
- [Mercury Parser](https://mercury.postlight.com/web-parser/)


## Support / Contribution

Please feel free to give us suggestions or report a bug by creating a [new issue](https://github.com/mrgodhani/rss-reader/issues) via Github or messaging on  Twitter: [@mrgodhani](https://twitter.com/mrgodhani).

## License
[MIT](https://github.com/mrgodhani/rss-reader/blob/master/LICENSE)
