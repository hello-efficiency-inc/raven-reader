import feedbin from '../services/feedbin'
import inoreader from '../services/inoreader'
import greader from '../services/greader'
import fever from '../services/fever'

export default {
  methods: {
    syncFever () {
      if (this.$store.state.Setting.fever_connected) {
        window.log.info('Processing fever feeds')
        fever.syncItems(this.$store.state.Setting.fever).then(() => {
          this.$store.dispatch('loadCategories')
          this.$store.dispatch('loadFeeds')
          this.$store.dispatch('loadArticles')
        })
      }
    },
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
        feedbin.syncItems(this.$store.state.Setting.feedbin).then(() => {
          this.$store.dispatch('loadCategories')
          this.$store.dispatch('loadFeeds')
          this.$store.dispatch('loadArticles')
        })
      }
    }
  }
}
