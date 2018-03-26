<template>
  <v-layout justify-center align-center row>
    <v-flex xs12>
      <news-list></news-list>
      <v-btn
      color="accent"
      dark
      fixed
      bottom
      right
      fab
      @click.stop="dialog = !dialog"
      >
      <v-icon>add</v-icon>
    </v-btn>
  </v-flex>
  <v-dialog v-model="dialog" width="500px">
    <v-card>
      <v-card-title
      class="grey lighten-4 py-4 title"
      >
      Add a new feed
    </v-card-title>
    <v-container grid-list-sm class="pa-4">
      <v-layout row wrap>
        <v-flex xs12 align-center justify-space-between>
          <v-layout align-center>
            <v-text-field
            type="url"
            placeholder="Enter a website or feed url"
            v-model="feed.link"
            required
            ></v-text-field>
          </v-layout>
        </v-flex>
        <v-flex xs12>
          <v-layout align-center>
            <v-select
              :items="$store.state.Category.categories"
              item-text="name"
              item-value="_id"
              v-model="feed.category"
              label="Select Category"
              required
            ></v-select>
          </v-layout>
        </v-flex>
      </v-layout>
    </v-container>
    <v-card-actions>
      <v-btn flat color="primary" @click="dialog = false">Cancel</v-btn>
      <v-btn flat @click="saveFeed">Save</v-btn>
    </v-card-actions>
  </v-card>
</v-dialog>
</v-layout>
</template>
<script>
import FeedHelper from '../helpers/fetchFeed'

export default {
  data () {
    return {
      valid: false,
      feed: {
        link: null,
        category: null
      },
      dialog: false
    }
  },
  methods: {
    async saveFeed () {
      const helper = new FeedHelper()
      const data = await helper.fetchFeed(this.feed.link, this.feed.category)
      this.$store.dispatch('addFeed', data.meta)
      data.articles.forEach(value => {
        this.$store.dispatch('addArticles', value)
      })
      this.dialog = false
    }
  }
}
</script>
<style lang="stylus">
.avatar img
  width: 24px
  height: 24px
</style>
