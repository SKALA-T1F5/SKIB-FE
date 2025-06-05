// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import Login from '@/pages/general/Login.vue'
import TrainerMain from '@/pages/trainer/TrainerMain.vue'
import TraineeMain from '@/pages/trainee/TraineeMain.vue'

const routes = [
  { path: '/', name: 'Login', component: Login },
  { path: '/trainer/main', name: 'TrainerMain', component: TrainerMain },
  { path: '/trainee/main', name: 'TraineeMain', component: TraineeMain },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')

  // ✅ 사용자가 수동으로 로그인 페이지로 접근하면 로그아웃 처리
  if (to.name === 'Login') {
    localStorage.removeItem('token')
    localStorage.removeItem('role')
  }

  // ✅ 로그인 아닌 페이지에 접근할 때 토큰이 없으면 로그인으로 이동
  if (to.name !== 'Login' && !token) {
    alert('로그인이 필요합니다.')
    next({ name: 'Login' })
  } else {
    next()
  }
})

export default router
