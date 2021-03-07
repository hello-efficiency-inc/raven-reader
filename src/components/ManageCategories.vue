<template>
  <div>
    <div
      class="row mb-3"
    >
      <div
        class="col"
      >
        <span
          v-if="selected.length > 0"
          class="mr-3"
        > {{ selected.length }} {{ $t('selected') }}:</span>
        <b-button
          v-if="selected.length > 0"
          v-b-modal.delete-category-confirmation
          variant="danger"
          size="sm"
          class="mr-3"
        >
          {{ $t('Delete') }}
        </b-button>
        <b-button
          v-if="categories.length > 0"
          v-b-modal.add-category
          variant="primary"
          size="sm"
        >
          {{ $t('Add category') }}
        </b-button>
      </div>
    </div>
    <div class="row">
      <div class="col">
        <table
          v-if="categories.length > 0"
          :class="{ 'table-dark': isDarkMode }"
          class="table"
        >
          <thead>
            <tr>
              <th scope="col">
                <b-form-checkbox
                  v-model="allSelected"
                  :indeterminate="indeterminate"
                  @change="toggleAll"
                />
              </th>
              <th scope="col">
                {{ $t('Category') }}
              </th>
              <th scope="col">
                {{ $t('Feeds') }}
              </th>
              <th scope="col">
                {{ $t('Action') }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="categoryitem in categories"
              :key="categoryitem.id"
            >
              <td>
                <b-form-checkbox
                  :key="categoryitem.id"
                  v-model="selected"
                  :value="categoryitem.id"
                />
              </td>
              <td>{{ categoryitem.title }} </td>
              <td>{{ countFeeds(categoryitem.title) }}</td>
              <td>
                <b-button
                  variant="primary"
                  size="sm"
                  class="mr-2"
                  @click="openCategoryModal(categoryitem)"
                >
                  {{ $t('Edit') }}
                </b-button>
                <b-button
                  v-b-modal.delete-category-confirmation
                  variant="danger"
                  size="sm"
                  @click="setCategory(categoryitem)"
                >
                  {{ $t('Delete') }}
                </b-button>
              </td>
            </tr>
          </tbody>
        </table>
        <div
          v-if="categories.length === 0"
          class="mt-5 w-100 h-100 d-flex flex-column justify-content-center align-items-center"
        >
          {{ $t('No categories available') }}
          <p
            v-if="feeds.length === 0"
            class="my-2"
          >
            {{ $t('Please subscribe to atleast one feed to add category') }}
          </p>
          <b-button
            v-b-modal.add-category
            class="mt-3"
            variant="primary"
            :disabled="feeds.length === 0"
          >
            {{ $t('Add new category') }}
          </b-button>
        </div>
      </div>
    </div>
    <!-- Delete Confirmation -->
    <b-modal
      id="delete-category-confirmation"
      centered
      @hidden="onHidden"
    >
      <template #modal-title>
        {{ $t('Are you sure you want delete this Category?') }}
      </template>
      <p>{{ $t('Feed in this categories would not be deleted') }}</p>
      <template #modal-footer>
        <b-button
          v-if="selected.length === 0"
          class="mt-3"
          variant="danger"
          @click="deleteCategory(selectedCategory)"
        >
          {{ $t('Delete') }}
        </b-button>
        <b-button
          v-if="selected.length > 0"
          class="mt-3"
          variant="danger"
          @click="bulkDelete"
        >
          {{ $t('Delete') }}
        </b-button>
        <b-button
          class="mt-3"
          variant="secondary"
          @click="$bvModal.hide('delete-category-confirmation')"
        >
          {{ $t('Cancel') }}
        </b-button>
      </template>
    </b-modal>
    <!-- Add Category -->
    <b-modal
      id="add-category"
      centered
      @hidden="onHidden"
    >
      <template #modal-title>
        {{ $t('Add Category') }}
      </template>
      <b-alert
        :show="error"
        variant="danger"
      >
        {{ $t('Please select atleast one feed') }}
      </b-alert>
      <b-form-group
        id="subscription-group"
        :label="getTranslatedLabel('Title')"
      >
        <b-form-input
          v-model="category"
          type="text"
        />
      </b-form-group>
      <b-form-group
        id="feed-group"
        :label="getTranslatedLabel('Feed')"
      >
        <b-form-select
          v-model="selectedFeed"
          :options="selectOptions"
        />
      </b-form-group>
      <template #modal-footer>
        <b-button
          class="mt-3"
          variant="danger"
          @click="addCategory"
        >
          {{ $t('Add') }}
        </b-button>
        <b-button
          class="mt-3"
          variant="secondary"
          @click="$bvModal.hide('add-category')"
        >
          {{ $t('Cancel') }}
        </b-button>
      </template>
    </b-modal>
  </div>
</template>
<script>
import themeMixin from '../mixins/setTheme'
import uuidstring from 'uuid-by-string'
import bus from '../services/bus'
import db from '../services/db'

export default {
  mixins: [
    themeMixin
  ],
  data () {
    return {
      selected: [],
      allSelected: false,
      indeterminate: false,
      selectedCategory: null,
      category: null,
      selectedFeed: null,
      error: false
    }
  },
  computed: {
    categories () {
      return this.$store.state.Category.categories.filter((item) => {
        return item.source === 'local'
      })
    },
    feeds () {
      return this.$store.state.Feed.feeds
    },
    selectOptions () {
      const data = [
        { value: null, text: 'Please select an option' }
      ]
      const feeds = this.feeds.slice()
      const mapped = feeds.map((item) => {
        return {
          value: item.id,
          text: item.title
        }
      })
      return [...data, ...mapped]
    }
  },
  watch: {
    selected (newValue, oldValue) {
      if (newValue.length === 0) {
        this.indeterminate = false
        this.allSelected = false
      } else if (newValue.length === this.categories.length) {
        this.indeterminate = false
        this.allSelected = true
      } else {
        this.indeterminate = true
        this.allSelected = false
      }
    }
  },
  methods: {
    getTranslatedLabel (val) {
      return this.$options.filters.t(val)
    },
    onHidden () {
      this.error = false
      this.category = null
      this.selectedFeed = null
      this.selectedCategory = null
    },
    toggleAll (checked) {
      this.selected = checked ? this.categories.map(item => item.id).slice() : []
    },
    countFeeds (category) {
      return this.feeds.filter((item) => {
        return item.category === category
      }).length
    },
    setCategory (category) {
      this.selectedCategory = category
    },
    openCategoryModal (category) {
      bus.$emit('edit-category-item', category)
    },
    addCategory () {
      if (this.selectedFeed) {
        const selectedFeed = this.feeds.filter((item) => {
          return item.id === this.selectedFeed
        })
        this.$store.dispatch(
          'addCategory', {
            id: uuidstring(this.category),
            title: this.category,
            type: 'category',
            source: 'local'
          }).then(() => {
          this.$store.dispatch('loadCategories')
        })
        this.$store.dispatch('updateFeedTitle', {
          title: selectedFeed[0].title,
          category: this.category,
          id: this.selectedFeed
        }).then(() => {
          this.$store.dispatch('updateArticleFeedTitle', {
            category: this.category,
            id: this.selectedFeed
          }).then(() => {
            this.$store.dispatch('loadFeeds')
            this.$store.dispatch('loadArticles')
          })
        })
        this.$bvModal.hide('add-category')
      } else {
        this.error = true
      }
    },
    deleteCategory (category) {
      const feeds = this.$store.state.Feed.feeds.filter((item) => {
        return item.category === category.title
      }).map(item => item.uuid)
      const articles = this.$store.state.Article.articles.filter((item) => {
        return item.category === category.title
      }).map(item => item.articles.uuid)
      db.deleteCategory(category.title)
      db.unassignFeeds(feeds).then(() => {
        db.unassignCategoriesArticles(articles)
      }).then(() => {
        this.$store.dispatch('loadCategories')
        this.$store.dispatch('loadFeeds')
        this.$store.dispatch('loadArticles')
      })
      this.$bvModal.hide('delete-category-confirmation')
    },
    bulkDelete () {
      const selectedCategories = this.categories.filter((item) => {
        return this.selected.includes(item.id)
      }).map(item => item.title)
      const feeds = this.$store.state.Feed.feeds.filter((item) => {
        return selectedCategories.includes(item.category)
      }).map(item => item.uuid)
      const articles = this.$store.state.Article.articles.filter((item) => {
        return selectedCategories.includes(item.category)
      }).map(item => item.articles.uuid)
      db.deleteCategoryMulti(selectedCategories)
      db.unassignFeeds(feeds).then(() => {
        db.unassignCategoriesArticles(articles)
      }).then(() => {
        this.$store.dispatch('loadCategories')
        this.$store.dispatch('loadFeeds')
        this.$store.dispatch('loadArticles')
      })
      this.selected = []
      this.$bvModal.hide('delete-category-confirmation')
    }
  }
}
</script>
