import { createRouter, createWebHistory } from 'vue-router'
import VotePage from '../views/VotePage.vue'
import GeneratorPage from '../views/GeneratorPage.vue'
import UploadLogPage from '../views/UploadLogPage.vue'
import AnomalyResultsPage from '../views/AnomalyResultsPage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/upload-log',
      redirect: '/upload-log',
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
