import jetpack from 'fs-jetpack'
import fs from 'fs'
import DataStore from 'nedb'
import { remote } from 'electron'

export default class {
  constructor () {
    this.db = null
    this.useDataDir = jetpack.cwd(remote.app.getPath('userData'))
  }

  createOrReadDatabase (db) {
    const hasArticle = fs.existsSync(this.useDataDir.path(db.article))
    const hasCategory = fs.existsSync(this.useDataDir.path(db.category))
    const hasFeed = fs.existsSync(this.useDataDir.path(db.feed))
    const database = {}

    if (!hasArticle && !hasCategory && !hasFeed) {
      this.useDataDir.write(db.article, '')
      this.useDataDir.write(db.category, '')
      this.useDataDir.write(db.feed, '')
    }

    database.article = new DataStore({
      filename: this.useDataDir.path(db.article),
      autoload: true
    })

    database.category = new DataStore({
      filename: this.useDataDir.path(db.category),
      autoload: true
    })

    database.feed = new DataStore({
      filename: this.useDataDir.path(db.feed),
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
      feed: 'feeds.db',
      category: 'category.db'
    })

    return this.db
  }
}
