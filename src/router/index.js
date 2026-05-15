import { createRouter, createWebHistory } from 'vue-router'
import VotePage from '../views/VotePage.vue'
import GeneratorPage from '../views/GeneratorPage.vue'
import UploadLogPage from '../views/UploadLogPage.vue'
import AnomalyResultsPage from '../views/AnomalyResultsPage.vue'
import LandingPage from '../views/LandingPage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'LandingPage',
      component: LandingPage,
    },
    {
      path: '/landing',
      redirect: '/',
    },
    {
      path: '/upload-log',
      name: 'UploadLogPage',
      component: UploadLogPage,
    },
    {
      path: '/anomaly-results',
      name: 'AnomalyResultsPage',
      component: AnomalyResultsPage,
    },
    {
      path: '/vote',
      name: 'VotePage',
      component: VotePage,
    },
    {
      path: '/generate',
      name: 'GeneratorPage',
      component: GeneratorPage,
    },
  ],
})

export default router
