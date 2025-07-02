<template>
  <v-row>
    <v-col cols="12">
      <div class="header-section">
        <h2 class="section-title-main">테스트 생성</h2>
        <p class="section-subtitle">Step 3 of 4 : 생성된 문제를 확인하고 필요에 따라 교체합니다.</p>
      </div>
      <v-progress-linear
        :model-value="75"
        height="10"
        color="#191d5a"
        bg-color="#191d5a"
        rounded
      ></v-progress-linear>
    </v-col>
  </v-row>

  <v-row class="mt-4" align="stretch" style="min-height: calc(100vh - 200px)">
    <v-col cols="12" sm="4" class="d-flex flex-column">
      <v-card elevation="0" class="section-bg flex-grow-1">
        <v-card-text class="pa-8 d-flex flex-column flex-grow-1">
          <h4 class="section-title mb-6">문제 목록</h4>
          <div
            v-if="isFetchingQuestions"
            class="d-flex justify-center align-center py-10 flex-grow-1"
          >
            <v-progress-circular indeterminate color="#191d5a" size="50"></v-progress-circular>
            <span class="ml-4 text-h6" style="color: #191d5a">문제 로딩 중...</span>
          </div>
          <v-expansion-panels
            v-else
            variant="accordion"
            class="question-list-panels d-flex flex-column flex-grow-1"
            v-model="expandedPanels"
          >
            <v-expansion-panel
              v-for="doc in documents"
              :key="doc.id"
              elevation="0"
              :value="doc.id"
              rounded="lg"
              class="d-flex flex-column"
            >
              <v-expansion-panel-title class="text-body-1 font-weight-medium">
                {{ doc.name.length > 20 ? doc.name.substring(0, 17) + '...' : doc.name }} ({{
                  doc.questions.length
                }})
              </v-expansion-panel-title>
              <v-expansion-panel-text class="d-flex flex-column flex-grow-1">
                <div class="question-list-scrollable flex-grow-1">
                  <v-list lines="two" class="py-0">
                    <v-list-item
                      v-for="(item, i) in doc.questions"
                      :key="item.id"
                      :active="selectedQuestionIndex === questions.indexOf(item)"
                      color="secondary"
                      rounded="sm"
                      density="compact"
                      @click="selectQuestion(questions.indexOf(item))"
                      class="question-list-item"
                    >
                      <h6 class="text-body-2 text-medium-emphasis">
                        Q{{ String(questions.indexOf(item) + 1).padStart(2, '0') }} ({{
                          item.type === 'MCQ' ? '객관식' : '주관식'
                        }})
                      </h6>
                      <p class="text-caption text-medium-emphasis">
                        {{ item.question.substring(0, 30) }}...
                      </p>
                    </v-list-item>
                  </v-list>
                </div>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-card-text>
      </v-card>
    </v-col>

    <v-col cols="12" sm="8" class="d-flex flex-column">
      <v-card elevation="0" class="section-bg flex-grow-1">
        <v-card-text class="pa-8 d-flex flex-column flex-grow-1">
          <h4 class="section-title mb-6">문제 정보</h4>
          <div v-if="currentQuestion" class="d-flex flex-column flex-grow-1">
            <div class="d-flex align-center flex-wrap mb-4">
              <h4 class="text-h6 mr-3 font-weight-bold aligned-text-item" style="color: #191d5a">
                Q{{ String(selectedQuestionIndex + 1).padStart(2, '0') }}
              </h4>
              <span class="text-body-2 mr-2 aligned-text-item" style="color: grey">
                {{ currentQuestion.documentName }}
              </span>
              <v-chip
                v-for="(tag, kIdx) in currentQuestion.tags"
                :key="kIdx"
                size="small"
                color="primary"
                variant="flat"
                rounded="lg"
                class="ml-1 mr-1 my-1 enhanced-tag"
              >
                #{{ tag }}
              </v-chip>
              <span class="ml-2 difficulty-text aligned-text-item" :class="getDifficultyClass()">
                {{ getDifficultyText() }}
              </span>
              <v-spacer></v-spacer>

              <v-btn
                variant="flat"
                class="ml-2 refresh-button"
                @click="refreshQuestion"
                :loading="isRefreshing"
                :disabled="questions.length === 0"
              >
                <v-icon start>mdi-refresh</v-icon>
                문제 교체
              </v-btn>
            </div>

            <div class="question-section flex-grow-1">
              <div class="question-content-wrapper">
                <p class="question-text">{{ currentQuestion.question }}</p>

                <div class="options-container" v-if="currentQuestion.type === 'MCQ'">
                  <div
                    v-for="(option, index) in currentQuestion.options"
                    :key="index"
                    class="option-item"
                    :class="{ 'is-correct': option === currentQuestion.answer }"
                  >
                    <span class="option-label">{{ getOptionLabel(index) }}</span>
                    <span class="option-content">{{ option }}</span>
                  </div>
                </div>
              </div>
            </div>

            <v-divider class="my-6"></v-divider>

            <div class="solution-section flex-grow-1">
              <h4 class="solution-title">정답 및 해설</h4>
              <div v-if="currentQuestion.explanation" class="solution-text-scrollable">
                {{ currentQuestion.explanation }}
              </div>
              <div
                v-else-if="
                  currentQuestion.gradingCriteria && currentQuestion.gradingCriteria.length > 0
                "
                class="grading-criteria-scrollable"
              >
                <h4 class="criteria-title">채점 기준:</h4>
                <v-table density="compact" class="grading-table">
                  <thead>
                    <tr>
                      <th class="text-left">점수</th>
                      <th class="text-left">기준</th>
                      <th class="text-left">예시</th>
                      <th class="text-left">참고</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(criterion, index) in currentQuestion.gradingCriteria" :key="index">
                      <td>{{ criterion.score }}점</td>
                      <td>{{ criterion.criteria }}</td>
                      <td>{{ criterion.example || '-' }}</td>
                      <td>{{ criterion.note || '-' }}</td>
                    </tr>
                  </tbody>
                </v-table>
              </div>
              <div v-else class="no-solution">
                <p>이 문제에 대한 풀이 또는 채점 기준이 없습니다.</p>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-10">
            <p class="text-h6 text-medium-emphasis">
              좌측 목록에서 문제를 선택하여 상세 내용을 확인하세요.
            </p>
          </div>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>

  <v-row class="bottom-fixed-actions">
    <v-col cols="12" class="d-flex justify-space-between align-center px-0">
      <v-btn variant="flat" color="grey" class="force-white" @click="prevStep"> 이전 단계 </v-btn>
      <div class="d-flex align-center mr-2" style="gap: 8px">
        <v-btn
          variant="flat"
          color="grey"
          class="force-white"
          :disabled="selectedQuestionIndex === 0 || questions.length === 0"
          @click="moveToPreviousQuestion"
        >
          이전 문제
        </v-btn>
        <v-btn
          variant="flat"
          color="grey"
          class="force-white"
          :disabled="selectedQuestionIndex === questions.length - 1 || questions.length === 0"
          @click="moveToNextQuestion"
        >
          다음 문제
        </v-btn>
        <v-btn
          variant="flat"
          color="#191d5a"
          @click="nextStep"
          :disabled="questions.length === 0 || isFetchingQuestions"
        >
          검토 완료
        </v-btn>
      </div>
    </v-col>
  </v-row>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const emit = defineEmits(['next-step', 'prev-step', 'update:isLoading'])

