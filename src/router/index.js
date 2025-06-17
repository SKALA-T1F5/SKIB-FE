import { createRouter, createWebHistory } from 'vue-router' // RouteRecordRaw 제거

// ===== General Pages =====
import Login from '@/pages/general/Login.vue'
import MyPage from '@/pages/general/MyPage.vue'

// ===== Trainer Pages =====
import TrainerMain from '@/pages/trainer/TrainerMain.vue'
import Project from '@/components/Trainer/Project.vue'
import DocumentManagement from '@/components/Trainer/DocumentManagement.vue'
import ExamManagement from '@/components/Trainer/ExamManagement.vue'
import ExamGenerate from '@/components/Trainer/Problem/ProblemGenerate.vue'
import ProblemManagement from '@/components/Trainer/ProblemManagement.vue'
import TraineeManagement from '@/components/Trainer/TraineeManagement.vue'
import ProjectDetail from '@/components/Trainer/ProjectDetail.vue'
import ProjectPage from '@/components/Trainer/ProjectPage.vue' // ProjectPage.vue 파일 경로를 적절히 수정하세요.
import MainLayout from '@/components/Layout/MainLayout.vue'

// ===== Trainee Pages =====
import TraineeMain from '@/pages/trainee/TraineeMain.vue'
import TraineeTestGuide from '@/pages/trainee/TraineeTestGuide.vue'
import TraineeTest from '@/pages/trainee/TraineeTest.vue'
import TraineeTestResult from '@/pages/trainee/TraineeTestResult.vue'
import TraineeTestFeedback from '@/pages/trainee/TraineeTestFeedback.vue'

// ===== Admin Pages (예시) =====
// import AdminMain from '@/pages/admin/AdminMain.vue'

const routes = [
  // ===== General Pages =====
  { path: '/login', name: 'Login', component: Login },
  { path: '/mypage', name: 'MyPage', component: MyPage },

  // ===== Trainer Pages =====
  {
    path: '/trainer',
    component: TrainerMain, // MainLayout이 아니라 TrainerMain.vue 사용
    children: [
      { path: '/', redirect: 'main' }, // /trainer 접근 시 기본 redirect
      // { path: 'main', name: 'TrainerMain', component: TrainerMain },
      { path: 'main', name: 'Project', component: Project },
      { path: 'project/:projectId', name: 'ProjectPage', component: ProjectPage },
      { path: 'project/:projectId/projectdetail', name: 'ProjectDetail', component: ProjectDetail },
      { path: 'project/:projectId/document', name: 'DocumentManagement', component: DocumentManagement },
      { path: 'project/:projectId/exam', name: 'ExamManagement', component: ExamManagement },
      { path: 'project/:projectId/exam-generate', name: 'ExamGenerate', component: ExamGenerate },
      { path: 'project/:projectId/problem', name: 'ProblemManagement', component: ProblemManagement },
      { path: 'project/:projectId/trainees', name: 'TrainerTraineeManagement', component: TraineeManagement },
    ]
  },


  // ===== Trainee Pages =====
  { path: '/trainee/main', name: 'TraineeMain', component: TraineeMain },
  {
    path: '/trainee/test/guide/:testId',
    name: 'TraineeTestGuide',
    component: TraineeTestGuide,
    props: true,
  },
  {
    path: '/trainee/test/attend/:testId',
    name: 'TraineeTest',
    component: TraineeTest,
    props: true
  },
  {
    path: '/trainee/test/result/:testId',
    name: 'TraineeTestResult',
    component: TraineeTestResult,
    props: true
  },
  {
    path: '/trainee/test/feedback/:testId',
    name: 'TraineeTestFeedback',
    component: TraineeTestFeedback,
    props: true
  },

  // ===== Admin Pages (예시, 실제 Admin 페이지가 있다면 여기에 추가) =====
  // { path: '/admin/main', name: 'AdminMain', component: AdminMain },

  // ===== Fallback =====
  { path: '/:pathMatch(.*)*', redirect: '/login' },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
})

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