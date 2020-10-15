import lf from 'lovefield'

const schemaBuilder = lf.schema.create('raven', 1)

schemaBuilder.createTable('feeds')
  .addColumn('id', lf.Type.INTEGER)
  .addColumn('uuid', lf.Type.STRING)
  .addColumn('link', lf.Type.STRING)
  .addColumn('xmlurl', lf.Type.STRING)
  .addColumn('favicon', lf.Type.STRING)
  .addColumn('description', lf.Type.STRING)
  .addColumn('title', lf.Type.STRING)
  .addColumn('category', lf.Type.STRING)
  .addPrimaryKey(['id'])
  .addUnique('unique_uuid', ['uuid'])
  .addNullable(['description', 'category', 'link'])

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
  .addColumn('publishUnix', lf.Type.INTEGER)
  .addPrimaryKey(['id'])
  .addUnique('unique_uuid', ['uuid'])
  .addNullable(['content', 'contentSnippet', 'author', 'category'])

schemaBuilder.createTable('categories')
  .addColumn('id', lf.Type.INTEGER)
  .addColumn('title', lf.Type.STRING)
  .addColumn('type', lf.Type.STRING)
  .addPrimaryKey(['id'])

export let database
export let feedTable
export let articleTable
export let categoryTable

export async function init () {
  database = await schemaBuilder.connect()
  feedTable = database.getSchema().table('feeds')
  articleTable = database.getSchema().table('articles')
  categoryTable = database.getSchema().table('categories')
}