const props = defineProps({
  testId: [Number, String],
  isLoading: {
    type: Boolean,
    default: false,
  },
  selectedDocument: {
    type: Object,
    default: null,
  },
  revenues: {
    type: Array,
    default: () => [],
  },
  examGoal: {
    type: String,
    default: '',
  },
  questionsData: {
    // TrainerTestManagement.vue에서 전달받는 questionsData prop
    type: Array,
    default: () => [],
  },
})

function nextStep() {
  const selectedQuestionIds = questions.value.map((q) => q.id) // 현재 화면에 노출된(선택된) 문제들의 ID
  const initialQuestionIds = new Set(props.questionsData.map((q) => q.id)) // 초기 questionsData의 모든 문제 ID

  // 초기 questionsData에는 있었지만, 현재 questions.value에는 없는 문제들의 ID
  const toDeleteQuestionIds = Array.from(initialQuestionIds).filter(
    (id) => !selectedQuestionIds.includes(id),
  )

  emit('next-step', { selectedQuestionIds, toDeleteQuestionIds })
}

function prevStep() {
  emit('prev-step')
}

const documents = ref([])
const questions = ref([])
const extraQuestions = ref([]) // EXTRA 문제들을 별도로 저장
const selectedQuestionIndex = ref(0)
const isFetchingQuestions = ref(false) // Prop으로 전달받은 isLoading을 따르도록 설정
const isRefreshing = ref(false) // EXTRA 문제 새로고침 로딩 상태

