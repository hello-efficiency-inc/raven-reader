import lf from 'lovefield'
import db from './services/db'
import DataStore from 'nedb'

const schemaBuilder = lf.schema.create('raven', 4)

schemaBuilder.createTable('feeds')
  .addColumn('id', lf.Type.INTEGER)
  .addColumn('uuid', lf.Type.STRING)
  .addColumn('link', lf.Type.STRING)
  .addColumn('xmlurl', lf.Type.STRING)
  .addColumn('favicon', lf.Type.STRING)
  .addColumn('description', lf.Type.STRING)
  .addColumn('title', lf.Type.STRING)
  .addColumn('category', lf.Type.STRING)
  .addColumn('source', lf.Type.STRING)
  .addColumn('source_id', lf.Type.STRING)
  .addPrimaryKey(['id'], true)
  .addNullable(['description', 'category', 'link', 'source', 'source_id'])

schemaBuilder.createTable('articles')
  .addColumn('id', lf.Type.INTEGER)
  .addColumn('uuid', lf.Type.STRING)
  .addColumn('title', lf.Type.STRING)
  .addColumn('link', lf.Type.STRING)
  .addColumn('pubDate', lf.Type.STRING)
  .addColumn('author', lf.Type.STRING)
  .addColumn('content', lf.Type.STRING)
  .addColumn('contentSnippet', lf.Type.STRING)
  .addColumn('favourite', lf.Type.BOOLEAN)
  .addColumn('read', lf.Type.BOOLEAN)
  .addColumn('podcast', lf.Type.BOOLEAN)
  .addColumn('played', lf.Type.BOOLEAN)
  .addColumn('offline', lf.Type.BOOLEAN)
  .addColumn('feed_uuid', lf.Type.STRING)
  .addColumn('category', lf.Type.STRING)
  .addColumn('enclosure', lf.Type.OBJECT)
  .addColumn('itunes', lf.Type.OBJECT)
  .addColumn('publishUnix', lf.Type.INTEGER)
  .addColumn('source', lf.Type.STRING)
  .addColumn('source_id', lf.Type.STRING)
  .addColumn('keep_read', lf.Type.INTEGER)
  .addPrimaryKey(['id'], true)
  .addNullable(['source', 'source_id', 'content', 'contentSnippet', 'author', 'category', 'pubDate', 'link', 'itunes', 'enclosure', 'keep_read'])

schemaBuilder.createTable('categories')
  .addColumn('id', lf.Type.INTEGER)
  .addColumn('title', lf.Type.STRING)
  .addColumn('type', lf.Type.STRING)
  .addColumn('source', lf.Type.STRING)
  .addPrimaryKey(['id'], true)
  .addNullable(['source'])

schemaBuilder.createTable('pruned')
  .addColumn('id', lf.Type.INTEGER)
  .addColumn('uuid', lf.Type.STRING)
  .addPrimaryKey(['id'], true)

export let database
export let feedTable
export let articleTable
export let categoryTable
export let pruneTable

export async function init () {
  database = await schemaBuilder.connect({
    onUpgrade: function (rawDb) {
      const ver = rawDb.getVersion()
      console.log(`updating to database v${ver}`)
      return Promise.resolve().then(() => {
        return rawDb.addTableColumn('feeds', 'source', 'local')
          .then(() => {
            return rawDb.addTableColumn('articles', 'source', 'local')
          }).then(() => {
            return rawDb.addTableColumn('categories', 'source', 'local')
          }).then(() => {
            return rawDb.addTableColumn('articles', 'source_id', null)
          }).then(() => {
            return rawDb.addTableColumn('articles', 'keep_read', null)
          }).then(() => {
            return rawDb.addTableColumn('feeds', 'source_id', null)
          })
      }).then(() => {
        // have it as the last element of the promise chain
        return rawDb.dump()
      })
    }
  })
  feedTable = database.getSchema().table('feeds')
  articleTable = database.getSchema().table('articles')
  categoryTable = database.getSchema().table('categories')
  pruneTable = database.getSchema().table('pruned')
}

export function migrateNeDB () {
  const article = new DataStore({
    filename: 'articles.db',
    autoload: true,
    timestampData: true
  })

  const feed = new DataStore({
    filename: 'feeds.db',
    autoload: true,
    timestampData: true
  })

  const category = new DataStore({
    filename: 'categories.db',
    autoload: true,
    timestampData: true
  })

  article.find({}, (err, docs) => {
    if (err) { window.log.info(err) }
    if (docs.length > 0) {
      db.addArticles(docs.map(item => articleTable.createRow(item)))
    }
  })

  feed.find({}, (err, docs) => {
    if (err) {
      window.log.info(err)
    }
    if (docs.length > 0) {
      db.addFeed(docs.map(item => feedTable.createRow(item)))
    }
  })

  category.find({}, (err, docs) => {
    if (err) {
      window.log.info(err)
    }
    if (docs.length > 0) {
      db.addCategory(docs.map(item => categoryTable.createRow(item)))
    }
  })
}
