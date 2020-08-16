export default {
  computed: {
    categoryItems () {
      return this.$store.state.Category.categories
    },
    feeds () {
      return this.$store.state.Feed.feeds
    },
    activeFeedId () {
      return this.$store.getters.activeFeedId
    }
  }
}