const currentQuestion = computed(() => {
  return questions.value[selectedQuestionIndex.value]
})

const expandedPanels = ref([])

// TraineeQuestionArea.vue의 getOptionLabel 함수와 동일
const getOptionLabel = (index) => {
  return String.fromCharCode(65 + index) + ')'
}

// 난이도를 텍스트로 변환하는 함수
const getDifficultyText = () => {
  if (!currentQuestion.value || !currentQuestion.value.difficultyLevel) return 'NORMAL'

  return currentQuestion.value.difficultyLevel // 이미 문자열로 제공됨 (EASY, NORMAL, HARD)
}

// 난이도별 CSS 클래스 반환
const getDifficultyClass = () => {
  const difficultyText = getDifficultyText()
  return `difficulty-${difficultyText.toLowerCase()}`
}

// BASIC 문제를 EXTRA 문제로 교체하는 함수
const refreshQuestion = () => {
  if (!currentQuestion.value || extraQuestions.value.length === 0) {
    console.warn('교체할 수 있는 EXTRA 문제가 없습니다.')
    return
  }

  isRefreshing.value = true

  try {
    // 현재 문제와 같은 문서의 EXTRA 문제들을 필터링
    const sameDocumentExtraQuestions = extraQuestions.value.filter(
      (q) => q.documentId === currentQuestion.value.documentId && q.id !== currentQuestion.value.id,
    )

    let replacementQuestion = null

    if (sameDocumentExtraQuestions.length > 0) {
      // 같은 문서의 다른 EXTRA 문제가 있으면 거기서 선택
      const randomIndex = Math.floor(Math.random() * sameDocumentExtraQuestions.length)
      replacementQuestion = sameDocumentExtraQuestions[randomIndex]
    } else {
      // 같은 문서의 다른 EXTRA 문제가 없으면 전체 EXTRA 문제에서 현재 문제와 다른 것을 선택
      const allDifferentExtraQuestions = extraQuestions.value.filter(
        (q) => q.id !== currentQuestion.value.id,
      )
      if (allDifferentExtraQuestions.length > 0) {
        const randomIndex = Math.floor(Math.random() * allDifferentExtraQuestions.length)
        replacementQuestion = allDifferentExtraQuestions[randomIndex]
      }
    }

    if (!replacementQuestion) {
      console.warn('교체할 수 있는 다른 EXTRA 문제가 없습니다.')
      isRefreshing.value = false
      return
    }

    // 현재 문제를 선택된 EXTRA 문제로 교체
    const currentIndex = selectedQuestionIndex.value
    questions.value[currentIndex] = {
      ...replacementQuestion,
      isReplaced: true, // 교체된 문제임을 표시
    }

    // 문서 목록도 업데이트
    updateDocumentsList()

    console.log('문제 교체 완료:', replacementQuestion.question.substring(0, 50) + '...')
  } catch (error) {
    console.error('문제 교체 중 오류 발생:', error)
  } finally {
    // 짧은 딜레이 후 로딩 해제 (UX 개선)
    setTimeout(() => {
      isRefreshing.value = false
    }, 500)
  }
}

// 문서 목록 업데이트 함수
const updateDocumentsList = () => {
  const docsMap = new Map()

  questions.value.forEach((q) => {
    const docId = q.documentId
    if (!docsMap.has(docId)) {
      docsMap.set(docId, {
        id: docId,
        name: q.documentName,
        questions: [],
      })
    }
    docsMap.get(docId).questions.push(q)
  })

  documents.value = Array.from(docsMap.values())
}

