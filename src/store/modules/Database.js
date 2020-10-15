import * as database from '../../db'

const actions = {
  async initializeDB () {
    await database.init()
  }
}

export default {
  actions
}
