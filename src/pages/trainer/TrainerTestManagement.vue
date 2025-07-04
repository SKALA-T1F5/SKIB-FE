<template>
  <AILoading :show="isLoading" :message="loadingMessage" />
  <div class="common-container">
    <div class="header-section">
      <h2 class="section-title-main">테스트 관리</h2>

      <p class="section-subtitle">프로젝트 내 테스트를 확인하고 관리합니다.</p>
    </div>

    <template v-if="currentStep === 'list'">
      <section class="test-list-section section-bg">
        <div class="list-header">
          <h4 class="section-title">생성된 테스트 목록</h4>
        </div>

        <v-row dense class="test-cards-grid">
          <v-col cols="12" sm="6" md="4" lg="3" class="d-flex pa-2">
            <v-card
              class="add-new-test-card d-flex flex-column justify-center align-center pa-4"
              outlined
              @click="goToTestTypeSelection"
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
              @delete-test="handleDeleteTest"
            />
          </v-col>
        </v-row>

        <div class="list-footer">
          <span class="total-count">총 {{ tests.length }}개 테스트</span>
        </div>
      </section>
    </template>

    <TestTypeSelection
      v-else-if="currentStep === 'type-selection'"
      :is-loading="isLoading"
      @prev-step="goToList"
      @next-step="handleTypeSelectionNext"
    />

    <TestPrompt
      v-else-if="currentStep === 'prompt'"
      :is-loading="isLoading"
      :exam-prompt="examPrompt"
      @prev-step="goToTestTypeSelection"
      @next-step="handlePromptNext"
      @update:exam-prompt="(val) => (examPrompt = val)"
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

    <TestQuickConfig
      v-else-if="currentStep === 'quick-config'"
      :revenues="revenues"
      :is-loading="isLoading"
      @update:revenues="updateRevenues"
      @prev-step="goToTestTypeSelection"
      @next-step="handleQuickConfigNext"
    />

    <TestQuestionReviewAI
      v-else-if="currentStep === 'question' && testCreationType === 'ai'"
      :test-id="testId"
      :is-loading="isLoading"
      :selected-document="selectedDocument"
      :revenues="revenues"
      :exam-goal="examPrompt"
      :questions-data="questionsData"
      @update:isLoading="(val) => (isLoading = val)"
      @prev-step="goToConfig"
      @next-step="handleQuestionNext"
    />

    <TestQuestionReviewQuick
      v-else-if="currentStep === 'quick-question' && testCreationType === 'quick'"
      :test-id="testId"
      :is-loading="isLoading"
      :revenues="revenues"
      :questions-data="questionsData"
      :test-name="quickTestName"
      :test-duration="quickTestDuration"
      :passing-score="quickPassingScore"
      @update:isLoading="(val) => (isLoading = val)"
      @prev-step="goToQuickConfig"
      @next-step="handleQuickReviewComplete"
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
import TestTypeSelection from '@/components/trainer/test/TestTypeSelection.vue'
import TestPrompt from '@/components/trainer/test/TestPrompt.vue'
import TestConfig from '@/components/trainer/test/TestConfig.vue'
import TestQuickConfig from '@/components/trainer/test/TestQuickConfig.vue'
import TestQuestionReviewAI from '@/components/trainer/test/TestQuestionReviewAI.vue'
import TestQuestionReviewQuick from '@/components/trainer/test/TestQuestionReviewQuick.vue'
import TestGenerate from '@/components/trainer/test/TestGenerate.vue'
import axios from '@/config/axios'

const router = useRouter()
const route = useRoute()

const currentStep = ref('list')
const isLoading = ref(false)
const loadingMessage = ref('데이터 로딩 중입니다...')

const tests = ref([])
const questionsData = ref([]) // API 응답으로 받은 질문 데이터를 저장할 곳

const examPrompt = ref('') // 이 변수에 사용자가 입력한 프롬프트 또는 AI가 생성한 summary가 저장됩니다.
const testId = ref(null)
const testLink = ref('')
const testCreationType = ref(null) // 'ai' 또는 'quick'

// TestQuickConfig에서 받아온 값들을 저장할 ref 추가 (이제 TestQuickConfig에서 입력받지 않음)
const quickTestName = ref('')
const quickTestDuration = ref()
const quickPassingScore = ref()

