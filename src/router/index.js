import { createRouter, createWebHistory } from 'vue-router'
import VotePage from '../views/VotePage.vue'
import GeneratorPage from '../views/GeneratorPage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/vote',
      name: 'VotePage',
      component: VotePage
    },
    {
      path: '/generate',
      name: 'GeneratorPage',
      component: GeneratorPage
    }
  ],
})

export default router
