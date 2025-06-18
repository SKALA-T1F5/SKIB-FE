import { createRouter, createWebHistory } from 'vue-router'

// General Pages
import Login from '@/pages/general/Login.vue'

// Trainer Pages
import TrainerMain from '@/pages/trainer/TrainerMain.vue'

// Trainee Pages
import TraineeMain from '@/pages/trainee/TraineeMain.vue'

// Admin Pages

const routes = [
  // General Routes
  { path: '/login', name: 'Login', component: Login },

  // Trainer Routes
  { path: '/trainer/main', name: 'TrainerMain', component: TrainerMain },

  // Trainee Routes
  { path: '/trainee/main', name: 'TraineeMain', component: TraineeMain },

  // Admin Routes

  // Fall Back
  { path: '/:pathMatch(.*)*', redirect: '/login' },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routes,
})

export default router