const selectedDocument = ref({
  title: '',
  examTime: 60,
  difficulty: 'NORMAL',
  passScore: 60,
  retakeAllowed: true,
})

const revenues = ref([])

const totalMcqCount = computed(() =>
  revenues.value.reduce((sum, doc) => sum + (doc.selected ? doc.mcSet : 0), 0),
)
const totalSaqCount = computed(() =>
  revenues.value.reduce((sum, doc) => sum + (doc.selected ? doc.sqSet : 0), 0),
)

const currentProjectId = computed(
  () => route.params.projectId || localStorage.getItem('projectId') || 'mock-project-123',
)

let statusCheckInterval = null // Status polling interval ID

// --- Step Navigation Functions ---

const goToList = () => {
  router.push({ query: {} }).catch(() => {}) // 쿼리 파라미터 제거하여 'list' 상태로 간주
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
  questionsData.value = [] // Clear questions data
  loadingMessage.value = '데이터 로딩 중입니다...'
  isLoading.value = false
  testCreationType.value = null // 생성 유형 초기화
  quickTestName.value = '' // 빠른 생성 관련 값 초기화
  quickTestDuration.value = 60
  quickPassingScore.value = 60
  fetchTests() // 목록으로 돌아올 때 테스트 목록 다시 로드
}

// "새 테스트 생성" 버튼 클릭 시 호출될 함수
const goToTestTypeSelection = () => {
  router.push({ query: { step: 'type-selection' } }).catch(() => {})
}

const goToPrompt = () => {
  router.push({ query: { step: 'prompt' } }).catch(() => {})
  testCreationType.value = 'ai' // AI 기반 생성으로 설정
  // prompt로 이동 시 로딩 메시지 초기화
  loadingMessage.value = '테스트 목표를 입력해주세요.'
  isLoading.value = false
}

const goToQuickConfig = async () => {
  router.push({ query: { step: 'quick-config' } }).catch(() => {})
  testCreationType.value = 'quick' // 빠른 생성으로 설정
  await fetchDocuments() // 빠른 생성 시 문서 목록 미리 가져오기
}

const goToConfig = async () => {
  router.push({ query: { step: 'config' } }).catch(() => {})
}

// AI 기반 테스트의 문제 검토 단계로 이동
const goToAIQuestion = () => {
  router.push({ query: { step: 'question' } }).catch(() => {})
  isLoading.value = false
}

// 빠른 테스트의 문제 검토 단계로 이동
const goToQuickQuestion = () => {
  console.log('🔍 goToQuickQuestion 호출됨')
  router.push({ query: { step: 'quick-question' } }).catch(() => {})
  isLoading.value = false
  console.log('🔍 라우터 푸시 완료, step: quick-question')
}

// goToGenerate 함수: linkToken 매개변수 추가
const goToGenerate = (linkToken = null) => {
  router.push({ query: { step: 'generate' } }).catch(() => {})
  isLoading.value = false

  // trainer/test/:testId/:linkToken? 라우트 이름으로 URL 생성
  // testId.value는 실제 testId 또는 'mock-test-id-123'이 될 수 있습니다.
  const resolvedRoute = router.resolve({
    name: 'TraineeTestGuide', // trainee/test/:testId/:linkToken? 에 해당하는 라우트 이름
    params: {
      testId: testId.value || 'mock-test-id-123',
      linkToken: linkToken || undefined, // 토큰이 없으면 undefined로 처리하여 경로에서 제외
    },
  })
  testLink.value = `${window.location.origin}${resolvedRoute.href}`
}

// --- Event Handlers from Child Components ---

// TestTypeSelection 컴포넌트에서 'next-step' 이벤트 발생 시 호출
const handleTypeSelectionNext = (selectedType) => {
  if (selectedType === 'ai') {
    goToPrompt()
  } else if (selectedType === 'quick') {
    goToQuickConfig()
  }
}

