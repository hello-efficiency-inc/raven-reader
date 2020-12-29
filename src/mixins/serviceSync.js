import feedbin from '../services/feedbin'
import inoreader from '../services/inoreader'
import dayjs from 'dayjs'

export default {
  methods: {
    syncInoreader () {
      if (this.$store.state.Setting.inoreader_connected) {
        inoreader.getEntries(this.$store.state.Setting.inoreader).then((res) => {
          window.log.info('Processing Inoreader feeds')
          inoreader.syncItems(this.$store.state.Setting.inoreader, res).then(() => {
            this.$store.dispatch('loadFeeds')
            this.$store.dispatch('loadArticles')
          })
        })
      }
    },
    syncFeedbin () {
      const date = window.electronstore.getFeedbinLastFetched()
      if (this.$store.state.Setting.feedbin_connected) {
        const promise = Promise.all([
          feedbin.getUnreadEntries(this.$store.state.Setting.feedbin),
          feedbin.getStarredEntries(this.$store.state.Setting.feedbin),
          feedbin.getEntries(this.$store.state.Setting.feedbin, dayjs(date).subtract(1, 'month').toISOString())
        ])
        promise.then((res) => {
          const [unread, starred, entries] = res
          window.log.info('Processing Feedbin feeds')
          const mapped = feedbin.transformEntriesAndFeed(unread, starred, entries)
          feedbin.syncItems(this.$store.state.Setting.feedbin, mapped).then(() => {
            this.$store.dispatch('loadFeeds')
            this.$store.dispatch('loadArticles')
          })
        })
      }
    }
  }
}
