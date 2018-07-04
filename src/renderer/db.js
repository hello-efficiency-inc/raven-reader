import jetpack from 'fs-jetpack'
import fs from 'fs'
import DataStore from 'nedb'
import {remote} from 'electron'

export default class {
  constructor () {
    this.db = null
    this.useDataDir = jetpack.cwd(remote.app.getPath('home'))
  }

  createOrReadDatabase (db) {
    const existsDir = jetpack.exists(this.useDataDir.path('.rss-reader'))
    if (!existsDir) {
      fs.mkdir(this.useDataDir.path('.rss-reader'))
    }
    const existsArticle = fs.existsSync(this.useDataDir.path(`.rss-reader/${db.article}`))
    const existsFeed = fs.existsSync(this.useDataDir.path(`.rss-reader/${db.feed}`))
    let database = {}

    if (!existsArticle && !existsFeed) {
      this.useDataDir.write(this.useDataDir.path(`.rss-reader/${db.article}`), '')
      this.useDataDir.write(this.useDataDir.path(`.rss-reader/${db.feed}`), '')
    }

    database.article = new DataStore({
      filename: this.useDataDir.path(`.rss-reader/${db.article}`),
      autoload: true
    })

    database.feed = new DataStore({
      filename: this.useDataDir.path(`.rss-reader/${db.feed}`),
      autoload: true
    })

    return database
  }

  init () {
    if (this.db) {
      return this.db
    }

    this.db = this.createOrReadDatabase({
      article: 'articles.db',
      feed: 'feeds.db'
    })

    return this.db
  }
}
