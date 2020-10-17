import * as database from '../../db'

const actions = {
  async initializeDB () {
    await database.init()
    await database.migrateNeDB()
  }
}

export default {
  actions
}
