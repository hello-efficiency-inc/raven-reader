<p align="center">
    <a href="https://github.com/mrgodhani/rss-reader">
        <img alt="raven reader logo" src="https://github.com/mrgodhani/rss-reader/blob/master/raven-logo.png?raw=true" width="400">
    </a>
</p>

<p align="center">
    <strong>All your articles in one place. Beautiful.</strong>
</p>

<p align="center">
<img src="https://img.shields.io/github/package-json/v/hello-efficiency-inc/raven-reader">    
<a href="https://travis-ci.org/mrgodhani/raven-reader">
<img src="https://travis-ci.org/mrgodhani/raven-reader.svg?branch=master">
</a>
<a href="https://david-dm.org/hello-efficiency-inc/raven-reader" title="dependencies status">
<img src="https://david-dm.org/hello-efficiency-inc/raven-reader/status.svg"/>
</a>
<a href="https://david-dm.org/hello-efficiency-inc/raven-reader?type=dev" title="devDependencies status">
<img src="https://david-dm.org/hello-efficiency-inc/raven-reader/dev-status.svg"/></a>
<a title="MadeWithVueJs.com Shield" href="https://madewithvuejs.com/p/rss-reader-v2-0/shield-link"> <img src="https://madewithvuejs.com/storage/repo-shields/12-shield.svg"/></a>
</p>

## Download
To download, please visit https://ravenreader.app.

## Install via Homebrew (macOS)
To use Homebrew-Cask you just need to have [Homebrew](https://brew.sh/) installed.

```bash
brew cask install raven-reader
```


![darkscreenshot](/darkscreenshot.png)

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
- [x] Windows support
- [x] Linux support
- [x] Offline reading
- [x] Keyboard Shortcuts
- [x] Sidebar count
- [x] Text size configuration
- [x] Text font style configuration (Currently has Playfair Display, Muli, Open Sans and Roboto Slab)
- [x] Supports categorizing of the feeds. 
- [x] macOS touchbar shortcuts
- [x] Integration with read it later apps: Pocket, Instapaper
- [x] Podcast support. Subscribe to podcast rss feed and listen within app.

Please feel free to suggest more ideas to improve this app.


## Developer Notes

#### Build Setup

``` bash

# copy config.example.js in renderer to config.js by executing cp config.example.js config.js and set Mercury parser token
cp src/renderer/config.example.js src/renderer/config.js

# install dependencies
yarn install

# serve with hot reload at localhost:9080
yarn dev

# build electron application for production
yarn build


# lint all JS/Vue component files in `src/`
yarn run lint

```

For more documentation please follow link from [Electron Vue](https://simulatedgreg.gitbooks.io/electron-vue/content/)

## Powered by

- [Electron Vue](https://github.com/SimulatedGREG/electron-vue)
- [Bootstrap](https://getbootstrap.com)
- [Vue](https://www.vuejs.org) & [Vuex](https://vuex.vuejs.org)
- [NeDB](https://github.com/louischatriot/nedb)
- [Mercury Parser](https://mercury.postlight.com/web-parser/)


## License
[MIT](https://github.com/mrgodhani/rss-reader/blob/master/LICENSE)