import { createRouter, createWebHistory } from 'vue-router'
import MyPage from '@/pages/general/MyPage.vue'

// General Pages
import Login from '@/pages/general/Login.vue'

// Trainer Pages
import TrainerMain from '@/pages/trainer/TrainerMain.vue'
import TrainerDocumentManagement from '@/pages/trainer/TrainerDocumentManagement.vue'
import TrainerTestManagement from '@/pages/trainer/TrainerTestManagement.vue'
import TrainerTraineeManagement from '@/pages/trainer/TrainerTraineeManagement.vue'
import TrainerTestQuestion from '@/pages/trainer/TrainerTestQuestion.vue' // TrainerTestQuestion import 추가
import TrainerTestStatus from '@/pages/trainer/TrainerTestStatus.vue' // TrainerTestStatus import 추가

// Trainee Pages
import TraineeMain from '@/pages/trainee/TraineeMain.vue'
import TraineeTestGuide from '@/pages/trainee/TraineeTestGuide.vue'
import TraineeTest from '@/pages/trainee/TraineeTest.vue'
import TraineeTestResult from '@/pages/trainee/TraineeTestResult.vue'
import TraineeTestFeedback from '@/pages/trainee/TraineeTestFeedback.vue'

// Admin Pages
import ProjectList from '@/pages/admin/ProjectList.vue'
import TraineeList from '@/pages/admin/TraineeList.vue'
import TrainerList from '@/pages/admin/TrainerList.vue'
import AdminLogin from '@/pages/admin/AdminLogin.vue'

const routes = [
  // General Routes
  { path: '/login', name: 'Login', component: Login },
  { path: '/mypage', name: 'MyPage', component: MyPage },

  // Trainer Routes
  { path: '/trainer/main', name: 'TrainerMain', component: TrainerMain },
  {
    path: '/trainer/project/:projectId',
    component: () => import('@/components/trainer/project/ProjectDetail.vue'),
    children: [
      { path: '', redirect: 'test' },
      { path: 'document', component: TrainerDocumentManagement },
      { path: 'test', component: TrainerTestManagement },
      { path: 'trainee', component: TrainerTraineeManagement },
    ],
  },
  {
    path: '/trainer/test/questions/:testId', // 새로운 라우트 추가
    name: 'TrainerTestQuestion',
    component: TrainerTestQuestion,
    props: true,
  },
  {
    path: '/trainer/test/status/:testId', // TrainerTestStatus 라우트 추가
    name: 'TrainerTestStatus',
    component: TrainerTestStatus,
    props: true,
  },

  // Trainee Routes
  {
    path: '/trainee/main',
    name: 'TraineeMain',
    component: TraineeMain,
    props: true, // 이 줄을 제거하여 $route.params로 접근하도록 합니다.
  },
  {
    path: '/trainee/test/:testId/:linkToken?', // linkToken을 선택적 파라미터로 추가하고 props: true 제거
    name: 'TraineeTestGuide',
    component: TraineeTestGuide,
    // props: true, // 이 줄을 제거하여 $route.params로 접근하도록 합니다.
  },
  {
    path: '/trainee/test/attend/:testId',
    name: 'TraineeTest',
    component: TraineeTest,
    props: true,
  },
  {
    path: '/trainee/test/result/:testId',
    name: 'TraineeTestResult',
    component: TraineeTestResult,
    props: true,
  },
  {
    path: '/trainee/test/feedback/:testId',
    name: 'TraineeTestFeedback',
    component: TraineeTestFeedback,
    props: true,
  },

  // Admin Routes
  { path: '/admin/login', name: 'AdminLogin', component: AdminLogin },
  { path: '/admin/projects', name: 'ProjectList', component: ProjectList },
  { path: '/admin/trainees', name: 'TraineeList', component: TraineeList },
  { path: '/admin/trainers', name: 'TrainerList', component: TrainerList },

  // Fall Back
  { path: '/:pathMatch(.*)*', redirect: '/login' },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routes,
})

export default router
