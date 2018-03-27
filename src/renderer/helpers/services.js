import DB from '../db'
import got from 'got'
import { remote } from 'electron'
import jetpack from 'fs-jetpack'
import uuid from 'uuid/v5'

const db = new DB()
const connect = db.init()
const article = connect.article
const category = connect.category
const feed = connect.feed

export default {
  addFeed (data, cb) {
    return feed.insert(data, (err, docs) => {
      if (err) {
      }
      return cb(docs)
    })
  },
  fetchFeeds (cb) {
    feed.find({}, (err, docs) => {
      if (err) {
      }
      return cb(docs)
    })
  },
  fetchArticles (cb) {
    return article.find({}).sort({ pubDate: -1 }).exec((err, docs) => {
      if (err) {
      }
      cb(docs)
    })
  },
  addArticles (data, cb) {
    const id = uuid(data.link, uuid.URL)
    const filename = `${id}.html`
    const useDataDirStreams = jetpack.cwd(`${remote.app.getPath('userData')}/streams/`)
    if (!jetpack.exists(useDataDirStreams.path(filename))) {
      try {
        got.stream(data.link).pipe(useDataDirStreams.createWriteStream(filename))
        data.file = useDataDirStreams.path(filename)
      } catch (e) {
      }
    }
    return article.insert(data, (err, docs) => {
      if (err) {
      }
      return cb(docs)
    })
  },
  fetchCategories (cb) {
    return category.find({}, (err, docs) => {
      if (err) {
      }
      return cb(docs)
    })
  },
  addCategory (data, cb) {
    return category.insert(data, (err, docs) => {
      if (err) {
      }
      return cb(docs)
    })
  },
  deleteCategory (id, cb) {
    return category.remove({ _id: id }, {}, (err, numRemoved) => {
      if (err) {}
      cb(numRemoved)
    })
  }
}
