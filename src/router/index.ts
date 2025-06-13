import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import Login from '@/pages/general/Login.vue'
import MyPage from '@/pages/general/MyPage.vue'
import TrainerMain from '@/pages/trainer/TrainerMain.vue'
import TraineeMain from '@/pages/trainee/TraineeMain.vue'
import TraineeTestGuide from '@/pages/trainee/TraineeTestGuide.vue';
import TraineeTest from '@/pages/trainee/TraineeTest.vue'
import TraineeTestResult from '@/pages/trainee/TraineeTestResult.vue'
import TraineeTestFeedback from '@/pages/trainee/TraineeTestFeedback.vue'

const routes: RouteRecordRaw[] = [
  { path: '/login', name: 'Login', component: Login },
  { path: '/mypage', name: 'MyPage', component: MyPage },
  { path: '/trainer/main', name: 'TrainerMain', component: TrainerMain },
  { path: '/trainee/main', name: 'TraineeMain', component: TraineeMain },
  {
    path: '/test-guide/:testId', // testId를 파라미터로 받음
    name: 'TraineeTestGuide',
    component: TraineeTestGuide,
    props: true, // 라우트 파라미터를 컴포넌트 prop으로 전달
  },
  {
    path: '/trainee/test/attend/:testId', // 응시 페이지 경로
    name: 'TraineeTest',
    component: TraineeTest,
    props: true
  },
  { path: '/:pathMatch(.*)*', redirect: '/login' },
  {
    path: '/trainee/test/result/:testId',
    name: 'TraineeTestResult',
    component: TraineeTestResult,
    props: true // 파라미터를 props로 받으려면 필요
  },
  {
    path: '/trainee/test/feedback/:testId',
    name: 'TraineeTestFeedback',
    component: TraineeTestFeedback,
    props: true
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// export const isExamActive = ref(false);

// export function setExamActive(status: boolean) {
//   isExamActive.value = status;
// }

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const role = localStorage.getItem('role') // Trainer | Trainee

  // 1. 로그인 페이지로 이동하면 기존 세션 제거
  if (to.name === 'Login') {
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    localStorage.removeItem('name')
    return next()
  }

  // 2. 로그인이 안 된 상태에서 보호된 페이지 접근
  if (!token && to.name !== 'Login') {
    alert('로그인이 필요합니다.')
    return next({ name: 'Login' })
  }

  // 3. 로그인된 사용자가 자신의 Role이 아닌 경로 접근 시 → 본인 메인으로 리다이렉트
  if (token && role) {
    if (role === 'Trainer' && to.path.startsWith('/trainee')) {
      alert('접근 권한이 없습니다. (Trainee 전용 영역)')
      return next({ name: 'TrainerMain' })
    }
    if (role === 'Trainee' && to.path.startsWith('/trainer')) {
      alert('접근 권한이 없습니다. (Trainer 전용 영역)')
      return next({ name: 'TraineeMain' })
    }
  }

  // 4. 그 외 정상 라우팅
  next()
})

export default router