// TestPrompt 컴포넌트에서 'next-step' 이벤트 발생 시 호출 (프롬프트 전달)
const handlePromptNext = async (prompt) => {
  loadingMessage.value = 'AI가 테스트를 생성 중입니다...'
  isLoading.value = true // 중앙 로딩 시작

  try {
    const response = await axios.post('/test/createByLLM', null, {
      params: {
        userInput: prompt,
        projectId: currentProjectId.value,
      },
    })

    console.log('API 응답 (createByLLM):', response.data)

    if (response.data.statusCode === 'OK' && response.data.resultData) {
      selectedDocument.value = {
        title: response.data.resultData.name,
        examTime: response.data.resultData.limitedTime,
        difficulty: response.data.resultData.difficultyLevel,
        passScore: response.data.resultData.passScore,
        retakeAllowed: response.data.resultData.isRetake,
      }
      examPrompt.value = response.data.resultData.summary
      revenues.value = response.data.resultData.documentConfigs.map((doc) => ({
        id: doc.documentId,
        name: doc.documentName,
        keyword: doc.keywords || [],
        selected: true,
        mcSet: doc.configuredObjectiveCount,
        sqSet: doc.configuredSubjectiveCount,
      }))
      testId.value = response.data.resultData.testId // testId 설정

      goToConfig() // TestConfig 단계로 이동
    } else {
      alert('테스트 생성 중 오류가 발생했습니다: ' + response.data.resultMsg)
    }
  } catch (error) {
    console.error('API 통신 오류 (createByLLM):', error)
    alert(
      '테스트 생성 중 오류가 발생했습니다. 네트워크 연결을 확인하거나 나중에 다시 시도해주세요.',
    )
  } finally {
    isLoading.value = false // 중앙 로딩 종료
    loadingMessage.value = '데이터 로딩 중입니다...' // 메시지 초기화
  }
}

// TestConfig 컴포넌트에서 'next-step' 이벤트 발생 시 호출
const handleConfigNext = async (configData) => {
  loadingMessage.value = '문제 생성 시작...'
  isLoading.value = true
  try {
    const selectedDocs = revenues.value.filter(
      (doc) => doc.selected && (doc.mcSet > 0 || doc.sqSet > 0),
    )
    if (selectedDocs.length === 0) {
      alert('문서를 선택하고 생성할 문제 수를 설정해주세요.')
      isLoading.value = false
      loadingMessage.value = '데이터 로딩 중입니다...'
      return
    }

    const documentConfigsForApi = revenues.value
      .filter((doc) => doc.selected && (doc.mcSet > 0 || doc.sqSet > 0))
      .map((doc) => ({
        documentId: doc.id,
        documentName: doc.name,
        keywords: doc.keyword ? doc.keyword.map((k) => k.trim()) : [],
        configuredObjectiveCount: doc.mcSet,
        configuredSubjectiveCount: doc.sqSet,
      }))

    const requestBody = {
      name: selectedDocument.value.title,
      summary: examPrompt.value,
      difficultyLevel: selectedDocument.value.difficulty,
      limitedTime: selectedDocument.value.examTime,
      passScore: selectedDocument.value.passScore,
      isRetake: selectedDocument.value.retakeAllowed,
      documentConfigs: documentConfigsForApi,
    }

    console.log('API Request Body (POST /test):', requestBody)

    // /test API 호출: 문제 생성을 시작하고 testId를 받습니다.
    const response = await axios.post('/test', requestBody, {
      params: {
        projectId: currentProjectId.value,
      },
    })

    if (response.data.statusCode === 'OK' && response.data.resultData) {
      testId.value = response.data.resultData // API 응답에서 실제 testId 설정 (수정됨)
      startTestGenerationStatusPolling(testId.value) // 문제 생성 상태 폴링 시작
    } else {
      console.error('API 응답이 실패했거나 데이터가 유효하지 않습니다.', response.data)
      alert('테스트 생성에 실패했습니다. 다시 시도해주세요.')
      isLoading.value = false
      loadingMessage.value = '데이터 로딩 중입니다...'
    }
  } catch (error) {
    console.error('시험 설정 저장 및 생성 중 오류 발생:', error)
    alert(
      '시험 설정 저장 및 생성 중 오류가 발생했습니다. 네트워크 연결을 확인하거나 나중에 다시 시도해주세요.',
    )
    isLoading.value = false
    loadingMessage.value = '데이터 로딩 중입니다...'
  }
}

