<template>
  <b-modal
    id="markallunread"
    ref="markallunread"
    size="sm"
    :title="getTranslatedLabel('Mark all articles as unread')"
    centered
  >
    <p>
      {{ $t('Are you sure you want to mark all articles as unread?') }}
    </p><div slot="modal-footer">
      <button
        type="button"
        class="btn btn-secondary mr-3"
        @click="markAllUnread"
      >
        {{ $t('Yes') }}
      </button>
      <button
        type="button"
        class="btn btn-primary"
        @click="hideModal"
      >
        {{ $t('No') }}
      </button>
    </div>
  </b-modal>
</template>
<script>
export default {
  methods: {
    getTranslatedLabel (val) {
      return this.$options.filters.t(val)
    },
    hideModal () {
      this.$refs.markallunread.hide()
    },
    markAllUnread () {
      this.$parent.$refs.topProgress.start()
      this.$store.dispatch('markAllUnread').then(() => {
        this.$store.dispatch('loadArticles')
        this.$parent.$refs.topProgress.done()
      })
      this.$refs.markallunread.hide()
    }
  }
}
</script>
