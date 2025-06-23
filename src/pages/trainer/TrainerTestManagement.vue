<template>
  <AILoading :show="isLoading" :message="loadingMessage" />
  <v-container fluid class="common-container">
    <TestList v-if="currentStep === 'list'" @add-exam="goToPrompt" />

    <TestPrompt
      v-else-if="currentStep === 'prompt'"
      :is-loading="isLoading"
      @prev-step="goToList"
      @next-step="handlePromptNext"
    />

    <TestConfig
      v-else-if="currentStep === 'config'"
      :exam-goal="examGoal"
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
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import AILoading from '@/components/layouts/AiLoading.vue'
import TestList from '@/components/trainer/test/TestList.vue'
import TestPrompt from '@/components/trainer/test/TestPrompt.vue'
import TestConfig from '@/components/trainer/test/TestConfig.vue'
import TestQuestion from '@/components/trainer/test/TestQuestion.vue'
import TestGenerate from '@/components/trainer/test/TestGenerate.vue'

const router = useRouter()
const route = useRoute()

const currentStep = ref('list')
const isLoading = ref(false)
const loadingMessage = ref('데이터 로딩 중입니다...')

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
}

const goToPrompt = () => {
  currentStep.value = 'prompt'
  isLoading.value = false
}

const goToConfig = async () => {
  currentStep.value = 'config'
  // fetchDocuments()는 TestConfig 컴포넌트가 마운트될 때 호출되거나,
  // 아니면 이 `goToConfig` 함수 자체에서 필요한 데이터를 가져와야 합니다.
  // 현재 fetchDocuments()는 isLoading을 설정하고 있으므로,
  // goToConfig를 호출하는 시점에만 isLoading이 켜지도록 변경합니다.
  // 이 부분이 가장 중요합니다: fetchDocuments가 이미 TestConfig 내부에서 호출되고 있을 수 있습니다.
  // 여기서는 단순히 단계만 변경하도록 하고, 데이터 로딩은 해당 컴포넌트의 책임으로 둡니다.
  // 만약 TestConfig에서 props로 데이터를 받아야 한다면, 여기서 미리 데이터를 가져와야 합니다.
  // 현재 코드를 보면 TestConfig는 revenues와 selectedDocument를 props로 받고 있으므로,
  // goToConfig에서 fetchDocuments를 호출하는 것이 맞습니다.
  // 다만, fetchDocuments의 isLoading 관리가 중요합니다.
  await fetchDocuments() // TestConfig로 이동 전에 문서 목록을 가져옵니다.
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
  isLoading.value = true // 로딩 시작

  try {
    // 1.5초는 TestConfig가 초기 데이터를 처리하는 시간으로 가정 (mock API 호출)
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const createdTestId = 'test-' + Date.now()
    testId.value = createdTestId
    selectedDocument.value.title = examPrompt.value

    // 중요한 변경: goToConfig()는 currentStep만 변경하도록 하고,
    // fetchDocuments()의 isLoading 관리는 fetchDocuments() 내부에서만 합니다.
    // goToConfig() 자체가 비동기 함수이므로, await를 붙여 로딩이 끝난 후 단계 전환을 보장합니다.
    await goToConfig() // TestConfig로 이동 (내부에서 문서 로딩 시작)
  } catch (error) {
    console.error('시험 생성 중 오류 발생 (Mock):', error)
    alert('시험 생성 중 오류가 발생했습니다. (Mock)')
  } finally {
    // isLoading은 TestConfig로 전환되면서 fetchDocuments가 처리하므로,
    // 여기서는 AILoading을 끄는 로직은 제거하거나,
    // goToConfig()가 완료된 시점에 명확하게 false로 설정해야 합니다.
    // goToConfig() 내부에서 isLoading을 다시 true로 만들고 false로 만들기에,
    // 여기서는 isLoading을 false로 만들지 않는 것이 맞습니다.
    // isLoading.value = false; // <-- 이 줄을 제거하거나, goToConfig() 호출 후에 명확히 처리
    // loadingMessage.value = '데이터 로딩 중입니다...'; // 메시지 초기화
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

// --- Data Fetching (Mock) ---
const fetchDocuments = async () => {
  isLoading.value = true // 문서 로딩 시작 (AILoading 표시)
  loadingMessage.value = '문서 목록을 불러오는 중입니다...' // 로딩 메시지 업데이트
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
    isLoading.value = false // 문서 로딩 완료 (AILoading 숨김)
    loadingMessage.value = '데이터 로딩 중입니다...' // 메시지 초기화
  }
}

// --- Watchers and Mounted ---
// TestConfig에서 내부적으로 업데이트된 selectedDocument와 revenues를 받아서 동기화
const updateSelectedDocument = (newVal) => {
  selectedDocument.value = newVal
}

const updateRevenues = (newVal) => {
  revenues.value = newVal
}

onMounted(() => {
  // 컴포넌트 마운트 시 초기 라우트 상태에 따라 처리
  if (route.query.step) {
    currentStep.value = route.query.step
  }
})

// Optional: watch currentStep if you want to perform actions on step change
// watch(currentStep, (newStep, oldStep) => {
//   console.log(`Step changed from ${oldStep} to ${newStep}`);
//   // Perform any step-specific actions if needed
// });
</script>

<style scoped>
.common-container {
  padding: 24px;
  max-width: 1150px; /* 고정 너비 */
  margin: 0 auto; /* 중앙 정렬 */
  min-height: calc(100vh - 64px - 64px); /* 헤더, 푸터 높이 제외 */
}
</style>
