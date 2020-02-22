<template>
  <b-modal
    id="editSubscription"
    ref="editSubscription"
    title="Edit Subscription"
    centered
    @hidden="onHidden"
  >
    <b-form-group
      id="subscription-group"
      label="Title"
    >
      <b-form-input
        v-model="article.sitetitle"
        type="text"
      />
    </b-form-group>
    <b-form-group label="Category">
      <b-form-select
        v-model="article.category"
        :options="categoryItems"
        class="mb-3"
      >
        <template slot="first">
          <option :value="null">
            Please select category
          </option>
        </template>
      </b-form-select>
      <p>
        <button
          class="btn btn-link pl-0"
          type="button"
          @click="addCategory"
        >
          Add new category
        </button>
      </p>
      <p v-if="showAddCat">
        <b-form-input
          v-model="newcategory"
          placeholder="Enter new category"
        />
      </p>
    </b-form-group>
    <div slot="modal-footer">
      <button
        type="button"
        class="btn btn-secondary"
        @click="hideModal"
      >
        Cancel
      </button>
      <button
        type="button"
        class="btn btn-primary"
        @click="updateSubscriptionTitle"
      >
        Update
      </button>
    </div>
  </b-modal>
</template>
<script>
import uuid from 'uuid-by-string'

export default {
  props: {
    article: {
      type: Object
    }
  },
  data () {
    return {
      newcategory: null,
      showAddCat: false
    }
  },
  computed: {
    categoryItems () {
      return this.$store.state.Category.categories.map((item) => {
        return { value: item.title, text: item.title }
      })
    }
  },
  methods: {
    addCategory () {
      this.showAddCat = !this.showAddCat
    },
    hideModal () {
      this.$refs.editSubscription.hide()
    },
    updateSubscriptionTitle () {
      if (this.newcategory) {
        this.$store.dispatch('addCategory', { id: uuid(this.newcategory), title: this.newcategory, type: 'category' })
      } else {
        this.newcategory = this.article.category
      }
      this.$store.dispatch('updateFeedTitle', {
        title: this.article.sitetitle,
        category: this.newcategory,
        id: this.article.feed_id
      })
      this.$store.dispatch('updateArticleFeedTitle', {
        category: this.newcategory,
        title: this.article.sitetitle,
        id: this.article.feed_id
      })
      this.$toasted.show('Subscription title updated.', {
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
