<template>
  <b-modal id="markallread" ref="markallread" size="sm" title="Mark all articles as read" centered>
    <p> Are you sure you want to mark all articles as read?
    <div slot="modal-footer">
      <button type="button" class="btn btn-secondary" @click="markAllRead">Yes</button>
      <button type="button" class="btn btn-primary" @click="hideModal">No</button>
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
      this.$store.dispatch('markAllRead')
      this.$refs.markallread.hide()
    }
  }
}
</script>
