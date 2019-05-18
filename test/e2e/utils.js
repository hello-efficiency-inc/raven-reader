import electron from 'electron'
import { Application } from 'spectron'

export default {
  app: null,
  waitUntilWindowLoaded () {
    return this.app.client.waitUntilWindowLoaded(20000);
  },
  after () {
    return this.app.stop()
  },
  async before () {    
    this.app = new Application({
      path: electron,
      args: ['dist/electron/main.js']
    })

    await this.app.start()
    await this.app.browserWindow.maximize()
    return this.waitUntilWindowLoaded()    
  }
}
