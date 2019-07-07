<template>
  <b-modal
    id="editSubscription"
    ref="editSubscription"
    title="Edit Subscription"
    centered
  >
    <b-form-group
      id="subscription-group"
    >
      <b-form-input type="text" v-model="article.sitetitle"></b-form-input>
    </b-form-group>
    <div slot="modal-footer">
      <button type="button" class="btn btn-secondary" @click="hideModal">Cancel</button>
      <button type="button" class="btn btn-primary" @click="updateSubscriptionTitle">Update</button>
    </div>
  </b-modal>
</template>
<script>
export default {
  props: {
    article: {
      type: Object
    }
  },
  methods: {
    hideModal () {
      this.$refs.editSubscription.hide()
    },
    updateSubscriptionTitle () {
      this.$store.dispatch('updateFeedTitle', {
        title: this.article.sitetitle,
        id: this.article.feed_id
      })
      this.$store.dispatch('updateArticleFeedTitle', {
        article_id: this.article._id,
        title: this.article.sitetitle,
        id: this.article.feed_id
      })
      this.$toasted.show('Subscription title updated.', {
        theme: 'outline',
        position: 'top-center',
        duration: 3000
      })
      this.hideModal()
    }
  }
}
</script>