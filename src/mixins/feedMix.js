export default {
  methods: {
    isFeedActive (feed) {
      return !!feed && feed.uuid !== undefined && feed.uuid === this.activeFeedId
    },
    setActiveFeedId (feed) {
      return this.$store.dispatch('setActiveFeedId', feed)
    }
  }
}
