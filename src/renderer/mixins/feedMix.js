export default {
    methods: {
        isFeedActive (feed) {
            return !!feed && feed.id !== undefined && feed.id === this.activeFeedId
        },
        setActiveFeedId (feed) {
            return this.$store.dispatch('setActiveFeedId', feed)
        }
    }
}
