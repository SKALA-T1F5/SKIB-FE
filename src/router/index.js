import { createRouter, createWebHistory } from 'vue-router'

// Admin Components
import AdminLogin from '@/components/Admin/Login.vue'
import UserManagement from '@/components/Admin/UserManagement.vue'

// Trainer Components
import TrainerLogin from '@/components/Trainer/Login.vue'
import TrainerMyPage from '@/components/Trainer/MyPage.vue'
import MainLayout from '@/components/Layout/MainLayout.vue'
import Project from '@/components/Trainer/Project.vue'
import DocumentManagement from '@/components/Trainer/DocumentManagement.vue'
import ExamManagement from '@/components/Trainer/ExamManagement.vue'
import ProblemManagement from '@/components/Trainer/ProblemManagement.vue'
import TraineeManagement from '@/components/Trainer/TraineeManagement.vue'
import ProjectDetail from '@/components/Trainer/ProjectDetail.vue'
import ProjectPage from '@/components/Trainer/ProjectPage.vue' // ProjectPage.vue 파일 경로를 적절히 수정하세요.

// Trainee Components
import TraineeLogin from '@/components/Trainee/Login.vue'
import TraineeMyPage from '@/components/Trainee/MyPage.vue'
import Test from '@/components/Trainee/Test.vue'
import Exam from '@/components/Trainee/Exam.vue'
import Grading from '@/components/Trainee/Grading.vue'
import Feedback from '@/components/Trainee/Feedback.vue'

const routes = [
  // Admin
  { path: '/admin/login', name: 'AdminLogin', component: AdminLogin },
  {
    path: '/admin',
    component: MainLayout,
    children: [
      { path: 'users', name: 'UserManagement', component: UserManagement }
    ]
  },

  // Trainer
  { path: '/trainer/login', name: 'TrainerLogin', component: TrainerLogin },
  {
    path: '/trainer',
    component: MainLayout,
    children: [
      { path: '', redirect: '/trainer/project' }, // 기본 경로를 project로 리다이렉트
      { path: 'mypage', name: 'TrainerMyPage', component: TrainerMyPage },
      { path: 'project', name: 'Project', component: Project },
      { path: 'project/:projectId', name: 'ProjectPage', component: ProjectPage },
      { path: 'project/:projectId/projectdetail', name: 'ProjectDetail', component: ProjectDetail },
      { path: 'project/:projectId/document', name: 'DocumentManagement', component: DocumentManagement },
      { path: 'project/:projectId/exam', name: 'ExamManagement', component: ExamManagement },
      { path: 'project/:projectId/problem', name: 'ProblemManagement', component: ProblemManagement },
      { path: 'project/:projectId/trainees', name: 'TrainerTraineeManagement', component: TraineeManagement },
    ]
  },

  // Trainee
  { path: '/trainee/login', name: 'TraineeLogin', component: TraineeLogin },
  {
    path: '/trainee',
    component: MainLayout,
    children: [
      { path: 'mypage', name: 'TraineeMyPage', component: TraineeMyPage },
      { path: 'test', name: 'Test', component: Test },
      { path: 'exam', name: 'Exam', component: Exam },
      { path: 'grading', name: 'Grading', component: Grading },
      { path: 'feedback', name: 'Feedback', component: Feedback }
    ]
  },

  // 기본 경로 (✅ 임시주석 : 미로그인시 로그인페이지로, 차후 주석 해제)
  // { path: '/', redirect: '/trainer/login' },
  // { path: '/:pathMatch(.*)*', redirect: '/' } // 404 처리
  { path: '/', redirect: '/trainer/project' },
  { path: '/:pathMatch(.*)*', redirect: '/' } // 404 처리
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
