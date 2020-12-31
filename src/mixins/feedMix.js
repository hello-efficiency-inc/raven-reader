export default {
  methods: {
    isMenuItemActive (type) {
      return !!type && type === this.$store.state.Article.type
    },
    isFeedActive (feed) {
      return !!feed && feed.uuid !== undefined && feed.uuid === this.activeFeedId
    },
    setActiveFeedId (feed) {
      return this.$store.dispatch('setActiveFeedId', feed)
    }
  }
}
