import DB from '../db'

const db = new DB()
const connect = db.init()
const article = connect.article
const feed = connect.feed
const category = connect.category

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
  fetchCategories (cb) {
    return category.find({}, (err, docs) => {
      if (err) {}
      return cb(docs)
    })
  },
  deleteCategory (title) {
    category.remove({ title: title }, {}, (err, numRemoved) => {
      if (err) {}
    })
  },
  addCategory (data, cb) {
    this.ensureIndex(category, 'title')
    return category.insert(data, (err, docs) => {
      if (err) {}
      return cb(docs)
    })
  },
  updateCategory (id, title, cb) {
    return category.update({
      _id: id
    }, {
      $set: {
        title: title
      }
    }, (err, num) => {
      if (err) {
        console.log(err)
      }
    })
  },
  addFeed (data, cb) {
    this.ensureIndex(feed, 'xmlurl')
    return feed.insert(data, (err, docs) => {
      if (err) {}
      return cb(docs)
    })
  },
  updateFeedTitle (id, title, category) {
    feed.update({
      id: id
    }, {
      $set: {
        title: title,
        category: category
      }
    }, (err, num) => {
      if (err) {
        console.log(err)
      }
    })
  },
  updateFeedCategory (id, category) {
    feed.update({
      id: id
    }, {
      $set: {
        category: category
      }
    }, {
      multi: true
    }, (err, num) => {
      if (err) {
        console.log(err)
      }
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
      if (err) {
        console.log(err)
      }
      return cb(docs)
    })
  },
  updateArticleFeedTitle (id, title, category) {
    article.update({
      feed_id: id
    }, {
      $set: {
        feed_title: title,
        category: category
      }
    }, {
      multi: true
    }, (err, num) => {
      if (err) {
        console.log(err)
      }
    })
  },
  updateArticleCategory (id, category) {
    article.update({
      _id: id
    }, {
      $set: {
        category: category
      }
    }, {
      multi: true
    }, (err, num) => {
      if (err) {
        console.log(err)
      }
    })
  },
  deleteArticlesCategory (category) {
    article.remove({
      category: category
    }, {
      multi: true
    }, (err, numRemoved) => {
      if (err) {}
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
  markCategory (id) {
    article.update({ category: id }, { $set: { read: true } }, (err, name) => {
      if (err) {}
    })
  },
  markRead (id, podcast) {
    if (podcast) {
      article.update({
        _id: id
      }, {
        $set: {
          read: true,
          played: true
        }
      }, (err, num) => {
        if (err) {}
      })
    } else {
      article.update({
        _id: id
      }, {
        $set: {
          read: true
        }
      }, (err, num) => {
        if (err) {}
      })
    }
  },
  markUnread (id, podcast) {
    if (podcast) {
      article.update({
        _id: id
      }, {
        $set: {
          read: false,
          played: false
        }
      }, (err, num) => {
        if (err) {}
      })
    } else {
      article.update({
        _id: id
      }, {
        $set: {
          read: false
        }
      }, (err, num) => {
        if (err) {}
      })
    }
  },
  removeOldReadItems (week, cb) {
    article.remove({
      read: true,
      createdAt: {
        $lte: week
      }
    },
    {
      multi: true
    },
    (err, num) => {
      if (err) {
        window.log.error(err)
      }
      window.log.info(num)
    })
  }
}
