<template>
  <b-modal
    id="markallread"
    ref="markallread"
    size="sm"
    title="Mark all articles as read"
    centered
  >
    <p>
      Are you sure you want to mark all articles as read?
    </p><div slot="modal-footer">
      <button
        type="button"
        class="btn btn-secondary mr-3"
        @click="markAllRead"
      >
        Yes
      </button>
      <button
        type="button"
        class="btn btn-primary"
        @click="hideModal"
      >
        No
      </button>
    </div>
  </b-modal>
</template>
<script>
export default {
  methods: {
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
