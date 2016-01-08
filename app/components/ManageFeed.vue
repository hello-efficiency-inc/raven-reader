<template>
  <div class="add-feed-container">
    <h2>Manage Feeds</h2>
    <ul class="list-feeds">
      <li v-for="feed in feeds">
        <img v-bind:src="feed.favicon" width="20" height="20"> {{ feed.title }}
        <button class="delete-btn" type="button">Delete</button>
      </li>
    </ul>
  </div>
</template>
<script>
import store from '../store.js'

  export default{
    computed: {
      feeds(){
        return store.state.feeds
      }
    }
  }
</script>
