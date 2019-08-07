import Vue from 'vue'
import Router from 'vue-router'
import Lists from '@/components/Lists'
import List from '@/components/List'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Lists',
      component: Lists
    },
    {
      path: '/:id',
      name: 'List',
      component: List,
      props: true
    }
  ]
})
