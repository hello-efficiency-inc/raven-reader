import DataStore from 'nedb'

export default class {
  constructor () {
    this.db = null
  }

  createOrReadDatabase (db) {
    const database = {}
    database.article = new DataStore({
      filename: db.article,
      autoload: true,
      timestampData: true
    })

    database.feed = new DataStore({
      filename: db.feed,
      autoload: true,
      timestampData: true
    })

    database.category = new DataStore({
      filename: db.category,
      autoload: true,
      timestampData: true
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
      category: 'categories.db'
    })

    return this.db
  }
}
