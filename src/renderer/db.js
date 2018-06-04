import jetpack from 'fs-jetpack'
import fs from 'fs'
import DataStore from 'nedb'
import {remote} from 'electron'

export default class {
  constructor () {
    this.db = null
    this.useDataDir = jetpack.cwd(remote.app.getPath('userData'))
  }

  createOrReadDatabase (db) {
    const existsArticle = fs.existsSync(this.userDataDir.path(db.article))
    const existsCategory = fs.existsSync(this.useDataDir.path(db.categories))
    const existsFeed = fs.existsSync(this.useDataDir.path(db.feed))
    const existsRecentReads = fs.existsSync(this.useDataDir.path(db.recentreads))
    let database = {}

    if (!existsArticle && !existsCategory && !existsFeed && !existsRecentReads) {
      this.useDataDir.write(db.article)
      this.useDataDir.write(db.categories)
      this.useDataDir.write(db.feed)
      this.useDataDir.write(db.recentreads)
    }

    database.article = new DataStore({
      filename: this.useDataDir.path(db.article),
      autoload: true
    })

    database.category = new DataStore({
      filename: this.useDataDir.path(db.categories),
      autoload: true
    })

    database.feed = new DataStore({
      filename: this.useDataDir.path(db.feed),
      autoload: true
    })

    database.recentreads = new DataStore({
      filename: this.useDataDir.path(db.recentreads),
      autoload: true
    })

    return database
  }

  init () {
    if (this.db) {
      return this.db
    }

    this.db = this.createOrReadDatabase({
      'article': 'articles.db',
      'categories': 'tags.db',
      'feed': 'feeds.db',
      'recentreads': 'recentreads.db'
    })
  }
}