// AI 문제 생성 상태를 폴링하는 함수
const startTestGenerationStatusPolling = (testIdToPoll) => {
  let attempts = 0
  const maxAttempts = 600 // 5초 * 600 = 50분 (넉넉하게 설정)

  statusCheckInterval = setInterval(async () => {
    attempts++
    if (attempts > maxAttempts) {
      clearInterval(statusCheckInterval)
      isLoading.value = false
      loadingMessage.value = '테스트 생성 시간 초과'
      alert('테스트 생성 시간이 초과되었습니다. 다시 시도해주세요.')
      goToList() // 시간 초과 시 목록으로 돌아가기
      return
    }

    try {
      const response = await axios.get(`/test/status`, {
        params: { testId: testIdToPoll },
      })
      const status = response.data.resultData
      loadingMessage.value = `문제 생성 상태: ${getStatusMessage(status)}`

      if (status === 'COMPLETED') {
        clearInterval(statusCheckInterval)
        await fetchGeneratedQuestions(testIdToPoll) // 완료 시 문제 데이터 가져오기
        goToAIQuestion() // AI 기반 테스트의 문제 검토 단계로 이동
        isLoading.value = false
        loadingMessage.value = ''
      } else if (status === 'FAILED') {
        clearInterval(statusCheckInterval)
        isLoading.value = false
        loadingMessage.value = '문제 생성 실패'
        alert('문제 생성에 실패했습니다. 관리자에게 문의해주세요.')
        goToList() // 실패 시 목록으로 돌아가기
      }
    } catch (error) {
      console.error('테스트 상태 확인 중 오류 발생:', error)
      clearInterval(statusCheckInterval)
      isLoading.value = false
      loadingMessage.value = '테스트 상태 확인 오류'
      alert('테스트 상태 확인 중 오류가 발생했습니다. 다시 시도해주세요.')
      goToList() // 오류 발생 시 목록으로 돌아가기
    }
  }, 5000) // 5초 간격으로 요청
}

// 상태 메시지를 한글로 변환하는 헬퍼 함수
const getStatusMessage = (status) => {
  switch (status) {
    case 'TEST_GENERATION_STARTED':
      return '문제 생성 시작'
    case 'LOADING_TEST_PLAN':
      return '테스트 플랜 로딩 중'
    case 'REFLECTING_TEST_PLAN':
      return '테스트 플랜 반영 중'
    case 'RETRIEVING_CONTEXTS':
      return '문맥 탐색 중'
    case 'PREPROCESSING_CONTEXTS':
      return '문맥 전처리 중'
    case 'GENERATING_QUESTIONS':
      return '문제 생성 중'
    case 'POSTPROCESSING_QUESTIONS':
      return '문제 다듬는 중'
    case 'FINALIZING_RESULTS':
      return '결과 생성 중'
    case 'COMPLETED':
      return '문제 생성 완료'
    case 'FAILED':
      return '실패'
    default:
      return '알 수 없는 상태'
  }
}

// 생성된 문제 데이터를 가져오는 함수
const fetchGeneratedQuestions = async (testIdToFetch) => {
  isLoading.value = true
  loadingMessage.value = '생성된 문제 조회 중...'
  try {
    const response = await axios.get(`/test/${testIdToFetch}/questions`) // test/{testId}/questions 엔드포인트
    if (response.data.statusCode === 'OK' && response.data.resultData) {
      questionsData.value = response.data.resultData // questionsData ref에 직접 할당
      console.log('Fetched Generated Questions:', questionsData.value)
    } else {
      console.error('생성된 문제 조회 실패:', response.data.resultMsg)
      alert('생성된 문제를 불러오는 데 실패했습니다.')
      questionsData.value = []
    }
  } catch (error) {
    console.error('생성된 문제 조회 중 오류 발생:', error)
    alert('생성된 문제를 불러오는 중 오류가 발생했습니다.')
    questionsData.value = []
  } finally {
    isLoading.value = false
    loadingMessage.value = ''
  }
}

