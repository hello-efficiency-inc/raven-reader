<template>
  <div>
    <div
      v-if="selected.length > 0"
      class="row mb-3"
    >
      <div
        class="col"
      >
        <span class="mr-3"> {{ selected.length }} {{ $t('selected') }}:</span>
        <b-dropdown
          id="feed-bulkactions"
          text="Action"
          class="m-md-2"
        >
          <b-dropdown-item v-b-modal.add-to-category>
            {{ $t('Add to new category') }}
          </b-dropdown-item>
          <b-dropdown-item v-b-modal.move-to-folder>
            {{ $t('Move to category') }}
          </b-dropdown-item>
          <b-dropdown-item v-b-modal.delete-feed-confirmation>
            {{ $t('Unsubscribe') }}
          </b-dropdown-item>
        </b-dropdown>
      </div>
    </div>
    <div class="row">
      <div class="col">
        <table
          v-if="feeds.length > 0"
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
                {{ $t('Feed') }}
              </th>
              <th scope="col">
                {{ $t('Articles') }}
              </th>
              <th scope="col">
                {{ $t('Action') }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="feed in feeds"
              :key="feed.id"
            >
              <td>
                <b-form-checkbox
                  :key="feed.id"
                  v-model="selected"
                  :value="feed.id"
                />
              </td>
              <td>{{ feed.title }} </td>
              <td>{{ countArticles(feed) }}</td>
              <td>
                <b-button
                  variant="primary"
                  size="sm"
                  class="mr-2"
                  @click="editFeed(feed)"
                >
                  {{ $t('Edit') }}
                </b-button>
                <b-button
                  v-b-modal.delete-feed-confirmation
                  variant="danger"
                  size="sm"
                  @click="setFeed(feed)"
                >
                  {{ $t('Unsubscribe') }}
                </b-button>
              </td>
            </tr>
          </tbody>
        </table>
        <div
          v-if="feeds.length === 0"
          class="mt-5 w-100 h-100 d-flex flex-column justify-content-center align-items-center"
        >
          <p>
            {{ $t('No feeds available') }}
          </p>
          <b-button
            v-b-modal.addfeed
            class="mt-3"
            variant="primary"
          >
            {{ $t('Add new feed') }}
          </b-button>
        </div>
      </div>
    </div>
    <!-- Delete Confirmation -->
    <b-modal
      id="delete-feed-confirmation"
      centered
      @hidden="onHidden"
    >
      <template #modal-title>
        {{ $t('Are you sure you want unsubscrube this Feed?') }}
      </template>
      <p>{{ $t('Articles inside this feed would be deleted') }}</p>
      <template #modal-footer>
        <b-button
          v-if="selected.length === 0"
          class="mt-3"
          variant="danger"
          @click="unsubscribeFeed"
        >
          {{ $t('Unsubscribe') }}
        </b-button>
        <b-button
          v-if="selected.length > 0"
          class="mt-3"
          variant="danger"
          @click="bulkUnsubscribe"
        >
          {{ $t('Delete') }}
        </b-button>
        <b-button
          class="mt-3"
          variant="secondary"
          @click="$bvModal.hide('delete-feed-confirmation')"
        >
          {{ $t('Cancel') }}
        </b-button>
      </template>
    </b-modal>
    <!-- Add to Category -->
    <b-modal
      id="add-to-category"
      centered
      @hidden="onHidden"
    >
      <template #modal-title>
        {{ $t('Add to new category') }}
      </template>
      <b-alert
        :show="error"
        variant="danger"
      >
        {{ $t('Category cannot be empty.') }}
      </b-alert>
      <b-form-group
        id="feed-group"
        :label="getTranslatedLabel('Category')"
      >
        <b-form-input
          v-model="category"
          type="text"
        />
      </b-form-group>
      <template #modal-footer>
        <b-button
          class="mt-3"
          variant="danger"
          @click="addToCategory"
        >
          {{ $t('Add') }}
        </b-button>
        <b-button
          class="mt-3"
          variant="secondary"
          @click="$bvModal.hide('add-to-folder')"
        >
          {{ $t('Cancel') }}
        </b-button>
      </template>
    </b-modal>
    <!-- Move to folder -->
    <b-modal
      id="move-to-folder"
      centered
      @hidden="onHidden"
    >
      <template #modal-title>
        {{ $t('Move to category') }}
      </template>
      <b-alert
        :show="error"
        variant="danger"
      >
        {{ $t('Please select category') }}
      </b-alert>
      <b-form-group
        id="feed-group"
        :label="getTranslatedLabel('Category')"
      >
        <b-form-select
          v-model="selectedCategory"
          :options="categoryOptions"
        />
      </b-form-group>
      <template #modal-footer>
        <b-button
          class="mt-3"
          variant="danger"
          @click="moveFolder"
        >
          {{ $t('Move') }}
        </b-button>
        <b-button
          class="mt-3"
          variant="secondary"
          @click="$bvModal.hide('move-to-folder')"
        >
          {{ $t('Cancel') }}
        </b-button>
      </template>
    </b-modal>
  </div>
</template>
<script>
import uuidstring from 'uuid-by-string'
import themeMixin from '../mixins/setTheme'
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
      activeFeed: null,
      category: null,
      error: false
    }
  },
  computed: {
    categories () {
      return this.$store.state.Category.categories.filter((item) => {
        return item.source === 'local'
      })
    },
    articles () {
      return this.$store.state.Article.articles.filter((item) => {
        return item.articles.source === 'local'
      })
    },
    categoryOptions () {
      const data = [
        { value: null, text: 'Please select an option' }
      ]
      const categories = this.categories.slice()
      const mapped = categories.map((item) => {
        return {
          value: item.title,
          text: item.title
        }
      })
      return [...data, ...mapped]
    },
    feeds () {
      return this.$store.state.Feed.feeds.filter((item) => {
        return item.source === 'local'
      })
    }
  },
  watch: {
    selected (newValue, oldValue) {
      if (newValue.length === 0) {
        this.indeterminate = false
        this.allSelected = false
      } else if (newValue.length === this.feeds.length) {
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
      this.activeFeed = null
      this.category = null
      this.selectedCategory = null
    },
    toggleAll (checked) {
      this.selected = checked ? this.feeds.map(item => item.id).slice() : []
    },
    setFeed (feed) {
      this.activeFeed = feed
    },
    addToCategory () {
      if (this.category) {
        const selectedFeed = this.feeds.filter((item) => {
          return this.selected.includes(item.id)
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
        for (let i = 0; i < selectedFeed.length; i++) {
          this.$store.dispatch('updateFeedTitle', {
            title: selectedFeed[i].title,
            category: this.category,
            id: selectedFeed[i].id
          }).then(() => {
            this.$store.dispatch('updateArticleFeedTitle', {
              category: this.category,
              id: selectedFeed[i].id
            }).then(() => {
              this.$store.dispatch('loadFeeds')
              this.$store.dispatch('loadArticles')
            })
          })
        }
        this.$bvModal.hide('add-to-category')
      } else {
        this.error = true
      }
    },
    moveFolder () {
      if (this.selected.length > 0) {
        db.updateFeedCategory(this.selected, this.selectedCategory).then(() => {
          db.updateArticleCategoryFeedMulti(this.selected, this.selectedCategory).then(() => {
            this.$store.dispatch('loadCategories')
            this.$store.dispatch('loadFeeds')
            this.$store.dispatch('loadArticles')
          })
        })
        this.$bvModal.hide('move-to-folder')
      } else {
        this.error = true
      }
    },
    editFeed (feed) {
      bus.$emit('edit-feed', { feed: feed })
    },
    countArticles (feed) {
      return this.$store.state.Article.articles.filter((item) => {
        return item.articles.feed_uuid === feed.id
      }).length
    },
    unsubscribeFeed () {
      const articles = this.articles.filter((article) => {
        return article.feed_uuid === this.activeFeed.id
      }).map(item => item.articles.id)
      db.deleteFeed(this.activeFeed.id).then(() => {
        db.deleteArticles(articles).then(() => {
          this.$store.dispatch('loadFeeds')
          this.$store.dispatch('loadArticles')
        })
      })
      this.$bvModal.hide('delete-feed-confirmation')
    },
    bulkUnsubscribe () {
      if (this.selected.length > 0) {
        const articles = this.articles.filter((article) => {
          return this.selected.includes(article.feed_uuid)
        }).map(item => item.articles.id)
        db.deleteFeedMulti(this.selected).then(() => {
          db.deleteArticles(articles).then(() => {
            this.$store.dispatch('loadFeeds')
            this.$store.dispatch('loadArticles')
          })
        })
        this.$bvModal.hide('delete-feed-confirmation')
      }
    }
  }
}
</script>
