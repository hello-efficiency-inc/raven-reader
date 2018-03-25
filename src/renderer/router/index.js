import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'main',
      component: require('@/views/MainView').default
    },
    {
      path: '/unread',
      name: 'unread',
      component: require('@/views/UnreadView').default
    },
    {
      path: '/favourites',
      name: 'favourites',
      component: require('@/views/FavouriteView').default
    },
    {
      path: '/:id',
      name: 'article',
      component: require('@/views/MainView').default
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
