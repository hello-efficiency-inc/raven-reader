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
      path: '/category/:category',
      name: 'category-page',
      component: require('@/views/Main').default
    },
    {
      path: '/feed/:feedid',
      name: 'feed-page',
      component: require('@/views/Main').default
    },
    {
      path: '/shortcuts',
      name: 'shortcuts',
      component: require('@/views/Shortcuts').default
    },
    {
      path: '/license',
      name: 'license',
      component: require('@/views/License').default
    },
    {
      path: '/:type',
      name: 'type-page',
      component: require('@/views/Main').default
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
