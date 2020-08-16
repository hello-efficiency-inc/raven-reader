import Vue from 'vue'
import VueRouter from 'vue-router'
import Main from '../views/Main.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'main-page',
    component: Main
  },
  {
    path: '/article/:id',
    name: 'article-page',
    component: Main
  },
  {
    path: '/category/:category',
    name: 'category-page',
    component: Main
  },
  {
    path: '/feed/:feedid',
    name: 'feed-page',
    component: Main
  },
  {
    path: '/:type',
    name: 'type-page',
    component: Main
  },
  {
    path: '*',
    redirect: '/'
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
