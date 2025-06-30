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

  <v-row class="mt-4" align="stretch">
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
            class="question-list-panels flex-grow-1"
            v-model="expandedPanels"
          >
            <v-expansion-panel
              v-for="doc in documents"
              :key="doc.id"
              elevation="0"
              :value="doc.id"
              rounded="lg"
            >
              <v-expansion-panel-title class="text-body-1 font-weight-medium">
                {{ doc.name.length > 20 ? doc.name.substring(0, 17) + '...' : doc.name }} ({{
                  doc.questions.length
                }})
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <div class="question-list-scrollable">
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
        <v-card-text class="pa-8">
          <h4 class="section-title mb-6">문제 정보</h4>
          <div v-if="currentQuestion">
            <div class="d-flex align-center flex-wrap mb-4">
              <h4 class="text-h6 mt-1 mr-3 font-weight-bold" style="color: #191d5a">
                Q{{ String(selectedQuestionIndex + 1).padStart(2, '0') }}
              </h4>
              <span class="text-h8 mt-1 mr-2" style="color: grey">
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
                {{ tag }}
              </v-chip>
              <span class="text-h8 mt-1 ml-2 difficulty-text" :class="getDifficultyClass()">
                {{ getDifficultyText() }}
              </span>
              <v-spacer></v-spacer>

              <!-- 모든 BASIC 문제에 교체 버튼 표시 -->
              <v-btn
                variant="flat"
                color="orange"
                size="small"
                class="ml-2"
                @click="refreshQuestion"
                :loading="isRefreshing"
              >
                <v-icon start>mdi-refresh</v-icon>
                문제 교체
              </v-btn>
            </div>

            <h4 class="text-h8 mt-1 font-weight-bold mb-2">문제</h4>
            <v-textarea
              v-model="currentQuestionAndOptions"
              readonly
              variant="plain"
              rows="6"
              auto-grow
              hide-details
              class="custom-textarea"
              rounded="lg"
              density="compact"
            ></v-textarea>

            <v-divider class="my-6"></v-divider>

            <div class="d-flex align-center mb-2">
              <h4 class="text-h8 mt-1 font-weight-bold">정답 및 채점기준</h4>
            </div>
            <v-textarea
              v-model="currentAnswerAndExplanation"
              readonly
              variant="plain"
              rows="6"
              auto-grow
              hide-details
              class="custom-textarea"
              rounded="lg"
              density="compact"
            ></v-textarea>
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
  emit('next-step')
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

const currentQuestionAndOptions = computed(() => {
  if (!currentQuestion.value) return ''
  let text = currentQuestion.value.question
  if (currentQuestion.value.type === 'MCQ' && currentQuestion.value.options) {
    currentQuestion.value.options.forEach((option, index) => {
      text += `\n${String.fromCharCode(65 + index)}. ${option}`
    })
  }
  return text
})

