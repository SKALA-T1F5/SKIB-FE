import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import Login from '@/pages/general/Login.vue'
import MyPage from '@/pages/general/MyPage.vue'
import TrainerMain from '@/pages/trainer/TrainerMain.vue'
import TraineeMain from '@/pages/trainee/TraineeMain.vue'

const routes: RouteRecordRaw[] = [
  { path: '/login', name: 'Login', component: Login },
  { path: '/mypage', name: 'MyPage', component: MyPage }, // 오타 수정 적용
  { path: '/trainer/main', name: 'TrainerMain', component: TrainerMain },
  { path: '/trainee/main', name: 'TraineeMain', component: TraineeMain },
  // 예외 처리를 위해 정의되지 않은 경로를 catch-all
  // Note: Vue Router 4에서는 pathMatch(.*)* 대신 :pathMatch(.*)로 변경되었습니다.
  { path: '/:pathMatch(.*)*', redirect: '/login' },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// router.beforeEach((to, from, next) => {
//   const token = localStorage.getItem('token')
//   const role = localStorage.getItem('role') // Trainer | Trainee

//   // 1. 로그인 페이지로 이동하면 기존 세션 제거
//   if (to.name === 'Login') {
//     localStorage.removeItem('token')
//     localStorage.removeItem('role')
//     localStorage.removeItem('name')
//     return next()
//   }

//   // 2. 로그인이 안 된 상태에서 보호된 페이지 접근
//   if (!token && to.name !== 'Login') {
//     alert('로그인이 필요합니다.')
//     return next({ name: 'Login' })
//   }

//   // 3. 로그인된 사용자가 자신의 Role이 아닌 경로 접근 시 → 본인 메인으로 리다이렉트
//   if (token && role) {
//     if (role === 'Trainer' && to.path.startsWith('/trainee')) {
//       alert('접근 권한이 없습니다. (Trainee 전용 영역)')
//       return next({ name: 'TrainerMain' })
//     }
//     if (role === 'Trainee' && to.path.startsWith('/trainer')) {
//       alert('접근 권한이 없습니다. (Trainer 전용 영역)')
//       return next({ name: 'TraineeMain' })
//     }
//   }

//   // 4. 그 외 정상 라우팅
//   next()
// })

export default router
