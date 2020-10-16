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
  fetchArticlesByFeedMulti (feedIds) {
    return db.database
      .select()
      .from(db.articleTable)
      .where(db.articleTable.feed_uuid.in(feedIds))
      .exec()
  },
  addFeed (data) {
    return db.database.insertOrReplace().into(db.feedTable).values(data).exec()
  },
  deleteFeed (feedId) {
    return db.database.delete().from(db.feedTable).where(db.feedTable.uuid.eq(feedId)).exec()
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
  deleteArticles (feedId) {
    return db.database.delete().from(db.articleTable).where(db.articleTable.feed_uuid.eq(feedId)).exec()
  },
  fetchArticle (uuid) {
    return db.database.select()
      .from(db.articleTable)
      .innerJoin(db.feedTable, db.feedTable.uuid.eq(db.articleTable.feed_uuid))
      .where(db.articleTable.uuid.eq(uuid))
      .exec()
  },
  updateArticleCategory (uuid, category) {
    return db.database.update(db.articleTable)
      .set(db.articleTable.category, category)
      .where(db.articleTable.uuid.eq(uuid))
      .exec()
  },
  addCategory (data) {
    return db.database.insertOrReplace().into(db.categoryTable).values(data).exec()
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
  markOffline (uuid, verdict) {
    return db.database.update(db.articleTable)
      .set(db.articleTable.offline, verdict)
      .where(db.articleTable.uuid.eq(uuid))
      .exec()
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
      .where(db.articleTable.uuid.in(uuids))
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
}
