<template>
  <div class="dashboard">
    <div class="dashboard-sidebar">
      <div class="sidebar-header">
        <h3 class="sidebar-header-text">Articles</h3>
      </div>
      <ul class="dashboard-list">
        <li class="dashboard-list-item">
          <i class="fa fa-fw fa-book"></i> All Articles
        </li>
      </ul>
      <div class="sidebar-header">
        <h3 class="sidebar-header-text">Feeds</h3>
        <button class="btn-add-feed" type="button"><i class="fa fa-plus"></i></button>
      </div>
      <ul class="dashboard-list">
        <li class="dashboard-list-item">
          Betakit
          <span class="tagged-count">150</span>
        </li>
      </ul>
    </div>
    <router-view></router-view>
  </div>
</template>
<script>
</script>
