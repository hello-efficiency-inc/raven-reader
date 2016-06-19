import Feed from './feeds.js'
import queue from './queue.js'
import service from './services.js'
import {incrementCount, addArticles} from '../vuex/actions.js'
import _ from 'lodash'

export default {
  refreshfeed (title) {
    let self = this
    return new Promise((resolve, reject) => {
      if (title === 'All Articles') {
        service.fetchFeeds()
        .then((feeds) => {
          var timeout = 1000 * feeds.length
          setTimeout(() => {
            self.processFeed(feeds)
            console.log('Added new articles')
            resolve('Done')
          }, timeout)
        })
      } else {
        service.fetchSpecific(title)
        .then((feeds) => {
          let timeout = 1000 * feeds.length
          setTimeout(() => {
            self.processFeed(feeds)
            console.log('Added new articles')
            resolve('Done')
          }, timeout)
        })
      }
    })
  },
  processFeed (feeds) {
    feeds.forEach((item, index) => {
      let favicon = item.favicon
      let title = item.title
      let id = item._id
      let feed = new Feed()

      // Fetch New Articles
      feed.fetchNewArticles(item.url)
      .then((data) => {
        let newArticles = data.articles

        // Get existing articles
        service.fetchArticles()
        .then((articles) => {
          let oldArticles = articles

          //   Process each new article
          newArticles.forEach((newItem) => {
            if (_.filter(oldArticles, { title: newItem.title }).length === 0) {
              console.log('Added ' + newItem.title)
              let htmlFilename = queue.queueTask('html', newItem.link)
              newItem.feed = title
              newItem.feed_id = id
              newItem.file = htmlFilename
              newItem.read = false
              newItem.favicon = favicon
              // Add article
              addArticles(newItem)
              // Update count
              incrementCount(id)
            } else {
              console.log('not added')
            }
          })
        })
      })
    })
  }
}
