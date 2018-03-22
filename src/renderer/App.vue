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
        <v-btn small flat>edit</v-btn>
      </v-flex>
    </v-layout>
    <v-layout align-center>
      <v-flex xs6>
        <v-subheader>
          Subscriptions
        </v-subheader>
      </v-flex>
      <v-flex xs6 class="text-xs-right">
        <v-btn small flat>edit</v-btn>
      </v-flex>
    </v-layout>
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
</v-app>
</div>
</template>

<script>
export default {
  name: 'rss-reader',
  data: () => ({
    clipped: true,
    drawer: true,
    fixed: true,
    items: [
      { icon: 'apps', title: 'All Articles', to: '/' },
      { icon: 'bubble_chart', title: 'Unread', to: '/inspire' },
      { icon: 'star_outline', title: 'Favourites', to: '/inspire' }
    ],
    miniVariant: false,
    right: true,
    rightDrawer: false,
    title: 'All Articles'
  })
}
</script>

<style>
@import url('https://fonts.googleapis.com/css?family=Roboto:300,400,500,700|Material+Icons');
@import url('https://fonts.googleapis.com/css?family=Playfair+Display:400,700');
/* Global CSS */
</style>
