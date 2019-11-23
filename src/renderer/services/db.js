import DB from '../db'

const db = new DB()
const connect = db.init()
const article = connect.article
const feed = connect.feed
const category = connect.category
const accounts = connect.accounts

export default {
  ensureIndex (db, field) {
    db.ensureIndex({ fieldName: field, unique: true }, (err) => {
      if (err) {}
    })
  },
  fetchAccounts (cb) {
    return accounts.find({}, (err, docs) => {
      if (err) {}
      return cb(docs)
    })
  },
  fetchAccount (workspace, cb) {
    return accounts.find({ workspace: workspace }, (err, docs) => {
      if (err) {}
      return cb(docs)
    })
  },
  addAccounts (data, cb) {
    this.ensureIndex(accounts, 'id')
    return accounts.insert(data, (err, docs) => {
      if (err) {
        cb(err)
      }
      return cb(null, docs)
    })
  },
  fetchFeed (data, cb) {
    feed.find({
      feed_id: data
    }, (err, docs) => {
      if (err) {}
      return cb(docs)
    })
  },
  fetchFeeds (id = null, cb) {
    const query = {
      workspace: id
    }
    return feed.find(query, (err, docs) => {
      if (err) {
        console.log(err)
      }
      if (cb) {
        cb(docs)
      }
    })
  },
  fetchArticles (id = null, cb) {
    const query = {
      workspace: id
    }
    return article.find(query).sort({ pubDate: -1 }).exec((err, docs) => {
      if (err) {}
      if (cb) {
        cb(docs)
      }
    })
  },
  fetchArticle (id, cb) {
    return article.findOne({ _id: id }, (err, doc) => {
      if (err) {}
      return cb(doc)
    })
  },
  fetchCategories (id = null, cb) {
    const query = {
      workspace: id
    }
    return category.find(query, (err, docs) => {
      if (err) {}
      if (cb) {
        return cb(docs)
      }
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
  updateArticlesRead (workspace, items) {
    article.update({
      workspace: workspace,
      id: {
        $nin: items
      }
    }, {
      $set: {
        read: true
      }
    }, {
      multi: true
    }, (err, docs) => {
      if (err) {}
    })
  },
  updateArticlesStarred (workspace, items) {
    article.update({
      workspace: workspace,
      id: {
        $in: items
      }
    }, {
      $set: {
        favourite: true
      }
    }, {
      multi: true
    }, (err, docs) => {
      if (err) {}
    })
  },
  updateArticlesUnread (workspace, items) {
    article.update({
      workspace: workspace,
      id: {
        $in: items
      }
    }, {
      $set: {
        read: false
      }
    }, {
      multi: true
    }, (err, docs) => {
      if (err) {}
    })
  }
}
