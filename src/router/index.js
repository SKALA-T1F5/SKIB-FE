import { createRouter, createWebHistory } from 'vue-router'
import MyPage from '@/pages/general/MyPage.vue'

// General Pages
import Login from '@/pages/general/Login.vue'

// Trainer Pages
import TrainerMain from '@/pages/trainer/TrainerMain.vue'

// Trainee Pages
import TraineeMain from '@/pages/trainee/TraineeMain.vue'
import TraineeTestGuide from '@/pages/trainee/TraineeTestGuide.vue'

// Admin Pages

const routes = [
  // General Routes
  { path: '/login', name: 'Login', component: Login },
  { path: '/mypage', name: 'MyPage', component: MyPage },

  // Trainer Routes
  { path: '/trainer/main', name: 'TrainerMain', component: TrainerMain },

  // Trainee Routes
  { path: '/trainee/main', name: 'TraineeMain', component: TraineeMain },
  {
    path: '/trainee/test/guide/:testId',
    name: 'TraineeTestGuide',
    component: TraineeTestGuide,
    props: true,
  },

  // Admin Routes

  // Fall Back
  { path: '/:pathMatch(.*)*', redirect: '/login' },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routes,
})

export default router
