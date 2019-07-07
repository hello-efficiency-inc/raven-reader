<p align="center">
    <a href="https://github.com/mrgodhani/rss-reader">
        <img alt="raven reader logo" src="https://github.com/mrgodhani/rss-reader/blob/master/raven-logo.png?raw=true" width="400">
    </a>
</p>

<p align="center">
    <strong>Simple Desktop RSS Reader made using VueJS</strong>
</p>

<p align="center">
<a href="https://travis-ci.org/mrgodhani/raven-reader">
<img src="https://travis-ci.org/mrgodhani/raven-reader.svg?branch=master">
</a>
<a href="https://codeclimate.com/github/mrgodhani/raven-reader/maintainability">
<img src="https://api.codeclimate.com/v1/badges/b19f2a2aaaeae1f85910/maintainability" />
</a>
<a href="https://david-dm.org/mrgodhani/raven-reader" title="dependencies status">
<img src="https://david-dm.org/mrgodhani/raven-reader/status.svg"/>
</a>
<a href="https://david-dm.org/mrgodhani/raven-reader?type=dev" title="devDependencies status">
<img src="https://david-dm.org/mrgodhani/raven-reader/dev-status.svg"/></a>
<a title="MadeWithVueJs.com Shield" href="https://madewithvuejs.com/p/rss-reader-v2-0/shield-link"> <img src="https://madewithvuejs.com/storage/repo-shields/12-shield.svg"/></a>
<a href="https://app.fossa.io/projects/git%2Bgithub.com%2Fmrgodhani%2Fraven-reader?ref=badge_shield" alt="FOSSA Status"><img src="https://app.fossa.io/api/projects/git%2Bgithub.com%2Fmrgodhani%2Fraven-reader.svg?type=shield"/></a>
 <img src="https://opencollective.com/ravenreader/tiers/backer/badge.svg?label=backer&color=brightgreen" />
 <img src="https://opencollective.com/ravenreader/tiers/sponsor/badge.svg?label=sponsor&color=brightgreen" />
</p>

![newscreenshot](/newscreenshot.png)
![darkscreenshot](/darkscreenshot.png)

## Download

To download, please visit [https://github.com/mrgodhani/rss-reader/releases](https://github.com/mrgodhani/rss-reader/releases)

<a href="https://snapcraft.io/raven-reader">
  <img alt="Get it from the Snap Store" src="https://snapcraft.io/static/images/badges/en/snap-store-black.svg" />
</a>

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
- [x] Inoreader Integration
- [x] Sidebar count

## Roadmap
- [x] New brand name and icons
- [x] Text configuration
- [ ] Supporting authenticated feeds
- [ ] Feedly synchronization
- [ ] Web app
- [x] Pocket Integration
- [ ] Moving to web based. Reason: NeDB won't be scalable and handle large datasets? Or look for different local db.

Please feel free to suggest more ideas to improve this app.


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
cp src/renderer/config.example.js src/renderer/config.js

```

For more documentation please follow link from [Electron Vue](https://simulatedgreg.gitbooks.io/electron-vue/content/)

## Powered by

- [Electron Vue](https://github.com/SimulatedGREG/electron-vue)
- [Bootstrap](https://getbootstrap.com)
- [Vue](https://www.vuejs.org) & [Vuex](https://vuex.vuejs.org)
- [NeDB](https://github.com/louischatriot/nedb)
- [Mercury Parser](https://mercury.postlight.com/web-parser/)


## Support / Contribution

Please feel free to give us suggestions or report a bug by creating a [new issue](https://github.com/mrgodhani/rss-reader/issues) via Github or messaging on  Twitter: [@mrgodhani](https://twitter.com/mrgodhani).

- Thank you Adi Ofir from [Break and Enter](https://www.breakenter.com) for the amazing logo and icons.

Support us by backing us or sponsoring to continue maintaining this app and activities.

- [Become a backer or sponsor on OpenCollective.](https://opencollective.com/ravenreader)

## License
[MIT](https://github.com/mrgodhani/rss-reader/blob/master/LICENSE)


[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fmrgodhani%2Fraven-reader.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2Fmrgodhani%2Fraven-reader?ref=badge_large)
