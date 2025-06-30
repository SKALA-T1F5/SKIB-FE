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
              @copy-link="handleCopyLink(test.id, test.token)"
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
      @prev-step="goToConfigOrQuickConfig"
      @next-step="handleQuestionNext"
    />

    <TestQuestionReviewQuick
      v-else-if="currentStep === 'question' && testCreationType === 'quick'"
      :test-id="testId"
      :is-loading="isLoading"
      :revenues="revenues"
      :questions-data="questionsData"
      @update:isLoading="(val) => (isLoading = val)"
      @prev-step="goToConfigOrQuickConfig"
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

const examPrompt = ref('')
const testId = ref(null)
const testLink = ref('')
const testCreationType = ref(null) // 'ai' 또는 'quick'

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
  await fetchDocuments()
}

const goToConfig = async () => {
  router.push({ query: { step: 'config' } }).catch(() => {})
}

const goToQuestion = () => {
  router.push({ query: { step: 'question' } }).catch(() => {})
  isLoading.value = false
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

const goToConfigOrQuickConfig = async () => {
  if (testCreationType.value === 'ai') {
    // AI 기반 테스트의 이전 단계는 TestConfig
    await goToConfig()
  } else if (testCreationType.value === 'quick') {
    // 빠른 테스트의 이전 단계는 TestQuickConfig
    await goToQuickConfig()
  } else {
    // 예외 처리 또는 기본 동작 (예: 목록으로 돌아가기)
    goToList()
  }
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
  examPrompt.value = prompt // TrainerTestManagement에 프롬프트 저장
  loadingMessage.value = 'AI가 테스트를 생성 중입니다...'
  isLoading.value = true // 중앙 로딩 시작

  try {
    const response = await axios.post('/test/createByLLM', null, {
      // 요청 본문은 null
      params: {
        userInput: prompt, // userInput을 쿼리 파라미터로 전달
        projectId: currentProjectId.value, // projectId를 쿼리 파라미터로 전달
      },
    })

    console.log('API 응답 (createByLLM):', response.data)

    if (response.data.statusCode === 'OK' && response.data.resultData) {
      // API 응답 데이터를 TrainerTestManagement의 상태에 업데이트
      // API 응답의 resultData에 직접 필드가 있으므로, examSetting 객체 없이 직접 매핑
      selectedDocument.value = {
        title: response.data.resultData.name, // API 응답의 'name' 사용
        examTime: response.data.resultData.limitedTime,
        difficulty: response.data.resultData.difficultyLevel,
        passScore: response.data.resultData.passScore,
        retakeAllowed: response.data.resultData.isRetake,
      }
      revenues.value = response.data.resultData.documentConfigs.map((doc) => ({
        id: doc.documentId,
        name: doc.documentName,
        keyword: doc.keywords || [], // 수정: keywords를 배열 그대로 사용
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
  loadingMessage.value = '문제 생성 중입니다...'
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
        keywords: doc.keyword ? doc.keyword.map((k) => k.trim()) : [], // 배열 그대로 사용
        configuredObjectiveCount: doc.mcSet,
        configuredSubjectiveCount: doc.sqSet,
      }))

    const requestBody = {
      name: selectedDocument.value.title, // TestConfig에서 설정된 테스트 이름
      summary: examPrompt.value, // TestPrompt에서 설정된 테스트 목표
      difficultyLevel: selectedDocument.value.difficulty,
      limitedTime: selectedDocument.value.examTime,
      passScore: selectedDocument.value.passScore,
      isRetake: selectedDocument.value.retakeAllowed,
      documentConfigs: documentConfigsForApi,
    }

    console.log('API Request Body:', requestBody)

    const response = await axios.post('/test', requestBody, {
      params: {
        projectId: currentProjectId.value,
      },
    })

    console.log('API 응답:', response.data)

    if (
      response.data.statusCode === 'OK' &&
      response.data.resultData &&
      response.data.resultData.testId
    ) {
      testId.value = response.data.resultData.testId // API 응답에서 실제 testId 설정
      // /test?:projectId API 응답에서 questions 부분을 받아와 Parsing

      if (response.data.resultData.questions) {
        questionsData.value = response.data.resultData.questions
      } else {
        questionsData.value = [] // questions 데이터가 없는 경우 빈 배열로 초기화
        console.warn("API 응답에 'questions' 데이터가 포함되어 있지 않습니다.")
      }

      goToQuestion() // 문제 검토 단계로 이동
    } else {
      console.error('API 응답이 실패했거나 데이터가 유효하지 않습니다.', response.data)
      alert('테스트 생성에 실패했습니다. 다시 시도해주세요.')
    }
  } catch (error) {
    console.error('시험 설정 저장 및 생성 중 오류 발생:', error)
    alert(
      '시험 설정 저장 및 생성 중 오류가 발생했습니다. 네트워크 연결을 확인하거나 나중에 다시 시도해주세요.',
    )
  } finally {
    isLoading.value = false
    loadingMessage.value = '데이터 로딩 중입니다...'
  }
}

const handleQuickConfigNext = async (updatedRevenues) => {
  loadingMessage.value = '문제를 찾아오는 중입니다.'
  isLoading.value = true
  try {
    revenues.value = updatedRevenues

    const selectedDocs = revenues.value.filter(
      (doc) => doc.selected && (doc.mcSet > 0 || doc.sqSet > 0),
    )
    if (selectedDocs.length === 0) {
      alert('문서를 선택하고 생성할 문제 수를 설정해주세요.')
      isLoading.value = false
      loadingMessage.value = '데이터 로딩 중입니다.'
      return
    }

    // 실제 API 호출로 대체되어야 합니다.
    // 현재는 TestQuestionReviewAI가 기대하는 mock 데이터 구조를 따릅니다.
    // TODO: 빠른 생성 문제 가져오는 API 호출 로직 추가
    await new Promise((resolve) => setTimeout(resolve, 3000))

    testId.value = 'quick-test-' + Date.now()
    selectedDocument.value.title = '빠른 생성 테스트' // 빠른 생성 테스트 이름 설정 (선택사항)

    // TODO: 실제 API 응답에서 questionsData를 받아오는 로직으로 교체 필요
    questionsData.value = [
      {
        id: 'q1-quick',
        question:
          'Vue.js의 라이프사이클 훅 중 컴포넌트가 마운트된 후 한 번 호출되는 훅은 무엇인가요?',
        type: 'MCQ', // 'MULTIPLE_CHOICE'에서 'MCQ'로 통일
        options: ['created', 'mounted', 'updated', 'unmounted'],
        answer: 'mounted',
        explanation: 'Vue.js 컴포넌트가 DOM에 마운트된 후 호출되는 훅입니다.',
        documentName: 'Vue.js 완벽 가이드.pdf',
        documentId: 104,
        tags: ['Vue.js', 'LifeCycle'],
        difficultyLevel: 'NORMAL',
        generationType: 'BASIC',
      },
      {
        id: 'q2-quick',
        question:
          'Spring Boot에서 RESTful API를 만들 때 사용하는 주요 어노테이션 두 가지를 설명하세요.',
        type: 'Subjective', // 'SHORT_ANSWER'에서 'Subjective'로 통일
        answer: '@RestController, @RequestMapping',
        explanation: 'RESTful 웹 서비스를 개발할 때 주로 사용되는 어노테이션입니다.',
        gradingCriteria: [
          {
            score: 5,
            criteria: '두 가지 어노테이션을 모두 정확히 언급하고 각각의 역할을 설명함.',
            example:
              'RestController는 해당 클래스를 REST API의 컨트롤러로 지정하고, RequestMapping은 요청 URL과 메서드를 매핑합니다.',
          },
          {
            score: 3,
            criteria: '한 가지 어노테이션만 정확히 언급하거나 역할 설명이 부족함.',
            example: 'RestController만 언급하고 설명이 부족함.',
          },
        ],
        documentName: 'Spring Boot 시작하기.docx',
        documentId: 105,
        tags: ['Spring Boot', 'REST API'],
        difficultyLevel: 'HARD',
        generationType: 'BASIC',
      },
      {
        id: 'q3-quick',
        question:
          '프론트엔드 개발에서 번들러(예: Webpack)를 사용하는 주된 이유는 무엇인가요? (객관식)',
        type: 'MCQ',
        options: [
          '코드 압축 및 최적화',
          '모듈 의존성 관리',
          '브라우저 호환성 확보 (Babel 등)',
          '위의 모든 응답',
        ],
        answer: '위의 모든 응답',
        explanation:
          '번들러는 여러 파일을 하나로 묶고, 코드 최적화, 의존성 관리, 트랜스파일링을 통해 브라우저 호환성을 높이는 등 다양한 역할을 합니다.',
        documentName: 'Aiper Front 개발환경 가이드.pdf',
        documentId: 101,
        tags: ['Frontend', 'Webpack'],
        difficultyLevel: 'EASY',
        generationType: 'BASIC',
      },
      {
        id: 'q4-quick-extra',
        question: 'Vue.js에서 컴포넌트 간 데이터 전달 시 가장 일반적인 방법은 무엇인가요? (EXTRA)',
        type: 'MCQ',
        options: [
          'Props를 통한 하향식 전달',
          'Event Bus를 통한 통신',
          'Vuex/Pinia와 같은 상태 관리 라이브러리 사용',
          '전역 변수 사용',
        ],
        answer: 'Props를 통한 하향식 전달',
        explanation:
          '부모에서 자식으로 데이터를 전달할 때는 props를 사용하는 것이 Vue.js의 기본적이고 권장되는 방식입니다.',
        documentName: 'Vue.js 완벽 가이드.pdf',
        documentId: 104,
        tags: ['Vue.js', 'Props'],
        difficultyLevel: 'NORMAL',
        generationType: 'EXTRA', // EXTRA 문제 예시
      },
    ]

    goToQuestion()
  } catch (error) {
    console.error('빠른 시험 설정 저장 중 오류 발생:', error)
    alert('빠른 시험 설정 저장 중 오류가 발생했습니다.')
  } finally {
    isLoading.value = false
    loadingMessage.value = '데이터 로딩 중입니다.'
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

    console.log('Finalize API 응답:', response.data)

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

// handleCopyLink 함수 수정: testId와 token을 인자로 받도록 변경
const handleCopyLink = (testId, token) => {
  // trainer/test/:testId/:linkToken? 라우트 이름으로 URL 생성
  const resolvedRoute = router.resolve({
    name: 'TraineeTestGuide', // trainee/test/:testId/:linkToken? 에 해당하는 라우트 이름
    params: {
      testId: testId,
      linkToken: token || undefined, // 토큰이 없으면 undefined로 처리하여 경로에서 제외
    },
  })
  const link = `${window.location.origin}${resolvedRoute.href}`

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
        keyword: ['React', 'Vue', 'Webpack'], // 수정: 배열로 유지
        selected: true,
        mcSet: 3,
        sqSet: 2,
      },
      {
        id: 102,
        name: 'alopex_UI_1.1.2_개발가이드.pdf',
        keyword: ['UI Component', 'CSS', 'JS'], // 수정: 배열로 유지
        selected: true,
        mcSet: 2,
        sqSet: 1,
      },
      {
        id: 103,
        name: '개발 Process 흐름도_sample.pptx',
        keyword: ['Agile', 'Scrum', 'Git'], // 수정: 배열로 유지
        selected: false,
        mcSet: 0,
        sqSet: 0,
      },
      {
        id: 104,
        name: 'Vue.js 완벽 가이드.pdf',
        keyword: ['Vuex', 'Pinia', 'Composition API'], // 수정: 배열로 유지
        selected: true,
        mcSet: 4,
        sqSet: 3,
      },
      {
        id: 105,
        name: 'Spring Boot 시작하기.docx',
        keyword: ['Spring', 'Java', 'Backend'], // 수정: 배열로 유지
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
  // 컴포넌트 마운트 시 URL 쿼리에서 currentStep을 초기화합니다.
  currentStep.value = route.query.step || 'list' // 현재 라우트 쿼리에서 testCreationType을 설정합니다.

  if (route.query.step === 'question') {
    if (testId.value && String(testId.value).startsWith('quick-test-')) {
      testCreationType.value = 'quick'
    } else {
      testCreationType.value = 'ai' // 기본값 또는 다른 로직으로 AI로 설정
    }
  }

  fetchTests() // 컴포넌트 마운트 시 테스트 목록 로드
})

// route.query.step 변경을 감지하여 currentStep 업데이트 (브라우저 뒤로/앞으로 가기 등)
watch(
  () => route.query.step,
  (newStep) => {
    if (newStep) {
      currentStep.value = newStep
    } else {
      currentStep.value = 'list' // step 쿼리 파라미터가 없으면 'list'로 간주
    } // URL 쿼리 변경 시 testCreationType도 업데이트할 필요가 있다면 여기에 로직 추가
    // 예: if (newStep === 'question' && route.query.type) testCreationType.value = route.query.type;
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
