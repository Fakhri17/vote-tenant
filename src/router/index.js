import { createRouter, createWebHistory } from 'vue-router'
import VotePage from '../views/VotePage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/vote',
      name: 'VotePage',
      component: VotePage
    }
  ],
})

export default router
