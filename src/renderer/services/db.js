import DB from '../db'

const db = new DB()
const connect = db.init()
const article = connect.article
const feed = connect.feed

export default {
  ensureIndex (db, field) {
    db.ensureIndex({ fieldName: field, unique: true }, (err) => {
      if (err) {}
    })
  },
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
  fetchArticle (id, cb) {
    return article.findOne({ _id: id }, (err, doc) => {
      if (err) {}
      return cb(doc)
    })
  },
  addFeed (data, cb) {
    this.ensureIndex(feed, 'xmlurl')
    return feed.insert(data, (err, docs) => {
      if (err) {}
      return cb(docs)
    })
  },
  deleteFeed (id) {
    feed.remove({ id: id }, {}, (err, numRemoved) => {
      if (err) {}
    })
  },
  addArticles (data, cb) {
    this.ensureIndex(article, 'guid')
    return article.insert(data, (err, docs) => {
      if (err) {}
      return cb(docs)
    })
  },
  deleteArticles (id) {
    article.remove({ feed_id: id }, { multi: true }, (err, numRemoved) => {
      if (err) {}
    })
  },
  markOffline (id) {
    article.update({ _id: id }, { $set: { offline: true } }, (err, num) => {
      if (err) {}
    })
  },
  markOnline (id) {
    article.update({ _id: id }, { $set: { offline: false } }, (err, num) => {
      if (err) {}
    })
  },
  markFavourite (id) {
    article.update({ _id: id }, { $set: { favourite: true } }, (err, num) => {
      if (err) {}
    })
  },
  markUnfavourite (id) {
    article.update({ _id: id }, { $set: { favourite: false } }, (err, num) => {
      if (err) {}
    })
  },
  markRead (id) {
    article.update({ _id: id }, { $set: { read: true } }, (err, num) => {
      if (err) {}
    })
  },
  markUnread (id) {
    article.update({ _id: id }, { $set: { read: false } }, (err, num) => {
      if (err) {}
    })
  }
}
