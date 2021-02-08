<template>
  <b-modal
    id="markallread"
    ref="markallread"
    size="sm"
    :title="getTranslatedLabel('Mark all articles as read')"
    centered
  >
    <p>
      {{ $t('Are you sure you want to mark all articles as read?') }}
    </p><div slot="modal-footer">
      <button
        type="button"
        class="btn btn-secondary mr-3"
        @click="markAllRead"
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
      this.$refs.markallread.hide()
    },
    markAllRead () {
      this.$parent.$refs.topProgress.start()
      this.$store.dispatch('markAllRead').then(() => {
        this.$store.dispatch('loadArticles')
        this.$parent.$refs.topProgress.done()
      })
      this.$refs.markallread.hide()
    }
  }
}
</script>
