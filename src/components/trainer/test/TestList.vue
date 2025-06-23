<template>
  <v-container fluid class="test-list-container">
    <AILoading :show="isLoading" />

    <v-row>
      <v-col cols="12">
        <div class="header-section">
          <h2 class="section-title-main">테스트 관리</h2>
          <p class="section-subtitle">관리 중인 테스트 목록을 확인합니다.</p>
        </div>
      </v-col>
    </v-row>

    <v-row class="test-cards-row">
      <v-col cols="12" sm="6" md="4" lg="3" class="d-flex">
        <v-card
          elevation="0"
          class="mx-auto h-100 d-flex flex-column align-center justify-center add-test-card"
          style="border: 2px dashed #ccc; cursor: pointer"
          @click="addExam"
        >
          <div class="text-center">
            <v-icon size="48" color="grey-lighten-1">mdi-plus</v-icon>
            <div class="text-subtitle-1 text-grey-lighten-1 mt-2">새로운 시험 추가</div>
          </div>
        </v-card>
      </v-col>
      <v-col v-for="exam in exams" :key="exam.id" cols="12" sm="6" md="4" lg="3" class="d-flex">
        <TestCard
          :test="exam"
          @copy-link="copyLink"
          @go-to-questions="goToQuestions"
          @go-to-dashboard="goToDashboard"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed, watch, defineEmits } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import AILoading from '@/components/trainer/test/AiLoading.vue'
import TestCard from '@/components/trainer/test/TestCard.vue'
import api from '@/config/axios'

const router = useRouter()
const route = useRoute()
const emit = defineEmits(['add-exam'])

const isLoading = ref(false)
const exams = ref([])

const currentProjectId = computed(() => route.params.projectId || localStorage.getItem('projectId'))

const fetchExams = async () => {
  isLoading.value = true
  try {
    const projectId = currentProjectId.value
    if (!projectId) {
      console.warn('projectId가 없습니다. 테스트 목록을 불러올 수 없습니다.')
      exams.value = []
      return
    }

    const response = await api.get('/test/getTests', {
      params: {
        projectId: parseInt(projectId),
      },
    })

    if (response.data.statusCode === 'OK') {
      const tests = response.data.resultData?.tests
      if (Array.isArray(tests)) {
        exams.value = tests.map((test) => ({
          id: test.testId,
          name: test.name,
          difficulty: test.difficultyLevel || 'NORMAL',
          timeLimit: test.limitedTime,
          passingScore: test.passScore || 0,
          createdAt: new Date(test.createdAt).toLocaleDateString('ko-KR'),
          retakeable: test.retakeable || false,
          passCount: test.passCount || Math.floor(Math.random() * 50),
          totalApplicants: test.totalApplicants || Math.floor(Math.random() * 100) + 50,
          averageScore: test.averageScore || Math.floor(Math.random() * 40) + 60,
        }))
      } else {
        console.error('시험 목록 가져오기 실패: resultData.tests is not an array', tests)
        exams.value = []
      }
    } else {
      console.error('시험 목록 가져오기 실패: statusCode !== OK', response.data.statusCode)
      exams.value = []
    }
  } catch (error) {
    console.error('시험 목록 가져오기 실패:', error)
    exams.value = []
  } finally {
    isLoading.value = false
  }
}

const copyLink = (examId) => {
  const url = `${window.location.origin}/exam/${examId}`
  if (navigator.clipboard) {
    navigator.clipboard
      .writeText(url)
      .then(() => {
        alert('응시 링크가 복사되었습니다!')
      })
      .catch((err) => {
        console.error('복사 실패:', err)
        alert('링크 복사에 실패했습니다.')
      })
  } else {
    const textArea = document.createElement('textarea')
    textArea.value = url
    document.body.appendChild(textArea)
    textArea.select()
    try {
      document.execCommand('copy')
      alert('응시 링크가 복사되었습니다!')
    } catch (err) {
      console.error('Fallback 복사 실패:', err)
      alert('링크 복사에 실패했습니다.')
    }
    document.body.removeChild(textArea)
  }
}

const goToQuestions = (examId) => {
  router.push(`/trainer/test/${examId}/questions`)
}

const goToDashboard = (examId) => {
  router.push(`/dashboard/exam/${examId}`)
}

const addExam = () => {
  emit('add-exam') // TrainerTestManagement.vue로 이벤트 전달
}

onMounted(() => {
  fetchExams()
})

watch(currentProjectId, (newProjectId, oldProjectId) => {
  if (newProjectId && newProjectId !== oldProjectId) {
    console.log(`projectId 변경 감지: ${oldProjectId} -> ${newProjectId}. 시험 목록 새로고침.`)
    fetchExams()
  }
})
</script>

<style scoped>
.test-list-container {
  padding: 24px;
  --test-card-min-height: 240px; /* TestCard와 Add Card의 최소 높이를 일관되게 정의 */
}

/* Common header styles */
.header-section {
  display: flex;
  align-items: flex-end; /* 제목과 부제목의 하단 정렬 */
  gap: 18px; /* 제목과 부제목 사이 간격 */
  margin-bottom: 24px; /* 섹션 하단 여백 */
}

.section-title-main {
  font-size: 28px;
  font-weight: bold;
  line-height: 1; /* 높이를 정확히 맞춤 */
  margin: 0;
  color: #333; /* 기본 색상 유지 */
}

.section-subtitle {
  font-size: 12px;
  color: #a1a1a1;
  font-weight: normal;
  margin-left: 0; /* gap으로 간격 제어 */
  white-space: nowrap;
  line-height: 1; /* 높이를 정확히 맞춤 */
  padding-bottom: 2px; /* 미세 조정 */
}

.test-cards-row {
  display: flex; /* Flexbox 활성화 */
  flex-wrap: wrap; /* 필요한 경우 줄바꿈 허용 */
  gap: 20px; /* 카드 사이의 간격 */
  margin: 0 -10px; /* v-col의 padding을 상쇄하여 전체 레이아웃 정렬 */
}

.test-cards-row > .v-col {
  padding: 10px; /* v-col 자체의 패딩 유지 */
  display: flex; /* 내부 콘텐츠(카드)가 flex item이 되도록 설정 */
}

.add-test-card {
  height: 100%;
  min-height: var(--test-card-min-height); /* TestCard와 동일한 최소 높이 */
  border-radius: 8px;
  flex-grow: 1; /* 남은 공간을 채우도록 성장 */
}
</style>
