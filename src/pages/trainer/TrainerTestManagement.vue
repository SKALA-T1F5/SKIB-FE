<template>
  <AILoading :show="isLoading" :message="loadingMessage" />
  <div class="common-container">
    <div class="header-section">
      <h2 class="section-title-main">테스트 관리</h2>
      <p class="section-subtitle">프로젝트 내 테스트를 확인하고 관리합니다.</p>
    </div>

    <section class="test-list-section section-bg" v-if="currentStep === 'list'">
      <div class="list-header">
        <h4 class="section-title">생성된 테스트 목록</h4>
      </div>
      <v-row dense class="test-cards-grid">
        <v-col cols="12" sm="6" md="4" lg="3" class="d-flex pa-2">
          <v-card
            class="add-new-test-card d-flex flex-column justify-center align-center pa-4"
            outlined
            @click="goToPrompt"
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
      <div class="list-footer">
        <span class="total-count">총 {{ tests.length }}개 테스트</span>
      </div>
    </section>

    <TestPrompt
      v-else-if="currentStep === 'prompt'"
      :is-loading="isLoading"
      @prev-step="goToList"
      @next-step="handlePromptNext"
    />

    <TestConfig
      v-else-if="currentStep === 'config'"
      :exam-goal="examPrompt"
      :selected-document="selectedDocument"
      :revenues="revenues"
      :total-mcq-count="totalMcqCount"
      :total-saq-count="totalSaqCount"
      :is-loading="isLoading"
      @update:selected-document="updateSelectedDocument"
      @update:revenues="updateRevenues"
      @prev-step="goToPrompt"
      @next-step="handleConfigNext"
    />

    <TestQuestion
      v-else-if="currentStep === 'question'"
      :test-id="testId"
      :is-loading="isLoading"
      @prev-step="goToConfig"
      @next-step="handleQuestionNext"
    />

    <TestGenerate
      v-else-if="currentStep === 'generate'"
      :test-id="testId"
      :test-link="testLink"
      @return-to-list="goToList"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import AILoading from '@/components/layouts/AiLoading.vue'
import TestCard from '@/components/trainer/test/TestCard.vue'
import TestPrompt from '@/components/trainer/test/TestPrompt.vue'
import TestConfig from '@/components/trainer/test/TestConfig.vue'
import TestQuestion from '@/components/trainer/test/TestQuestion.vue'
import TestGenerate from '@/components/trainer/test/TestGenerate.vue'

const router = useRouter()
const route = useRoute()

const currentStep = ref('list')
const isLoading = ref(false)
const loadingMessage = ref('데이터 로딩 중입니다...')

const tests = ref([]) // 테스트 목록 데이터를 저장할 반응형 변수

const examPrompt = ref('')
const testId = ref(null)
const testLink = ref('')

const selectedDocument = ref({
  title: '',
  examTime: 60,
  difficulty: 'NORMAL',
  passScore: 60,
  retakeAllowed: true,
})

const revenues = ref([]) // 문서 목록

const totalMcqCount = computed(() =>
  revenues.value.reduce((sum, doc) => sum + (doc.selected ? doc.mcSet : 0), 0),
)
const totalSaqCount = computed(() =>
  revenues.value.reduce((sum, doc) => sum + (doc.selected ? doc.sqSet : 0), 0),
)

const currentProjectId = computed(
  () => route.params.projectId || localStorage.getItem('projectId') || 'mock-project-123',
)

// --- Step Navigation Functions ---

const goToList = () => {
  currentStep.value = 'list'
  // 상태 초기화
  examPrompt.value = ''
  testId.value = null
  testLink.value = ''
  selectedDocument.value = {
    title: '',
    examTime: 60,
    difficulty: 'NORMAL',
    passScore: 60,
    retakeAllowed: true,
  }
  revenues.value = []
  loadingMessage.value = '데이터 로딩 중입니다...'
  isLoading.value = false
  fetchTests() // 목록으로 돌아올 때 테스트 목록 다시 로드
}

const goToPrompt = () => {
  currentStep.value = 'prompt'
  isLoading.value = false
}

const goToConfig = async () => {
  currentStep.value = 'config'
  await fetchDocuments()
}

const goToQuestion = () => {
  currentStep.value = 'question'
  isLoading.value = false
}

const goToGenerate = () => {
  currentStep.value = 'generate'
  isLoading.value = false
  testLink.value = `${window.location.origin}/exam/${testId.value || 'mock-test-id-123'}`
}

// --- Event Handlers from Child Components ---

const handlePromptNext = async (prompt) => {
  examPrompt.value = prompt
  loadingMessage.value = '테스트 세팅 중입니다...'
  isLoading.value = true

  try {
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const createdTestId = 'test-' + Date.now()
    testId.value = createdTestId
    selectedDocument.value.title = examPrompt.value

    await goToConfig()
  } catch (error) {
    console.error('시험 생성 중 오류 발생 (Mock):', error)
    alert('시험 생성 중 오류가 발생했습니다. (Mock)')
  } finally {
    // isLoading은 goToConfig() 내부의 fetchDocuments()에서 관리
  }
}

