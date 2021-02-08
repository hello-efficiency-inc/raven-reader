<template>
  <b-modal
    id="editFeed"
    ref="editFeed"
    :title="getTranslatedLabel('Edit Feed')"
    centered
    @hidden="onHidden"
  >
    <div v-if="feed">
      <b-form-group
        id="subscription-group"
        :label="getTranslatedLabel('Title')"
      >
        <b-form-input
          v-model="feeditem.title"
          type="text"
        />
      </b-form-group>
      <b-form-group
        id="subscription-group"
        :label="categoryItems.length > 0 ? getTranslatedLabel('Category') : ''"
      >
        <b-form-select
          v-if="categoryItems.length > 0"
          v-model="feeditem.category"
          :options="categoryItems"
          class="mb-3"
        >
          <template slot="first">
            <option :value="null">
              {{ $t('Please select category') }}
            </option>
          </template>
        </b-form-select>
        <p>
          <button
            class="btn btn-link pl-0"
            type="button"
            @click="addCategory"
          >
            {{ $t('Add new category') }}
          </button>
        </p>
        <p v-if="showAddCat">
          <b-form-input
            v-model="newcategory"
            :placeholder="getTranslatedLabel('Enter new category')"
          />
        </p>
      </b-form-group>
    </div>
    <div slot="modal-footer">
      <button
        type="button"
        class="btn btn-secondary mr-2"
        @click="hideModal"
      >
        {{ $t('Cancel') }}
      </button>
      <button
        type="button"
        class="btn btn-primary"
        @click="updateSubscriptionTitle"
      >
        {{ $t('Update') }}
      </button>
    </div>
  </b-modal>
</template>
<script>
import uuidstring from 'uuid-by-string'
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
  watch: {
    feed () {
      this.feeditem = JSON.parse(JSON.stringify(this.feed))
    }
  },
  methods: {
    getTranslatedLabel (val) {
      return this.$options.filters.t(val)
    },
    addCategory () {
      this.showAddCat = !this.showAddCat
    },
    hideModal () {
      this.$refs.editFeed.hide()
    },
    updateSubscriptionTitle () {
      if (this.newcategory) {
        this.$store.dispatch('addCategory', { id: uuidstring(this.newcategory), title: this.newcategory, type: 'category', source: 'local' })
          .then(() => {
            this.$store.dispatch('loadCategories')
          })
      } else {
        this.newcategory = this.feeditem.category
      }
      this.$store.dispatch('updateFeedTitle', {
        title: this.feeditem.title,
        category: this.newcategory,
        id: this.feeditem.uuid
      }).then(() => {
        this.$store.dispatch('updateArticleFeedTitle', {
          category: this.newcategory,
          id: this.feeditem.uuid
        }).then(() => {
          this.$store.dispatch('loadFeeds')
          this.$store.dispatch('loadArticles')
        })
      })
      this.$toasted.show(this.getTranslatedLabel('Subscription title updated.'), {
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
