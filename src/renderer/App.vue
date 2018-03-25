<template>
  <div id="app">
    <v-app>
      <v-navigation-drawer
      fixed
      :clipped="$vuetify.breakpoint.lgAndUp"
      v-model="drawer"
      app
      >
      <v-list>
        <v-list-tile
        router
        :to="item.to"
        :key="i"
        v-for="(item, i) in items"
        exact
        >
        <v-list-tile-action>
          <v-icon v-html="item.icon"></v-icon>
        </v-list-tile-action>
        <v-list-tile-content>
          <v-list-tile-title v-text="item.title"></v-list-tile-title>
        </v-list-tile-content>
      </v-list-tile>
    </v-list>
    <v-layout align-center>
      <v-flex xs6>
        <v-subheader>
          Categories
        </v-subheader>
      </v-flex>
      <v-flex xs6 class="text-xs-right">
        <v-btn small icon @click.stop="dialog = !dialog">
          <v-icon>add</v-icon>
        </v-btn>
      </v-flex>
    </v-layout>
    <v-list>
      <v-list-tile avatar v-for="item in categories" :key="item._id" @click="">
        <v-list-tile-action>
           <v-icon :style="{ color: item.color }">fiber_manual_record</v-icon>
        </v-list-tile-action>
        <v-list-tile-title>{{ item.name }}</v-list-tile-title>
      </v-list-tile>
    </v-list>
    <v-subheader>
      Subscriptions
    </v-subheader>
    <v-list>
      <v-list-tile avatar v-for="item in feeds" :key="item._id" @click="">
        <v-list-tile-avatar>
          <img :src="item.favicon">
        </v-list-tile-avatar>
        <v-list-tile-title>{{ item.title }}</v-list-tile-title>
      </v-list-tile>
    </v-list>
  </v-navigation-drawer>
  <v-toolbar fixed app dark color="primary" :clipped-left="$vuetify.breakpoint.lgAndUp">
    <v-toolbar-side-icon @click.native.stop="drawer = !drawer"></v-toolbar-side-icon>
    <v-toolbar-title class="ml-0 pl-3 pr-3">
      <span class="hidden-sm-and-down">{{ title }}</span>
    </v-toolbar-title>
    <v-toolbar-items>
      <v-btn flat>Import</v-btn>
      <v-btn flat>Export</v-btn>
      <v-btn icon>
        <v-icon>refresh</v-icon>
      </v-btn>
    </v-toolbar-items>
    <v-spacer></v-spacer>
    <v-text-field
    flat
    solo-inverted
    prepend-icon="search"
    label="Search"
    class="hidden-sm-and-down"
    ></v-text-field>
  </v-toolbar>
  <v-content>
    <v-container fluid fill-height>
      <v-slide-y-transition mode="out-in">
        <router-view></router-view>
      </v-slide-y-transition>
    </v-container>
  </v-content>
  <v-dialog v-model="dialog" width="500px">
    <v-card>
      <v-card-title
      class="grey lighten-4 py-4 title"
      >
      Add new category
    </v-card-title>
    <v-container grid-list-sm class="pa-4">
      <v-layout row wrap>
        <v-flex xs12 align-center justify-space-between>
          <v-layout align-center>
            <v-text-field
            type="url"
            placeholder="Enter category name"
            v-model="category.name"
            required
            ></v-text-field>
          </v-layout>
        </v-flex>
      </v-layout>
    </v-container>
    <v-card-actions>
      <v-btn flat color="primary" @click="dialog = false">Cancel</v-btn>
      <v-btn flat @click="addCategory">Save</v-btn>
    </v-card-actions>
  </v-card>
</v-dialog>
</v-app>
</div>
</template>
<script>
import randomcolor from 'randomcolor'

export default {
  name: 'rss-reader',
  data () {
    return {
      dialog: false,
      clipped: true,
      drawer: false,
      fixed: true,
      category: {
        name: null
      },
      items: [
        { icon: 'apps', title: 'All Articles', to: '/' },
        { icon: 'history', title: 'Unread', to: '/unread' },
        { icon: 'star_outline', title: 'Favourites', to: '/favourites' }
      ],
      title: 'All Articles'
    }
  },
  mounted () {
    this.$store.dispatch('loadFeed')
    this.$store.dispatch('loadArticles')
    this.$store.dispatch('loadCategory')
  },
  computed: {
    feeds () {
      return this.$store.state.Feed.feeds
    },
    categories () {
      return this.$store.state.Category.categories
    }
  },
  methods: {
    addCategory () {
      this.$store.dispatch('addCategory', { name: this.category.name, color: randomcolor() })
    }
  }
}
</script>

<style>
@import url('https://fonts.googleapis.com/css?family=Roboto:300,400,500,700|Material+Icons');
@import url('https://fonts.googleapis.com/css?family=Playfair+Display:400,700');
/* Global CSS */
#app .speed-dial,
#app .btn--floating {
  position: fixed;
}
#app .btn--floating {
  margin: 0 0 16px 16px;
}

#app .btn--floating .icon {
  align-items: center;
  display: flex;
  justify-content: center;
  font-size: 32px;
}
</style>
