<template>
  <v-card v-if="articles.length > 0">
    <v-list two-line>
      <template v-for="item in articles">
        <v-list-tile avatar ripple @click="" transition="fade-transition">
          <v-list-tile-avatar>
            <img :src="item.favicon">
          </v-list-tile-avatar>
          <v-list-tile-content>
            <v-list-tile-title>{{ item.title }}</v-list-tile-title>
            <v-list-tile-sub-title><timeago :since="item.pubdate"></timeago></v-list-tile-sub-title>
          </v-list-tile-content>
          <v-list-tile-action>
            <v-chip color="red" text-color="white">News</v-chip>
          </v-list-tile-action>
          <v-list-tile-action>
            <v-menu bottom left transition="v-slide-y-transition">
              <v-btn icon="icon" slot="activator">
                <v-icon>more_vert</v-icon>
              </v-btn>
            </v-menu>
          </v-list-tile-action>
        </v-list-tile>
        <v-divider></v-divider>
      </template>
    </v-list>
  </v-card>
  <v-flex xs12 style="height: 500px;" class="mx-auto" align-content-center justify-center v-else>
    <p class="text-xs-center">No articles found.</p>
  </v-flex>
</template>
<script>
export default {
  computed: {
    articles () {
      return this.$store.state.Articles.articles
    }
  }
}
</script>
