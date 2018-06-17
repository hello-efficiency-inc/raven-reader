import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'main-page',
      component: require('@/views/Main').default
    },
    {
      path: '/article/:id',
      name: 'article-page',
      component: require('@/views/Main').default
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
