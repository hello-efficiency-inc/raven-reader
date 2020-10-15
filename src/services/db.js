import lf from 'lovefield'
import * as db from '../db'

export default {
  fetchFeeds () {
    return db.database.select().from(db.feedTable).exec()
  },
  fetchArticles () {
    return db.database
      .select()
      .from(db.articleTable)
      .innerJoin(db.feedTable, db.feedTable.uuid.eq(db.articleTable.feed_uuid))
      .exec()
  },
  fetchArticlesByFeed (feedId) {
    return db.database
      .select()
      .from(db.articleTable)
      .where(db.articleTable.feed_uuid.eq(feedId))
      .exec()
  },
  addFeed (data) {
    return db.database.insertOrReplace().into(db.feedTable).values([db.feedTable.createRow(data)]).exec()
  },
  updateFeedTitle (id, title, category) {
    return db.database.update(db.feedTable)
      .set(db.feedTable.title, title)
      .set(db.feedTable.category, category)
      .where(db.feedTable.uuid.eq(id))
      .exec()
  },
  updateFeedCategory (id, category) {
    return db.database.update(db.feedTable)
      .set(db.feedTable.category, category)
      .where(db.feedTable.uuid.eq(id))
      .exec()
  },
  addArticles (data) {
    return db.database.insertOrReplace().into(db.articleTable).values(data).exec()
  },
  fetchArticle (uuid) {
    return db.database.select().from(db.articleTable).where(db.articleTable.uuid.eq(uuid)).exec()
  },
  updateArticleCategory (uuid, category) {
    return db.database.update(db.articleTable)
      .set(db.articleTable.category, category)
      .where(db.articleTable.uuid.eq(uuid))
      .exec()
  },
  addCategory (data) {
    return db.database.insertOrReplace().into(db.categoryTable).values([db.categoryTable.createRow(data)]).exec()
  },
  fetchCategories () {
    return db.database.select().from(db.categoryTable).exec()
  },
  updateCategory (id, category) {
    return db.database.update(db.categoryTable)
      .set(db.categoryTable.title, category)
      .where(db.categoryTable.id.eq(id))
      .exec()
  },
  deleteCategory (title) {
    return db.database.delete().from(db.categoryTable).where(db.categoryTable.title.eq(title)).exec()
  },
  markRead (uuid, podcast, verdict) {
    if (podcast) {
      return db.database.update(db.articleTable)
        .set(db.articleTable.read, verdict)
        .set(db.articleTable.podcast, verdict)
        .where(db.articleTable.uuid.eq(uuid))
        .exec()
    }
    return db.database.update(db.articleTable)
      .set(db.articleTable.read, verdict)
      .where(db.articleTable.uuid.eq(uuid))
      .exec()
  },
  markAllRead (uuids) {
    // Non-podcast
    db.database.update(db.articleTable)
      .set(db.articleTable.read, true)
      .where(lf.op.and(
        db.articleTable.uuid.in(uuids),
        db.articleTable.podcast.eq(false)
      ))
      .exec()
    // Podcast
    db.database.update(db.articleTable)
      .set(db.articleTable.read, true)
      .set(db.articleTable.played, true)
      .where(lf.op.and(
        db.articleTable.uuid.in(uuids),
        db.articleTable.podcast.eq(true)
      ))
      .exec()
  },
  markFavourite (uuid, verdict) {
    return db.database.update(db.articleTable)
      .set(db.articleTable.favourite, verdict)
      .where(db.articleTable.uuid.eq(uuid))
      .exec()
  },
  updateArticleFeedCategory (uuid, category) {
    return db.database.update(db.articleTable)
      .set(db.articleTable.category, category)
      .where(db.articleTable.feed_uuid.eq(uuid))
      .exec()
  },
  removeOldReadItems (week) {
    db.database.delete()
      .from(db.articleTable)
      .where(lf.op.and(
        db.articleTable.read.eq(true),
        db.articleTable.publishUnix.lt(week)
      )).exec()
  }

  // fetchArticlesByFeed (feedId, cb) {
  //   return article.find({ feed_id: feedId }).exec((err, docs) => {
  //     if (err) {
  //       window.log(err)
  //     }
  //     cb(docs)
  //   })
  // },
  // fetchArticles (cb) {
  //   return article.find({}).sort({ pubDate: -1 }).exec((err, docs) => {
  //     if (err) {
  //       window.log.info(err)
  //     }
  //     cb(docs)
  //   })
  // },
  // fetchArticle (id, cb) {
  //   return article.findOne({ _id: id }, (err, doc) => {
  //     if (err) {
  //       window.log.info(err)
  //     }
  //     return cb(doc)
  //   })
  // },
  // fetchCategories (cb) {
  //   return category.find({}, (err, docs) => {
  //     if (err) {
  //       window.log.info(err)
  //     }
  //     return cb(docs)
  //   })
  // },
  // deleteCategory (title) {
  //   category.remove({ title: title }, {}, (err, numRemoved) => {
  //     if (err) {
  //       window.log.info(err)
  //     }
  //   })
  // },
  // addCategory (data, cb) {
  //   this.ensureIndex(category, 'title')
  //   return category.insert(data, (err, docs) => {
  //     if (err) {
  //       window.log.info(err)
  //     }
  //     return cb(docs)
  //   })
  // },
  // updateCategory (id, title, cb) {
  //   return category.update({
  //     _id: id
  //   }, {
  //     $set: {
  //       title: title
  //     }
  //   }, (err, num) => {
  //     if (err) {
  //       window.log.info(err)
  //     }
  //   })
  // },
  // addFeed (data, cb) {
  //   this.ensureIndex(feed, 'xmlurl')
  //   return feed.insert(data, (err, docs) => {
  //     if (err) {
  //       window.log.info(err)
  //     }
  //     return cb(docs)
  //   })
  // },
  // updateFeedTitle (id, title, category) {
  //   feed.update({
  //     id: id
  //   }, {
  //     $set: {
  //       title: title,
  //       category: category
  //     }
  //   }, (err, num) => {
  //     if (err) {
  //       window.log.info(err)
  //     }
  //   })
  // },
  // updateFeedCategory (id, category) {
  //   feed.update({
  //     id: id
  //   }, {
  //     $set: {
  //       category: category
  //     }
  //   }, {
  //     multi: true
  //   }, (err, num) => {
  //     if (err) {
  //       window.log.info(err)
  //     }
  //   })
  // },
  // deleteFeed (id) {
  //   feed.remove({ id: id }, {}, (err, numRemoved) => {
  //     if (err) {
  //       window.log.info(err)
  //     }
  //   })
  // },
  // addArticles (data, cb) {
  //   // this.ensureIndex(article, 'guid')
  //   return article.insert(data, (err, docs) => {
  //     if (err) {
  //       window.log.info(err)
  //     }
  //     return cb(docs)
  //   })
  // },
  // updateArticleFeedTitle (id, title, category) {
  //   article.update({
  //     feed_id: id
  //   }, {
  //     $set: {
  //       feed_title: title,
  //       category: category
  //     }
  //   }, {
  //     multi: true
  //   }, (err, num) => {
  //     if (err) {
  //       window.log.info(err)
  //     }
  //   })
  // },
  // updateArticleCategory (id, category) {
  //   article.update({
  //     _id: id
  //   }, {
  //     $set: {
  //       category: category
  //     }
  //   }, {
  //     multi: true
  //   }, (err, num) => {
  //     if (err) {
  //       window.log.info(err)
  //     }
  //   })
  // },
  // deleteArticlesCategory (category) {
  //   article.remove({
  //     category: category
  //   }, {
  //     multi: true
  //   }, (err, numRemoved) => {
  //     if (err) {
  //       window.log.info(err)
  //     }
  //   })
  // },
  // deleteArticles (id) {
  //   article.remove({ feed_id: id }, { multi: true }, (err, numRemoved) => {
  //     if (err) {
  //       window.log.info(err)
  //     }
  //   })
  // },
  // markOffline (id) {
  //   article.update({ _id: id }, { $set: { offline: true } }, (err, num) => {
  //     if (err) {
  //       window.log.info(err)
  //     }
  //   })
  // },
  // markOnline (id) {
  //   article.update({ _id: id }, { $set: { offline: false } }, (err, num) => {
  //     if (err) {
  //       window.log.info(err)
  //     }
  //   })
  // },
  // markFavourite (id) {
  //   article.update({ _id: id }, { $set: { favourite: true } }, (err, num) => {
  //     if (err) {
  //       window.log.info(err)
  //     }
  //   })
  // },
  // markUnfavourite (id) {
  //   article.update({ _id: id }, { $set: { favourite: false } }, (err, num) => {
  //     if (err) {
  //       window.log.info(err)
  //     }
  //   })
  // },
  // markCategory (id) {
  //   article.update({ category: id }, { $set: { read: true } }, (err, name) => {
  //     if (err) {
  //       window.log.info(err)
  //     }
  //   })
  // },
  // markRead (id, podcast) {
  //   if (podcast) {
  //     article.update({
  //       _id: id
  //     }, {
  //       $set: {
  //         read: true,
  //         played: true
  //       }
  //     }, (err, num) => {
  //       if (err) {
  //         window.log.info(err)
  //       }
  //     })
  //   } else {
  //     article.update({
  //       _id: id
  //     }, {
  //       $set: {
  //         read: true
  //       }
  //     }, (err, num) => {
  //       if (err) {
  //         window.log.info(err)
  //       }
  //     })
  //   }
  // },
  // markUnread (id, podcast) {
  //   if (podcast) {
  //     article.update({
  //       _id: id
  //     }, {
  //       $set: {
  //         read: false,
  //         played: false
  //       }
  //     }, (err, num) => {
  //       if (err) {
  //         window.log.info(err)
  //       }
  //     })
  //   } else {
  //     article.update({
  //       _id: id
  //     }, {
  //       $set: {
  //         read: false
  //       }
  //     }, (err, num) => {
  //       if (err) {
  //         window.log.info(err)
  //       }
  //     })
  //   }
  // },
  // removeOldReadItems (week, cb) {
  //   article.remove({
  //     read: true,
  //     createdAt: {
  //       $lte: week
  //     }
  //   },
  //   {
  //     multi: true
  //   },
  //   (err, num) => {
  //     if (err) {
  //       window.log.error(err)
  //     }
  //     window.log.info(num)
  //   })
  // }
}
