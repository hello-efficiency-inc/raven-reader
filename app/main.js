import Vue from 'vue'
import VueRouter from 'vue-router'
import App from './App'
import Main from './components/views/main'
import RegisterComponent from './components/register'
import {remote} from 'electron'
import jetpack from 'fs-jetpack'
import fs from 'fs'

Vue.use(VueRouter)
RegisterComponent.registerAllGlobalComponents()

const useDataDir = jetpack.cwd(remote.app.getAppPath()).cwd(remote.app.getPath('userData'))

let dirYes = jetpack.exists(useDataDir.path('streams'))
let dirFav = jetpack.exists(useDataDir.path('favicons'))
if (!dirYes) {
  fs.mkdir(useDataDir.path('streams'))
}
if (!dirFav) {
  fs.mkdir(useDataDir.path('favicons'))
}

const router = new VueRouter({
  hashbang: false,
  abstract: true
})

router.map({
  '/:type/:name': {
    component: Main
  },
  '/': {
    component: Main
  }
})

router.start(App, '#app')
