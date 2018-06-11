import DB from '../db'

const db = new DB()
const connect = db.init()
const article = connect.article
const feed = connect.feed

export default {
  fetchFeeds (cb) {
    return feed.find({}, (err, docs) => {
      if (err) {}
      return cb(docs)
    })
  },
  fetchArticles (cb) {
    return article.find({}).sort({ pubDate: -1 }).exec((err, docs) => {
      if (err) {}
      cb(docs)
    })
  },
  addFeed (data, cb) {
    return feed.insert(data, (err, docs) => {
      if (err) {}
      return cb(docs)
    })
  },
  addArticles (data, cb) {
    return article.insert(data, (err, docs) => {
      if (err) {}
      return cb(docs)
    })
  }
}
