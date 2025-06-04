import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

// 컴포넌트 import
import Login from '@/pages/Login.vue'
import MyPage from '@/pages/MyPage.vue'
import TraineeMain from '@/pages/TraineeMain.vue'
import TraineeTestResult from '@/pages/TraineeTestResult.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
  },
  {
    path: '/mypage',
    name: 'MyPage',
    component: MyPage
  },
  {
    path: '/trainee/main',
    name: 'TraineeMain',
    component: TraineeMain,
    meta: { requiresAuth: true },
  },
  {
    path: '/trainee/test-result/:testId',
    name: 'TraineeTestResult',
    component: TraineeTestResult,
    meta: { requiresAuth: true },
    props: true,
  },
  {
    path: '/',
    redirect: '/login',
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// ✅ 전역 가드: 로그인 필요 여부 확인
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const isAuthenticated = !!token

  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
  } else {
    next()
  }
})

export default router