const handleConfigNext = async (configData) => {
  loadingMessage.value = '문제 생성 중입니다...'
  isLoading.value = true
  try {
    selectedDocument.value = configData.selectedDocument
    revenues.value = configData.revenues

    const selectedDocs = revenues.value.filter(
      (doc) => doc.selected && (doc.mcSet > 0 || doc.sqSet > 0),
    )
    if (selectedDocs.length === 0) {
      alert('문서를 선택하고 생성할 문제 수를 설정해주세요.')
      isLoading.value = false
      loadingMessage.value = '데이터 로딩 중입니다...'
      return
    }

    await new Promise((resolve) => setTimeout(resolve, 3000))

    goToQuestion()
  } catch (error) {
    console.error('시험 설정 저장 중 오류 발생 (Mock):', error)
    alert('시험 설정 저장 중 오류가 발생했습니다. (Mock)')
  } finally {
    isLoading.value = false
    loadingMessage.value = '데이터 로딩 중입니다...'
  }
}

const handleQuestionNext = () => {
  goToGenerate()
}

// --- Data Fetching (Mock) for TestList content ---
const fetchTests = async () => {
  isLoading.value = true
  loadingMessage.value = '테스트 목록을 불러오는 중입니다...'
  try {
    await new Promise((resolve) => setTimeout(resolve, 500))
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
  } catch (error) {
    console.error('테스트 목록 가져오기 실패 (Mock):', error)
    tests.value = []
  } finally {
    isLoading.value = false
    loadingMessage.value = '데이터 로딩 중입니다...'
  }
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

// --- Data Fetching (Mock) for TestConfig content ---
const fetchDocuments = async () => {
  isLoading.value = true
  loadingMessage.value = '문서 목록을 불러오는 중입니다...'
  try {
    await new Promise((resolve) => setTimeout(resolve, 300))
    revenues.value = [
      {
        id: 101,
        name: 'Aiper Front 개발환경 가이드.pdf',
        keyword: 'React, Vue, Webpack',
        selected: true,
        mcSet: 3,
        sqSet: 2,
      },
      {
        id: 102,
        name: 'alopex_UI_1.1.2_개발가이드.pdf',
        keyword: 'UI Component, CSS, JS',
        selected: true,
        mcSet: 2,
        sqSet: 1,
      },
      {
        id: 103,
        name: '개발 Process 흐름도_sample.pptx',
        keyword: 'Agile, Scrum, Git',
        selected: false,
        mcSet: 0,
        sqSet: 0,
      },
      {
        id: 104,
        name: 'Vue.js 완벽 가이드.pdf',
        keyword: 'Vuex, Pinia, Composition API',
        selected: true,
        mcSet: 4,
        sqSet: 3,
      },
      {
        id: 105,
        name: 'Spring Boot 시작하기.docx',
        keyword: 'Spring, Java, Backend',
        selected: false,
        mcSet: 0,
        sqSet: 0,
      },
    ]
  } catch (error) {
    console.error('문서 목록 가져오기 실패 (Mock):', error)
    revenues.value = []
  } finally {
    isLoading.value = false
    loadingMessage.value = '데이터 로딩 중입니다...'
  }
}

// --- Watchers and Mounted ---
const updateSelectedDocument = (newVal) => {
  selectedDocument.value = newVal
}

const updateRevenues = (newVal) => {
  revenues.value = newVal
}

onMounted(() => {
  // `TrainerTestManagement.vue`가 프로젝트 라우트의 자식으로 설정되어 있다면,
  // 새로고침 시에도 URL을 통해 올바른 테스트 ID를 가져올 수 있도록 라우트 파라미터를 확인합니다.
  if (route.query.step) {
    currentStep.value = route.query.step
  }
  // 만약 특정 테스트의 상세 페이지로 직접 라우팅된 경우,
  // 해당 테스트 ID를 사용하여 필요한 데이터를 로드하거나 상태를 설정할 수 있습니다.
  // 이 예시에서는 testId를 라우트에서 직접 받지 않으므로, TestCard에서 전달된 ID를 사용합니다.

  fetchTests() // 컴포넌트 마운트 시 테스트 목록 로드
})
</script>

<style scoped>
/* TrainerDocumentManagement.vue의 common-container padding 값으로 통일 */
.common-container {
  max-width: 100%;
  margin: 0 auto;
  padding: 24px 12px; /* 문서 관리 페이지와 동일하게 수정 */
}

/* Common header styles (TrainerDocumentManagement.vue에서 가져옴) */
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

.section-title {
  font-size: 22px;
  font-weight: bold;
  margin-bottom: 18px;
  font-family: inherit;
}

.section-bg {
  background: #eef2f6;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  padding: 24px; /* 문서 관리 페이지와 동일하게 수정 */
  margin-bottom: 32px;
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
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 16px;
}

.add-new-test-card:hover {
  background-color: #f0f0f0;
  border-color: #777;
}

/* TrainerDocumentManagement.vue의 list-footer 스타일 적용 */
.list-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 8px 0 16px 0;
}

.total-count {
  color: #888;
  font-size: 0.95rem;
}
</style>