// questionsData prop이 변경될 때마다 내부 상태 업데이트
const processQuestionsData = (data) => {
  const docsMap = new Map()
  const allQuestions = []
  const allExtraQuestions = []
  let uniqueDocCounter = 0
  let uniqueQuestionCounter = 0

  const sourceData = data

  sourceData.forEach((q) => {
    const docId = q.documentId || q.documentName || `generated-doc-id-${uniqueDocCounter++}`

    const processedQuestion = {
      id: q.id || `question-id-${uniqueQuestionCounter++}`,
      documentId: docId,
      documentName: q.documentName || '알 수 없는 문서',
      question: q.question || '질문 내용 없음',
      type: q.type === 'OBJECTIVE' ? 'MCQ' : q.type === 'SUBJECTIVE' ? 'Subjective' : q.type,
      options: q.options || [],
      answer: q.answer || '정답 정보 없음',
      explanation: q.explanation || '해설 정보 없음',
      gradingCriteria: q.gradingCriteria || null,
      keywords: q.keywords || [],
      tags: q.tags || [],
      difficultyLevel:
        q.difficultyLevel || ['EASY', 'NORMAL', 'HARD'][Math.floor(Math.random() * 3)], // 임시 데이터 난이도 무작위
      generationType: q.generationType || 'BASIC',
      isReplaced: q.isReplaced || false,
    }

    if (processedQuestion.generationType === 'BASIC') {
      if (!docsMap.has(docId)) {
        docsMap.set(docId, {
          id: docId,
          name: processedQuestion.documentName,
          questions: [],
        })
      }
      docsMap.get(docId).questions.push(processedQuestion)
      allQuestions.push(processedQuestion)
    }

    if (processedQuestion.generationType === 'EXTRA') {
      allExtraQuestions.push(processedQuestion)
    }
  })

  documents.value = Array.from(docsMap.values())
  questions.value = allQuestions
  extraQuestions.value = allExtraQuestions

  if (selectedQuestionIndex.value >= questions.value.length) {
    selectedQuestionIndex.value = Math.max(0, questions.value.length - 1)
  }

  if (questions.value.length > 0 && documents.value.length > 0) {
    expandedPanels.value = [documents.value[0]?.id]
  } else {
    expandedPanels.value = []
  }
}

watch(
  () => props.questionsData,
  (newQuestionsData) => {
    isFetchingQuestions.value = props.isLoading
    if (newQuestionsData && newQuestionsData.length > 0) {
      processQuestionsData(newQuestionsData)
    } else {
      // newQuestionsData가 비어있거나 없을 때만 sampleQuestions 사용
      processQuestionsData(sampleQuestions)
    }
  },
  { immediate: true },
)

watch(
  () => props.isLoading,
  (newVal) => {
    isFetchingQuestions.value = newVal
  },
)

const selectQuestion = (index) => {
  selectedQuestionIndex.value = index
}

const moveToNextQuestion = () => {
  if (selectedQuestionIndex.value < questions.value.length - 1) {
    selectedQuestionIndex.value++
  }
}

const moveToPreviousQuestion = () => {
  if (selectedQuestionIndex.value > 0) {
    selectedQuestionIndex.value--
  }
}

onMounted(() => {
  // 컴포넌트 마운트 시 questionsData prop을 감시하므로 별도의 fetch 호출 불필요
})
</script>

<style scoped>
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

.section-bg {
  background: #eef2f6;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  padding: 24px;
}

.section-title {
  font-size: 22px;
  font-weight: bold;
  margin-bottom: 18px;
  font-family: inherit;
}

.bottom-fixed-actions {
  position: sticky;
  bottom: 0;
  width: 100%;
  background-color: white;
  padding: 16px 0;
  border-top: 1px solid #eee;
  z-index: 100;
  max-width: 1150px;
  left: 0;
  right: 0;
  margin: 0 auto;
}

/* Enhanced tag styling */
.enhanced-tag {
  font-weight: 500 !important;
  background-color: #e0e7ed !important; /* Soft grey-blue */
  color: #3f5e7f !important; /* Darker blue text */
  border: 1px solid #c8d3dd !important;
  box-shadow: none !important; /* Remove shadow */
  padding: 3px 10px !important; /* Adjust padding */
  font-size: 0.75rem !important; /* Smaller font */
  height: auto !important; /* Adjust height based on content */
}

