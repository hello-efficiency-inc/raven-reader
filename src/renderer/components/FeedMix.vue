<template>
  <div
    class="feed-mix"
    :mark="mark"
    :class="{ active: isFeedActive(getFeed()) }"
    @click="setActiveFeedId(getFeed())"
  >
    <slot />
  </div>
</template>
<script>

export default {
  props: {
    feedId: { type: String, required: true },
    mark: { type: String, required: true }
  },
  computed: {
    activeFeedId () {
      return this.$store.getters.activeFeedId
    }
  },
  methods: {
    getFeed () {
      return { id: this.feedId }
    },
    // TODO: Source this method out
    isFeedActive (feed) {
      return !!feed && feed.id !== undefined && feed.id === this.activeFeedId
    },
    // TODO: Source this method out
    setActiveFeedId (feed) {
      return this.$store.dispatch('setActiveFeedId', feed)
    }
  }
}
</script>
