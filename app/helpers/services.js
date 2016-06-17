import DB from '../db'
let db = new DB()
let connect = db.init()
let article = connect.article
let tag = connect.tag
let feed = connect.feed

export default {
  addFeed (feedData, callback) {
    feed.insert(feedData, (err, docs) => {
      if (err) {
      }
      return callback(docs)
    })
  },
  deleteFeed (title) {
    feed.remove({ _id: title }, {}, (err, num) => {
      if (err) {}
    })
  },
  addArticles (articleData, callback) {
    article.insert(articleData, (err, docs) => {
      if (err) {
      }
      return callback(docs)
    })
  },
  deleteArticle (id) {
    article.remove({_id: id}, {}, (err, numRemoved) => {
      if (err) {}
    })
  },
  checkFeed (feedName, callback) {
    feed.count({ title: feedName }, (err, count) => {
      if (err) {
      }
      return callback(count)
    })
  },
  fetchFeeds () {
    return new Promise((resolve, reject) => {
      feed.find({}, (err, docs) => {
        if (err) {
        }
        resolve(docs)
      })
    })
  },
  fetchSpecific (title) {
    return new Promise((resolve, reject) => {
      feed.find({title: title}, (err, docs) => {
        if (err) {
        }
        resolve(docs)
      })
    })
  },
  fetchArticles () {
    return new Promise((resolve, reject) => {
      article.find({}).sort({ pubDate: -1 }).exec((err, docs) => {
        if (err) {
        }
        resolve(docs)
      })
    })
  },
  fetchOneArticle (id) {
    return new Promise((resolve, reject) => {
      article.findOne({_id: id}, (err, doc) => {
        if (err) {}
        return resolve(doc)
      })
    })
  },
  favouriteArticle (id) {
    article.update({ _id: id }, { $set: { favourite: true } }, (err, num) => {
      if (err) {}
    })
  },
  unFavouriteArticle (id) {
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
  },
  updateFeedCount (id, count) {
    feed.update({ _id: id }, { $set: { count: count } }, (err, num) => {
      if (err) {}
    })
  },
  fetchTags () {
    return new Promise((resolve, reject) => {
      tag.find({}).sort({id: 1}).exec((err, docs) => {
        if (err) {}
        resolve(docs)
      })
    })
  },
  addTag (value, callback) {
    tag.insert(value, (err, docs) => {
      if (err) {}
      return callback(docs)
    })
  },
  updateTag (value, id) {
    article.update({_id: id}, { $set: { tags: value } }, (err, num) => {
      if (err) {}
    })
  },
  deleteTag (id) {
    tag.remove({ _id: id }, {}, (err, num) => {
      if (err) {
      }
    })
  }
}
