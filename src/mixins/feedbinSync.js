import feedbin from '../services/feedbin'
import dayjs from 'dayjs'

export default {
  methods: {
    syncFeedbin () {
      const feedbinConnected = this.$electronstore.has('feedbin_creds')
      const date = this.$electronstore.get('feedbin_fetched_lastime')
      if (feedbinConnected) {
        const promise = Promise.all([
          feedbin.getUnreadEntries(),
          feedbin.getStarredEntries(),
          feedbin.getEntries(dayjs(date).subtract(7, 'day').toISOString())
        ])
        promise.then((res) => {
          const [unread, starred, entries] = res
          window.log.info('Processing Feedbin feeds')
          const mapped = feedbin.transformEntriesAndFeed(unread, starred, entries)
          feedbin.syncItems(mapped).then(() => {
            this.$store.dispatch('loadFeeds')
            this.$store.dispatch('loadArticles')
          })
        })
      }
    }
  }
}