/* Difficulty text styling */
.difficulty-text {
  font-weight: bold;
  font-size: 0.75rem; /* Smaller font size for consistency */
  padding: 4px 10px; /* Adjusted padding */
  border-radius: 16px; /* More rounded */
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: none !important; /* Remove shadow */
  display: inline-flex; /* To better control padding and height */
  align-items: center;
  justify-content: center;
}

.difficulty-easy {
  background-color: #e6f4ea; /* Light green */
  color: #388e3c; /* Darker green */
  border: 1px solid #a8dab5;
}

.difficulty-normal {
  background-color: #fff8e1; /* Light orange */
  color: #f57f17; /* Darker orange */
  border: 1px solid #ffe082;
}

.difficulty-hard {
  background-color: #fbe9e7; /* Light red */
  color: #d32f2f; /* Darker red */
  border: 1px solid #ffab91;
}

/* Refresh Button */
.refresh-button {
  background-color: #191d5a !important; /* Dark blue */
  color: white !important;
  border-radius: 8px !important; /* Slightly rounded */
  font-weight: 500 !important;
  padding: 8px 16px !important;
  transition: all 0.2s ease-in-out;
}

.refresh-button:hover {
  background-color: #2a306f !important; /* Darker blue on hover */
  box-shadow: 0 2px 8px rgba(25, 29, 90, 0.3) !important;
}

.refresh-button:active {
  background-color: #10133b !important; /* Even darker on active */
}

.refresh-button.v-btn--disabled {
  opacity: 0.6 !important;
  cursor: not-allowed !important;
}

/* Question Header alignment */
.aligned-text-item {
  /* This is to ensure text nodes align better with v-chip/v-btn */
  display: inline-flex;
  align-items: center;
  /* Add consistent vertical padding to align text visually */
  padding-top: 4px;
  padding-bottom: 4px;
}

/* Expansion panel styles */
.question-list-panels {
  display: flex;
  flex-direction: column;
  flex-grow: 1; /* Make the panels container grow */
  min-height: 0; /* Ensure it can shrink if needed */
}

/* v-expansion-panel 자체를 flex container로 만듦 */
.question-list-panels :deep(.v-expansion-panel) {
  display: flex;
  flex-direction: column;
  flex-shrink: 0; /* 기본적으로 패널 자체는 축소되지 않도록 함 */
  min-height: unset; /* Vuetify 기본 min-height 설정을 해제 */
  background-color: #f8f8f8;
  margin-bottom: 8px;
  border: 1px solid #eee;
}

/* 열린 패널의 경우, 내용이 전체 공간을 채우도록 */
.question-list-panels :deep(.v-expansion-panel.v-expansion-panel--active) {
  flex-grow: 1; /* 열린 패널만 남은 공간을 채우도록 함 */
}

.question-list-panels :deep(.v-expansion-panel-title) {
  min-height: 48px;
  padding: 0 16px;
  flex-shrink: 0; /* Title should not shrink */
}

.question-list-panels :deep(.v-expansion-panel__content) {
  padding-left: 0;
  padding-right: 0;
  display: flex; /* Make content area a flex container */
  flex-direction: column;
  flex-grow: 1; /* Allow content to grow */
  min-height: 0; /* Allow content to shrink */
  overflow-y: hidden; /* v-list-item이 패널을 넘어가지 않도록 숨김 */
}

.question-list-scrollable {
  height: 100%; /* Fill the height of its flex parent */
  overflow-y: auto;
  flex-grow: 1; /* Allow scrollable area to grow */
  min-height: 0; /* Allow scrollable area to shrink */
}

/* 리스트 아이템 스타일 */
.question-list-panels .v-list-item {
  border-radius: 4px;
  margin-bottom: 4px;
  transition: background-color 0.2s ease;
  padding-left: 12px;
}

.question-list-panels .v-list-item:hover {
  background-color: #f9f9f9;
}

.question-list-panels .v-list-item.v-list-item--active {
  background-color: #f5f5f5;
  border-left: 4px solid #1976d2;
  color: #191d5a;
}

.question-list-panels .v-list-item.v-list-item--active h6,
.question-list-panels .v-list-item.v-list-item--active p {
  color: #191d5a !important;
}