// TestQuickConfig 컴포넌트에서 'next-step' 이벤트 발생 시 호출
const handleQuickConfigNext = async (updatedRevenues, totalTestQuestions) => {
  loadingMessage.value = '문제를 찾아오는 중입니다.'
  isLoading.value = true

  console.log('🔍 handleQuickConfigNext 시작:', {
    updatedRevenues,
    totalTestQuestions,
    currentProjectId: currentProjectId.value,
  })

  try {
    // 랜덤 테스트 생성 API 호출
    const response = await axios.get('/test/random', {
      params: {
        projectId: currentProjectId.value,
        count: totalTestQuestions,
      },
    })

    console.log('🔍 Random Test API 응답:', response.data)

    if (response.data.statusCode === 'OK') {
      if (Array.isArray(response.data.resultData)) {
        console.log('🔍 questionsData 설정 전:', questionsData.value)
        questionsData.value = response.data.resultData
        console.log('🔍 questionsData 설정 후:', questionsData.value)

        console.log('🔍 goToQuickQuestion 호출 전 상태:', {
          currentStep: currentStep.value,
          testCreationType: testCreationType.value,
          questionsDataLength: questionsData.value.length,
        })

        goToQuickQuestion()

        console.log('🔍 goToQuickQuestion 호출 후 상태:', {
          currentStep: currentStep.value,
          testCreationType: testCreationType.value,
        })
      } else {
        console.error('🔍 resultData가 배열이 아님:', response.data)
        alert('빠른 테스트 생성에 실패했습니다: 올바르지 않은 응답 형식입니다.')
      }
    } else {
      console.error('🔍 API 응답 실패:', response.data)
      alert('빠른 테스트 생성에 실패했습니다: ' + response.data.resultMsg)
    }
  } catch (error) {
    console.error('🔍 빠른 시험 설정 저장 중 오류 발생:', error)
    alert('빠른 시험 설정 저장 중 오류가 발생했습니다.')
  } finally {
    isLoading.value = false
    loadingMessage.value = '데이터 로딩 중입니다.'
  }
}

const handleQuickReviewComplete = async (data) => {
  loadingMessage.value = '테스트 저장 중...'
  isLoading.value = true

  try {
    const requestBody = {
      name: data.testName,
      limitedTime: data.testDuration,
      passScore: data.passingScore,
      projectId: currentProjectId.value,
      difficulty_level: 'RANDOM', // TestQuestionReviewQuick에서 난이도 정보를 받지 않으므로 기본값 사용
      questionIds: data.selectedQuestionIds,
    }

    console.log('API Request Body (POST /test/random/save):', requestBody)

    const response = await axios.post('/test/random/save', requestBody)

    console.log('API 응답 (/test/random/save):', response.data)

    if (response.data.statusCode === 'OK' && response.data.resultData) {
      // API 응답의 resultData에 testId와 linkToken이 있다고 가정
      testId.value = response.data.resultData.testId || null
      goToGenerate(response.data.resultData.linkToken || null) // linkToken을 goToGenerate로 전달
    } else {
      alert('테스트 저장 중 오류가 발생했습니다: ' + response.data.resultMsg)
    }
  } catch (error) {
    console.error('API 통신 오류 (/test/random/save):', error)
    alert(
      '테스트 저장 중 오류가 발생했습니다. 네트워크 연결을 확인하거나 나중에 다시 시도해주세요.',
    )
  } finally {
    isLoading.value = false
    loadingMessage.value = '데이터 로딩 중입니다...'
  }
}

// TestQuestionReviewAI 또는 TestQuestionReviewQuick 컴포넌트에서 'next-step' 이벤트 발생 시 호출
// 인자로 { selectedQuestionIds, toDeleteQuestionIds } 객체를 받도록 수정
const handleQuestionNext = async ({ selectedQuestionIds, toDeleteQuestionIds }) => {
  loadingMessage.value = '테스트와 문제를 최종 저장 중입니다...'
  isLoading.value = true
  try {
    const requestBody = {
      selectedQuestionIds: selectedQuestionIds, // 선택된 문제 ID 목록
      toDeleteQuestionIds: toDeleteQuestionIds, // 삭제될 문제 ID 목록
    }

    console.log('Finalize API Request Body:', requestBody)

    const response = await axios.post(`/test/finalize`, requestBody, {
      params: {
        testId: testId.value,
      },
    })

    // console.log('Finalize API 응답:', response.data)

    if (response.data.statusCode === 'OK') {
      // response.data.resultData.testLinkToken에서 토큰을 추출합니다.
      const testLinkToken = response.data.resultData
      goToGenerate(testLinkToken) // 추출된 토큰을 goToGenerate 함수로 전달
    } else {
      console.error('Test Finalize API 응답 실패:', response.data)
      alert('테스트와 문제 저장에 실패했습니다: ' + response.data.resultMsg)
    }
  } catch (error) {
    console.error('테스트 최종 저장 중 오류 발생:', error)
    alert(
      '테스트 최종 저장 중 오류가 발생했습니다. 네트워크 연결을 확인하거나 나중에 다시 시도해주세요.',
    )
  } finally {
    isLoading.value = false
    loadingMessage.value = '데이터 로딩 중입니다...'
  }
}