const currentAnswerAndExplanation = computed(() => {
  if (!currentQuestion.value) return ''

  let result = `정답: ${currentQuestion.value.answer}\n\n해설: ${currentQuestion.value.explanation}`

  // 주관식 문제의 경우 채점기준 추가
  if (currentQuestion.value.type === 'Subjective' && currentQuestion.value.gradingCriteria) {
    result += '\n\n채점 기준:'
    currentQuestion.value.gradingCriteria.forEach((criteria, index) => {
      result += `\n${criteria.score}점: ${criteria.criteria}`
      if (criteria.example) {
        result += `\n  예시: ${criteria.example}`
      }
      if (criteria.note) {
        result += `\n  비고: ${criteria.note}`
      }
    })
  }

  return result
})

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
      (q) => q.documentId === currentQuestion.value.documentId,
    )

    // 같은 문서에 EXTRA 문제가 없으면 전체 EXTRA 문제에서 선택
    const availableExtraQuestions =
      sameDocumentExtraQuestions.length > 0 ? sameDocumentExtraQuestions : extraQuestions.value

    // 현재 문제와 다른 문제만 선택 (중복 방지)
    const differentExtraQuestions = availableExtraQuestions.filter(
      (q) => q.id !== currentQuestion.value.id,
    )

    if (differentExtraQuestions.length === 0) {
      console.warn('교체할 수 있는 다른 EXTRA 문제가 없습니다.')
      isRefreshing.value = false
      return
    }

    // 무작위로 EXTRA 문제 선택
    const randomIndex = Math.floor(Math.random() * differentExtraQuestions.length)
    const selectedExtraQuestion = differentExtraQuestions[randomIndex]

    // 현재 문제를 선택된 EXTRA 문제로 교체
    const currentIndex = selectedQuestionIndex.value
    questions.value[currentIndex] = {
      ...selectedExtraQuestion,
      isReplaced: true, // 교체된 문제임을 표시
    }

    // 문서 목록도 업데이트
    updateDocumentsList()

    console.log('문제 교체 완료:', selectedExtraQuestion.question.substring(0, 50) + '...')
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
  let uniqueDocCounter = 0 // To generate unique IDs for documents without a documentId
  let uniqueQuestionCounter = 0 // To generate unique IDs for questions without an ID

  data.forEach((q) => {
    // Determine the unique ID for the document this question belongs to
    const docId = q.documentId || q.documentName || `generated-doc-id-${uniqueDocCounter++}`

    const processedQuestion = {
      id: q.id || `question-id-${uniqueQuestionCounter++}`, // 질문 ID
      documentId: docId,
      documentName: q.documentName || '알 수 없는 문서', // 문서 이름
      question: q.question || '질문 내용 없음', // 질문 내용
      type: q.type === 'OBJECTIVE' ? 'MCQ' : q.type === 'SUBJECTIVE' ? 'Subjective' : q.type, // 타입 매핑
      options: q.options || [], // 옵션 (객관식의 경우)
      answer: q.answer || '정답 정보 없음', // 정답
      explanation: q.explanation || '해설 정보 없음', // 해설
      gradingCriteria: q.gradingCriteria || null, // 채점기준 (주관식의 경우)
      keywords: q.keywords || [], // 키워드
      tags: q.tags || [], // 태그
      difficultyLevel: q.difficultyLevel || 'NORMAL', // 난이도 (이미 문자열)
      generationType: q.generationType || 'BASIC', // generationType
      isReplaced: q.isReplaced || false, // 교체된 문제 여부
    }

    // BASIC 문제는 즉시 표시할 목록에 추가
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

    // EXTRA 문제는 별도 배열에 저장
    if (processedQuestion.generationType === 'EXTRA') {
      allExtraQuestions.push(processedQuestion)
    }
  })

  documents.value = Array.from(docsMap.values())
  questions.value = allQuestions
  extraQuestions.value = allExtraQuestions // EXTRA 문제들 저장

  // 선택된 문제 인덱스가 유효한지 확인하고 조정
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
    isFetchingQuestions.value = props.isLoading // props.isLoading에 따라 로딩 상태 동기화
    if (newQuestionsData && newQuestionsData.length > 0) {
      processQuestionsData(newQuestionsData)
    } else if (newQuestionsData && newQuestionsData.length === 0) {
      documents.value = []
      questions.value = []
      extraQuestions.value = []
      selectedQuestionIndex.value = 0
      expandedPanels.value = []
    }
  },
  { immediate: true }, // 컴포넌트 마운트 시 즉시 실행
)

watch(
  () => props.isLoading,
  (newVal) => {
    isFetchingQuestions.value = newVal // 부모의 isLoading 상태를 반영
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
  font-weight: 600 !important;
  background-color: #1976d2 !important;
  color: white !important;
  border: 1px solid #1565c0 !important;
  box-shadow: 0 2px 4px rgba(25, 118, 210, 0.3) !important;
}

/* Difficulty text styling */
.difficulty-text {
  font-weight: bold;
  font-size: 0.8rem;
  padding: 4px 8px;
  border-radius: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.difficulty-easy {
  background-color: #c8e6c9;
  color: #2e7d32;
  border: 1px solid #4caf50;
}

.difficulty-normal {
  background-color: #fff3e0;
  color: #ef6c00;
  border: 1px solid #ff9800;
}

.difficulty-hard {
  background-color: #ffcdd2;
  color: #c62828;
  border: 1px solid #f44336;
}

/* Expansion panel styles */
.question-list-panels :deep(.v-expansion-panel__content) {
  padding-left: 0;
  padding-right: 0;
}

.question-list-panels .v-expansion-panel {
  background-color: #f8f8f8;
  margin-bottom: 8px;
  border: 1px solid #eee;
}

.question-list-panels .v-expansion-panel-title {
  min-height: 48px;
  padding: 0 16px;
}

.question-list-scrollable {
  max-height: 250px;
  overflow-y: auto;
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

/* 텍스트 필드, 텍스트 영역 등의 글꼴 크기 조정 */
.custom-textarea {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px !important;
  transition: border-color 0.2s ease;
  background-color: white !important;
}

.custom-textarea :deep(textarea) {
  font-size: 0.95rem !important;
  background-color: transparent !important;
  padding-top: 8px !important;
}

.custom-textarea:hover {
  border-color: #c0c0c0;
}

.custom-textarea.v-input--is-focused {
  border-color: #1976d2;
  box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.2);
}
</style>
