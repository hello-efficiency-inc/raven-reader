<template>
  <div class="app-wrapper">
    <nav class="bg-light sidebar">
      <subscribe-toolbar></subscribe-toolbar>
      <div class="sidebar-sticky">
        <ul class="nav flex-column">
          <li class="nav-item">
            <a class="nav-link" href="#">
              <feather-icon name="list"></feather-icon>
              All Feeds <span class="sr-only">(current)</span>
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#">
              <feather-icon name="star"></feather-icon>
              Favourites
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#">
              <feather-icon name="archive"></feather-icon>
              Archives
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#">
              <feather-icon name="circle"></feather-icon>
              Unread Articles
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#">
              <feather-icon name="circle" filled></feather-icon>
              Recently Read
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#">
              <feather-icon name="settings"></feather-icon>
              Settings
            </a>
          </li>
        </ul>
        <h6 class="sidebar-heading d-flex justify-content-between align-items-center px-3 mt-4 mb-1 text-muted">
          <span>Subscriptions</span>
          <a class="d-flex align-items-center text-muted" href="#">
            <feather-icon name="plus-circle"></feather-icon>
          </a>
        </h6>
      </div>
    </nav>
    <article-list></article-list>
    <article-detail></article-detail>
  </div>
</template>
<script>
export default {
  mounted () {
    this.$store.dispatch('loadFeeds')
    this.$store.dispatch('loadArticles')
  }
}
</script>
<style lang="scss">
.app-wrapper {
  display: flex;
  height: 100%;
  align-items: flex-start;
}
</style>
