import feedbin from '../services/feedbin'
import inoreader from '../services/inoreader'
import greader from '../services/greader'
import dayjs from 'dayjs'

export default {
  methods: {
    syncGreader () {
      if (this.$store.state.Setting.selfhost_connected) {
        window.log.info('Processing Greader feeds')
        greader.syncItems(this.$store.state.Setting.selfhost).then(() => {
          this.$store.dispatch('loadCategories')
          this.$store.dispatch('loadFeeds')
          this.$store.dispatch('loadArticles')
        })
      }
    },
    syncInoreader () {
      if (this.$store.state.Setting.inoreader_connected) {
        window.log.info('Processing Inoreader feeds')
        inoreader.syncArticles(this.$store.state.Setting.inoreader).then(() => {
          this.$store.dispatch('loadCategories')
          this.$store.dispatch('loadFeeds')
          this.$store.dispatch('loadArticles')
        })
      }
    },
    syncFeedbin () {
      if (this.$store.state.Setting.feedbin_connected) {
        const promise = Promise.all([
          feedbin.getUnreadEntries(this.$store.state.Setting.feedbin),
          feedbin.getStarredEntries(this.$store.state.Setting.feedbin),
          feedbin.getEntries(this.$store.state.Setting.feedbin, dayjs(window.electronstore.getFeedbinLastFetched()).subtract(8, 'hour').toISOString())
        ])
        promise.then((res) => {
          const [unread, starred, entries] = res
          window.log.info('Processing Feedbin feeds')
          feedbin.syncItems(this.$store.state.Setting.feedbin, feedbin.transformEntriesAndFeed(unread, starred, entries)).then(() => {
            this.$store.dispatch('loadFeeds')
            this.$store.dispatch('loadArticles')
          })
        })
      }
    }
  }
}
