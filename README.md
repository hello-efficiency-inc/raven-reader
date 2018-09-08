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

![newscreenshot](/newscreenshot.png)
![darkscreenshot](/darkscreenshot.png)

## Download

To download, please visit [https://github.com/mrgodhani/rss-reader/releases](https://github.com/mrgodhani/rss-reader/releases)

Coming soon on Apple App Store.

## Features

- [x] Full Article Read
- [x] Subscribing to news feed
- [x] Marking as read/unread
- [x] Marking as favourite
- [x] Dark mode
- [x] Configurable cron job for refresh interval of feeds
- [x] Minimize app to tray and run in background
- [x] Open article link in external browser
- [x] Responsive
- [x] Exporting feed in OPML format
- [x] Importing feeds
- [ ] Offline reading
- [x] Windows support
- [ ] Linux support


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
cp src/renderer/config.example.js config.js

```

## Powered by

- [Electron Vue](https://github.com/SimulatedGREG/electron-vue)
- [Bootstrap](https://getbootstrap.com)
- [Vue](https://www.vuejs.org) & [Vuex](https://vuex.vuejs.org)
- [NeDB](https://github.com/louischatriot/nedb)
- [Mercury Parser](https://mercury.postlight.com/web-parser/)


## Support / Contribution

Please feel free to give us suggestions or report a bug by creating a [new issue](https://github.com/mrgodhani/rss-reader/issues) via Github or messaging on  Twitter: [@mrgodhani](https://twitter.com/mrgodhani).

For further support and keep this app maintained you could also buy me a coffee.

<p><a href="https://www.buymeacoffee.com/vXlonHais" target="_blank"><img src="https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png" alt="Buy Me A Coffee" style="height: auto !important;width: auto !important;" ></a></p>

## License
[MIT](https://github.com/mrgodhani/rss-reader/blob/master/LICENSE)