// --- Data Fetching for TestList content ---
const fetchTests = async () => {
  isLoading.value = true
  loadingMessage.value = '테스트 목록을 불러오는 중입니다...'
  try {
    // API 호출: projectId를 쿼리 파라미터로 전달
    const response = await axios.get('/test/getTests', {
      params: { projectId: currentProjectId.value },
    })

    if (response.data.statusCode === 'OK' && response.data.resultData) {
      // API 응답 데이터를 TestCard 컴포넌트가 사용하는 형식으로 매핑
      tests.value = response.data.resultData.tests.map((test) => ({
        id: test.testId, // testId를 id로 매핑
        name: test.name,
        difficulty: 'NORMAL', // API에 없는 필드는 기본값 또는 목업 데이터 유지
        timeLimit: test.limitedTime, // limitedTime을 timeLimit으로 매핑
        passingScore: test.passScore || 60, // passScore가 null이면 기본값 60
        createdAt: test.createdAt.split('T')[0], // 'YYYY-MM-DD' 형식으로 변환
        retakeable: true, // API에 없는 필드는 기본값 또는 목업 데이터 유지
        passCount: 0, // API에 없는 필드는 기본값 또는 목업 데이터 유지
        totalApplicants: 0, // API에 없는 필드는 기본값 또는 목업 데이터 유지
        averageScore: 0, // API에 없는 필드는 기본값 또는 목업 데이터 유지
        token: test.testLinkToken || null, // testLinkToken 추가
      }))
    } else {
      console.error('API 응답 오류:', response.data.resultMsg)
      tests.value = []
    }
  } catch (error) {
    console.error('테스트 목록 가져오기 실패:', error)
    alert('테스트 목록을 불러오는 데 실패했습니다.')
    tests.value = []
  } finally {
    isLoading.value = false
    loadingMessage.value = '데이터 로딩 중입니다...'
  }
}

// handleCopyLink 함수 수정: testId를 인자로 받습니다.
// API 응답은 오로지 Token이므로, 해당 testId와 받아온 token으로 링크를 조합합니다.
const handleCopyLink = async (testIdToCopy) => {
  isLoading.value = true
  loadingMessage.value = '초대 링크를 생성 중입니다...'
  try {
    // API 호출: testId를 쿼리 파라미터로 전달하여 해당 테스트의 토큰을 요청
    const response = await axios.get('/test/getInviteLink', {
      params: { testId: testIdToCopy },
    })

    if (response.data.statusCode === 'OK' && response.data.resultData) {
      const inviteToken = response.data.resultData // API 응답이 오로지 토큰이라고 하셨으므로 바로 할당

      // 복사할 링크 조합 (http://localhost:5173/trainee/test/:testId/:inviteToken)
      // const baseUrl = 'http://localhost:5173' // 로컬
      const baseUrl = 'https://skib-frontend.skala25a.project.skala-ai.com/' // 배포

      const copiedLink = `${baseUrl}/trainee/test/${testIdToCopy}/${inviteToken}`

      if (navigator.clipboard) {
        navigator.clipboard
          .writeText(copiedLink)
          .then(() => alert(`링크 복사 완료: ${copiedLink}`))
          .catch((err) => console.error('링크 복사 실패:', err))
      } else {
        alert(`링크를 복사해주세요: ${copiedLink}`)
      }
    } else {
      alert('초대 링크를 가져오는 데 실패했습니다: ' + response.data.resultMsg)
    }
  } catch (error) {
    console.error('초대 링크 가져오기 실패:', error)
    alert(
      '초대 링크를 가져오는 중 오류가 발생했습니다. 네트워크 연결을 확인하거나 나중에 다시 시도해주세요.',
    )
  } finally {
    isLoading.value = false
    loadingMessage.value = '데이터 로딩 중입니다...'
  }
}

const handleGoToQuestions = (id) => {
  console.log(`문제 목록으로 이동: ${id}`)
  router.push({ name: 'TrainerTestQuestion', params: { testId: id } })
}

const handleGoToDashboard = (id) => {
  console.log(`응시 현황 대시보드로 이동: ${id}`)
  router.push({ name: 'TrainerTestStatus', params: { testId: id } })
}

