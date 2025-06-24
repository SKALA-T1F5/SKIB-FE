<template>
  <v-container fluid class="common-container">
    <div class="header-section">
      <h2 class="section-title-main">테스트 관리</h2>
      <p class="section-subtitle">프로젝트 내 테스트를 확인하고 관리합니다.</p>
    </div>

    <v-row dense class="test-cards-grid">
      <v-col cols="12" sm="6" md="4" lg="3" class="d-flex pa-2">
        <v-card
          class="add-new-test-card d-flex flex-column justify-center align-center pa-4"
          outlined
          @click="addExam"
        >
          <v-icon size="48" color="#191d5a">mdi-plus-circle-outline</v-icon>
          <span class="mt-2 text-h6" style="color: #191d5a">새 테스트 생성</span>
        </v-card>
      </v-col>

      <v-col
        v-for="test in tests"
        :key="test.id"
        cols="12"
        sm="6"
        md="4"
        lg="3"
        class="d-flex pa-2"
      >
        <TestCard
          :test="test"
          @copy-link="handleCopyLink"
          @go-to-questions="handleGoToQuestions"
          @go-to-dashboard="handleGoToDashboard"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted, defineEmits } from 'vue'
import { useRouter } from 'vue-router' // useRouter 임포트
import TestCard from './TestCard.vue' // TestCard 컴포넌트 임포트

const emit = defineEmits(['add-exam'])
const router = useRouter() // useRouter 훅 사용

const tests = ref([]) // 테스트 목록 데이터를 저장할 반응형 변수

const addExam = () => {
  emit('add-exam')
}

const handleCopyLink = (id) => {
  const link = `${window.location.origin}/exam/${id}`
  if (navigator.clipboard) {
    navigator.clipboard
      .writeText(link)
      .then(() => alert(`링크 복사 완료: ${link}`))
      .catch((err) => console.error('링크 복사 실패:', err))
  } else {
    alert(`링크를 복사해주세요: ${link}`)
  }
}

const handleGoToQuestions = (id) => {
  console.log(`문제 목록으로 이동: ${id}`)
  // TrainerTestQuestion 라우트의 name이 'TrainerTestQuestion'이므로, name을 사용하여 이동
  router.push({ name: 'TrainerTestQuestion', params: { testId: id } })
}

const handleGoToDashboard = (id) => {
  console.log(`응시 현황 대시보드로 이동: ${id}`)
  // TrainerTestStatus 라우트의 name이 'TrainerTestStatus'이므로, name을 사용하여 이동
  router.push({ name: 'TrainerTestStatus', params: { testId: id } })
}

// 목업 데이터 로드
onMounted(() => {
  tests.value = [
    {
      id: 'test-1',
      name: '프로젝트 관리 기본 이해도 평가',
      difficulty: 'NORMAL',
      timeLimit: 60,
      passingScore: 70,
      createdAt: '2024-05-10',
      retakeable: true,
      passCount: 15,
      totalApplicants: 20,
      averageScore: 82,
    },
    {
      id: 'test-2',
      name: 'Vue.js 프론트엔드 심화 과정',
      difficulty: 'HARD',
      timeLimit: 90,
      passingScore: 80,
      createdAt: '2024-05-15',
      retakeable: false,
      passCount: 8,
      totalApplicants: 12,
      averageScore: 75,
    },
    {
      id: 'test-3',
      name: '데이터베이스 설계 원칙',
      difficulty: 'EASY',
      timeLimit: 45,
      passingScore: 60,
      createdAt: '2024-05-20',
      retakeable: true,
      passCount: 25,
      totalApplicants: 30,
      averageScore: 90,
    },
    {
      id: 'test-4',
      name: '클라우드 컴퓨팅 기초',
      difficulty: 'NORMAL',
      timeLimit: 50,
      passingScore: 75,
      createdAt: '2024-05-22',
      retakeable: false,
      passCount: 10,
      totalApplicants: 15,
      averageScore: 68,
    },
    {
      id: 'test-5',
      name: 'Python 프로그래밍 입문',
      difficulty: 'EASY',
      timeLimit: 40,
      passingScore: 65,
      createdAt: '2024-05-25',
      retakeable: true,
      passCount: 18,
      totalApplicants: 22,
      averageScore: 88,
    },
    {
      id: 'test-6',
      name: '머신러닝 알고리즘 분석',
      difficulty: 'HARD',
      timeLimit: 120,
      passingScore: 85,
      createdAt: '2024-05-28',
      retakeable: true,
      passCount: 5,
      totalApplicants: 10,
      averageScore: 72,
    },
  ]
})
</script>

<style scoped>
/* 기존 스타일 유지 */
.common-container {
  max-width: 100%;
  margin: 0 auto;
  padding: 24px 12px;
}

.header-section {
  display: flex;
  align-items: flex-end;
  gap: 18px;
  margin-bottom: 24px;
}

.section-title-main {
  font-size: 28px;
  font-weight: bold;
  line-height: 1;
  margin: 0;
  color: #333;
}

.section-subtitle {
  font-size: 12px;
  color: #a1a1a1;
  font-weight: normal;
  margin-left: 0;
  white-space: nowrap;
  line-height: 1;
  padding-bottom: 2px;
}

.test-cards-grid {
  margin: -8px !important;
}

.add-new-test-card {
  width: 100%;
  height: 100%;
  min-height: 380px;
  border: 2px dashed #a1a1a1;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
}

.add-new-test-card:hover {
  background-color: #f0f0f0;
  border-color: #777;
}
</style>
