<template>
  <b-modal
    id="editCategory"
    ref="editCategory"
    title="Rename category"
    centered
    @shown="initialData"
    @hidden="onHidden"
  >
    <div v-if="feeditem">
      <b-form-group
        id="subscription-group"
        label="Title"
      >
        <b-form-input
          v-model="feeditem.title"
          type="text"
        />
      </b-form-group>
    </div>
    <div slot="modal-footer">
      <button
        type="button"
        class="btn btn-secondary mr-3"
        @click="hideModal"
      >
        Cancel
      </button>
      <button
        type="button"
        class="btn btn-primary"
        @click="updateCategoryTitle"
      >
        Update
      </button>
    </div>
  </b-modal>
</template>
<script>
export default {
  props: {
    feed: {
      type: Object,
      default () {
        return {
          title: '',
          category: null
        }
      }
    }
  },
  data () {
    return {
      feeditem: null,
      oldValue: {}
    }
  },
  watch: {
    feed () {
      this.feeditem = JSON.parse(JSON.stringify(this.feed))
    }
  },
  methods: {
    initialData () {
      Object.assign(this.$data.oldValue, this.feed)
    },
    hideModal () {
      this.$refs.editCategory.hide()
    },
    updateCategoryTitle () {
      this.$store.dispatch('renameCategory', this.feed).then(() => {
        this.$store.dispatch('updateFeedCategory', { old: this.oldValue, new: this.feed })
        this.$store.dispatch('updateArticleCategory', { old: this.oldValue, new: this.feed })
      }).then(() => {
        this.$store.dispatch('loadCategories')
        this.$store.dispatch('loadFeeds')
        this.$store.dispatch('loadArticles')
      })
      this.$toasted.show('Category renamed', {
        theme: 'outline',
        position: 'top-center',
        duration: 3000
      })
      this.hideModal()
    },
    onHidden () {
      this.newcategory = null
      this.showAddCat = null
    }
  }
}
</script>
