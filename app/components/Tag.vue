<template>
  <div class="dashboard-header">
    <!-- <div class="toggle-menu" v-on:click="toggleMenu()" class="menu-closed">
      <i class="fa fa-fw fa-bars"></i>
    </div> -->
    <div class="back" v-on:click="back()">
      <i class="fa fa-fw fa-arrow-left"></i> Back
    </div>

    <h2>Tags</h2>
  </div>

  <div class="add-feed-container">
    <section>
      <br/>
      <div id="feedlist">
        <ul class="list-feeds" v-if="tags.length > 0">
          <li v-for="tag in tags" style="cursor:pointer" v-on:click="goToTag(tag.text)">
            {{ tag.text }}
          </li>
        </ul>
      </div>
      <div v-if="tags.length == 0">
        <strong>No tags found.</strong>
      </div>
    </section>
  </div>
</template>
<script>
import store from '../store.js'
export default {
  computed: {
    tags(){
      return store.state.tags;
    }
  },
  methods : {
    goToTag(text){
      return this.$route.router.go({ path: '/tag/' + text })
    },
    back() {
      return this.$route.router.go({ path: '/'});
    }
  }
}

</script>
