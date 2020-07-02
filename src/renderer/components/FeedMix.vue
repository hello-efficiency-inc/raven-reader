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
import dataSet from '../mixins/dataItems'
import feedMix from '../mixins/feedMix'

export default {
  mixins: [
    dataSet,
    feedMix
  ],
  props: {
    feedId: { type: String, required: true },
    mark: { type: String, required: true }
  },
  methods: {
    getFeed () {
      return { id: this.feedId }
    }
  }
}
</script>