// 새로운 함수: 테스트 삭제 API 호출
const handleDeleteTest = async (testIdToDelete) => {
  isLoading.value = true
  loadingMessage.value = '테스트를 삭제 중입니다...'
  try {
    const response = await axios.delete('/test/deleteTest', {
      params: { testId: testIdToDelete },
    })

    if (response.data.statusCode === 'OK') {
      alert('테스트가 성공적으로 삭제되었습니다.')
      fetchTests() // 삭제 후 테스트 목록 새로고침
    } else {
      alert('테스트 삭제에 실패했습니다: ' + response.data.resultMsg)
      console.error('테스트 삭제 API 응답 오류:', response.data)
    }
  } catch (error) {
    console.error('테스트 삭제 중 오류 발생:', error)
    alert(
      '테스트 삭제 중 오류가 발생했습니다. 네트워크 연결을 확인하거나 나중에 다시 시도해주세요.',
    )
  } finally {
    isLoading.value = false
    loadingMessage.value = '데이터 로딩 중입니다...'
  }
}

// 문서 목록을 가져오는 함수 (TestQuickConfig에서 사용)
const fetchDocuments = async () => {
  isLoading.value = true
  loadingMessage.value = '문서 목록을 불러오는 중입니다...'
  try {
    const response = await axios.get('/test/document-question-counts', {
      params: { projectId: currentProjectId.value },
    })

    if (response.data.statusCode === 'OK' && response.data.resultData) {
      revenues.value = response.data.resultData.map((doc) => ({
        id: doc.documentId,
        name: doc.documentName,
        questionCount: doc.questionCount, // API에서 받은 questionCount를 사용
        keyword: [], // 현재 API 응답에는 keyword 정보가 없으므로 빈 배열로 초기화
        selected: true, // 기본적으로 선택된 상태로 가정
        mcSet: doc.questionCount, // 빠른 생성에서는 전체 문제를 mcSet으로 임시 설정
        sqSet: 0,
      }))
    } else {
      console.error('API 응답 오류:', response.data.resultMsg)
      revenues.value = []
    }
  } catch (error) {
    console.error('문서별 문제 수 가져오기 실패:', error)
    alert('문서 목록을 불러오는 데 실패했습니다.')
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
  console.log('🔍 TrainerTestManagement mounted')
  console.log('🔍 초기 route.query.step:', route.query.step)

  currentStep.value = route.query.step || 'list'

  if (route.query.step === 'question') {
    testCreationType.value = 'ai'
  } else if (route.query.step === 'quick-question') {
    testCreationType.value = 'quick'
  }

  console.log('🔍 초기 상태:', {
    currentStep: currentStep.value,
    testCreationType: testCreationType.value,
  })

  fetchTests()
})

// route.query.step 변경을 감지하여 currentStep 업데이트 (브라우저 뒤로/앞으로 가기 등)
watch(
  () => route.query.step,
  (newStep) => {
    console.log('🔍 route.query.step 변경됨:', newStep)
    if (newStep) {
      currentStep.value = newStep
    } else {
      currentStep.value = 'list'
    }

    if (newStep === 'question') {
      testCreationType.value = 'ai'
    } else if (newStep === 'quick-question') {
      testCreationType.value = 'quick'
    }

    console.log('🔍 상태 업데이트:', {
      currentStep: currentStep.value,
      testCreationType: testCreationType.value,
    })
  },
)

// currentStep 변경을 감지하여 URL 쿼리 업데이트 (내부 버튼 클릭 등)
watch(currentStep, (newStep) => {
  const currentQueryStep = route.query.step
  if (newStep === 'list') {
    // 'list' 단계일 때는 쿼리 파라미터를 제거합니다.
    if (currentQueryStep !== undefined) {
      router.push({ query: {} }).catch(() => {})
    }
  } else {
    // 그 외의 단계에서는 쿼리 파라미터 업데이트
    if (currentQueryStep !== newStep) {
      router.push({ query: { step: newStep } }).catch(() => {})
    }
  }
})

watch(currentProjectId, (newProjectId, oldProjectId) => {
  if (newProjectId && newProjectId !== oldProjectId) {
    // projectId가 유효하고 이전 projectId와 다를 경우에만 fetchTests 호출
    fetchTests()
  }
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
  height: 100%; /* 고정 높이 대신 100%로 설정하여 부모 v-col의 높이에 맞춤 */
  min-height: 380px; /* 원본에서 주어진 최소 높이 유지 */
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
