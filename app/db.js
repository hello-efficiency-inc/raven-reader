import jetpack from 'fs-jetpack'
import fs from 'fs'
import DataStore from 'nedb'
import { remote } from 'electron'

export default class {
  constructor () {
    this.db = null
    this.useDataDir = jetpack.cwd(remote.app.getPath('userData'))
  }

  createOrReadDatabase (dbname) {
    let yesArticle = fs.existsSync(this.useDataDir.path(dbname.article))
    let yesTag = fs.existsSync(this.useDataDir.path(dbname.tag))
    let yesFeed = fs.existsSync(this.useDataDir.path(dbname.feed))
    if (yesArticle && yesTag && yesFeed) {
      let articleData = fs.readFileSync(this.useDataDir.path(dbname.article))
      let tagData = fs.readFileSync(this.useDataDir.path(dbname.tag))
      let feedData = fs.readFileSync(this.useDataDir.path(dbname.feed))
      let database = {}

      if (!articleData && !tagData && !feedData) {
        return
      }

      database.article = new DataStore({
        filename: this.useDataDir.path(dbname.article),
        autoload: true
      })
      database.tag = new DataStore({
        filename: this.useDataDir.path(dbname.tag),
        autoload: true
      })
      database.feed = new DataStore({
        filename: this.useDataDir.path(dbname.feed),
        autoload: true
      })
      return database
    } else {
      try {
        this.useDataDir.write(dbname.article)
        this.useDataDir.write(dbname.tag)
        this.useDataDir.write(dbname.feed)

        let database = {}

        database.article = new DataStore({
          filename: this.useDataDir.path(dbname.article),
          autoload: true
        })
        database.tag = new DataStore({
          filename: this.useDataDir.path(dbname.tag),
          autoload: true
        })
        database.feed = new DataStore({
          filename: this.useDataDir.path(dbname.feed),
          autoload: true
        })
        return database
      } catch (e) {
        console.log(e)
      }
    }
  }

  init () {
    if (this.db) {
      return this.db
    }
    this.db = this.createOrReadDatabase({
      'article': 'articles.db',
      'tag': 'tags.db',
      'feed': 'feeds.db'
    })
    return this.db
  }
}