/* 문제 정보 UI 스타일 (TraineeQuestionArea.vue 및 TraineeSolutionArea.vue 참조) */
.question-section {
  background-color: #ffffff;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  min-height: 0; /* 내용물이 길어져도 이 요소가 커지는 것을 방지하고 스크롤을 허용 */
  overflow-y: auto; /* **문제 영역 전체 스크롤** */
  padding-right: 10px; /* 스크롤바 공간 확보 */
  /* margin-bottom removed - now controlled by divider */
}

.question-section::-webkit-scrollbar {
  width: 6px;
}
.question-section::-webkit-scrollbar-track {
  background: transparent;
}
.question-section::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
}
.question-section::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.4);
}

.question-content-wrapper {
  flex-grow: 1; /* 문제 텍스트와 보기를 감싸는 컨테이너가 공간을 채우도록 */
  display: flex;
  flex-direction: column;
}

.question-text {
  font-size: 17px;
  line-height: 1.7;
  margin: 0 0 20px 0; /* 하단 마진 추가 */
  color: #495057;
  flex-shrink: 0; /* 문제 텍스트 자체는 축소되지 않도록 */
}

.options-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
  flex-grow: 1; /* 옵션 컨테이너가 남은 공간을 채우도록 */
  min-height: 0; /* 스크롤 가능하도록 */
  align-items: center; /* **선택지 중앙 정렬** */
  width: 100%; /* 부모 너비 전체 사용 */
}

.option-item {
  display: flex;
  align-items: flex-start;
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 10px;
  padding: 15px 25px;
  font-size: 16px;
  color: #495057;
  cursor: default;
  transition: all 0.2s ease-in-out;
  position: relative;
  width: 100%; /* 옵션 아이템이 부모 너비를 채우도록 */
}

/* **정답인 경우 초록색 표시** */
.option-item.is-correct {
  background-color: #e6f4ea; /* Light green background */
  border-color: #4caf50; /* Green border */
  color: #2e7d32; /* Darker green text */
  font-weight: 500;
}

.option-item.is-correct .option-label {
  color: #2e7d32; /* Darker green for label */
}

.option-label {
  min-width: 30px;
  font-weight: bold;
  margin-right: 15px;
  color: #6c757d;
  flex-shrink: 0;
}

.option-content {
  flex-grow: 1;
  word-break: break-word;
}

.solution-section {
  background-color: #ffffff;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  min-height: 0; /* 내용물이 길어져도 이 요소가 커지는 것을 방지하고 스크롤을 허용 */
  overflow-y: auto; /* 내용이 넘칠 때 스크롤바 생성 */
  padding-right: 10px; /* 스크롤바 공간 확보 */
}

.solution-section::-webkit-scrollbar {
  width: 6px;
}
.solution-section::-webkit-scrollbar-track {
  background: transparent;
}
.solution-section::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
}
.solution-section::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.4);
}

.solution-title,
.criteria-title {
  font-size: 20px;
  font-weight: 700;
  color: #343a40;
  margin-bottom: 15px;
  flex-shrink: 0;
}

.solution-text-scrollable,
.grading-criteria-scrollable {
  flex-grow: 1;
  font-size: 16px;
  line-height: 1.7;
  color: #495057;
  min-height: 0; /* Flexbox 아이템이 내용물에 의해 커지는 것을 방지 */
}

/* Styling for the new grading table */
.grading-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
  background-color: #fcfdfe; /* Match li background */
  border: 1px solid #e9ecef; /* Match li border */
  border-radius: 8px; /* Match li border-radius */
  overflow: hidden; /* Ensures border-radius is applied to content */
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04); /* Match li shadow */
}

.grading-table :deep(th),
.grading-table :deep(td) {
  padding: 12px 15px;
  border-bottom: 1px solid #eee;
  text-align: left;
  font-size: 15px;
  color: #495057;
}

.grading-table :deep(th) {
  background-color: #f0f4f7;
  font-weight: 600;
  color: #34495e;
  text-transform: none; /* Prevent uppercase from Vuetify table header */
}

.grading-table :deep(tr:last-child td) {
  border-bottom: none;
}

.no-solution {
  color: #777;
  font-style: italic;
  padding: 15px 0;
  text-align: center;
  flex-grow: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
