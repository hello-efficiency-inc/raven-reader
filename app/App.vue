<template>
    <div>
        <sidebar></sidebar>
        <router-view class="view" transition="fade" transition-mode="out-in"></router-view>
    </div>
</template>
<script>
import store from './vuex/store'
import {
  getTags,
  setAppStatus,
  setBadgeCount,
  getFeed,
  getArticles
 } from './vuex/actions'
import {ipcRenderer} from 'electron'

export default {
  store: store,
  vuex: {
    actions: {
      getTags,
      setAppStatus,
      setBadgeCount,
      getFeed,
      getArticles
    }
  },
  ready () {
    this.getFeed()
    this.getArticles()
    this.setBadgeCount()
    this.getTags()
    ipcRenderer.on('online-status-check', (event, status) => {
      this.setAppStatus(status === 'offline')
    })
  }
}
</script>
<style lang="sass">
    @import "./assets/main"
</style>
