import feedbin from '../services/feedbin'
import inoreader from '../services/inoreader'
import greader from '../services/greader'
import dayjs from 'dayjs'

export default {
  methods: {
    syncGreader () {
      if (this.$store.state.Setting.selfhost_connected) {
        const dateitem = this.$store.state.Setting.greader_fetched_lastime
        greader.getEntries(this.$store.state.Setting.selfhost, dayjs(dateitem).subtract(1, 'day').unix()).then((res) => {
          window.log.info('Processing Greader feeds')
          greader.syncItems(this.$store.state.Setting.selfhost, res).then(() => {
            this.$store.dispatch('loadFeeds')
            this.$store.dispatch('loadArticles')
          })
        })
      }
    },
    syncInoreader () {
      if (this.$store.state.Setting.inoreader_connected) {
        const datetime = this.$store.state.Setting.inoreader_last_fetched
        inoreader.getEntries(this.$store.state.Setting.inoreader, dayjs(datetime).subtract(1, 'day').unix()).then((res) => {
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
