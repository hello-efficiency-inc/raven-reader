import DataStore from 'nedb'

export default class {
  constructor () {
    this.db = null
    this.useDataDir = window.jetpack.cwd(window.electron.remote.app.getPath('home'))
  }

  createOrReadDatabase (db) {
    const dirName = process.env.NODE_ENV === 'development' ? '.rss-reader-dev' : '.rss-reader'
    const existsDir = window.jetpack.exists(this.useDataDir.path(dirName))
    if (!existsDir) {
      window.fs.mkdir(this.useDataDir.path(`${dirName}`), (err) => {
        if (err) {
          window.log.info(err)
        }
      })
    }
    const existsArticle = window.fs.existsSync(this.useDataDir.path(`${dirName}/${db.article}`))
    const existsFeed = window.fs.existsSync(this.useDataDir.path(`${dirName}/${db.feed}`))
    const existsCategory = window.fs.existsSync(this.useDataDir.path(`${dirName}/${db.category}`))
    const database = {}

    if (!existsArticle && !existsFeed && !existsCategory) {
      this.useDataDir.write(this.useDataDir.path(`${dirName}/${db.article}`), '')
      this.useDataDir.write(this.useDataDir.path(`${dirName}/${db.feed}`), '')
      this.useDataDir.write(this.useDataDir.path(`${dirName}/${db.category}`), '')
    }

    database.article = new DataStore({
      filename: this.useDataDir.path(`${dirName}/${db.article}`),
      autoload: true,
      timestampData: true
    })

    database.feed = new DataStore({
      filename: this.useDataDir.path(`${dirName}/${db.feed}`),
      autoload: true,
      timestampData: true
    })

    database.category = new DataStore({
      filename: this.useDataDir.path(`${dirName}/${db.category}`),
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
