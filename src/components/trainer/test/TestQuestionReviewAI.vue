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

          <div
            v-else-if="questions.length === 0"
            class="d-flex justify-center align-center py-10 flex-grow-1"
          >
            <div class="text-center">
              <v-icon size="48" color="grey">mdi-file-question-outline</v-icon>
              <p class="text-h6 text-grey mt-2">문제가 없습니다</p>
              <p class="text-body-2 text-grey">생성된 문제를 불러올 수 없습니다.</p>
            </div>
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
                      <v-list-item-content>
                        <h6 class="text-body-2 text-medium-emphasis">
                          Q{{ String(questions.indexOf(item) + 1).padStart(2, '0') }} ({{
                            item.type === 'MCQ' ? '객관식' : '주관식'
                          }})
                        </h6>
                        <p class="text-caption text-medium-emphasis">
                          {{ item.question }}
                        </p>
                      </v-list-item-content>
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
    type: Array,
    default: () => [],
  },
})

function nextStep() {
  const selectedQuestionIds = questions.value.map((q) => q.id)
  const initialQuestionIds = new Set(props.questionsData.map((q) => q.id))
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
const extraQuestions = ref([])
const selectedQuestionIndex = ref(0)
const isFetchingQuestions = ref(false)
const isRefreshing = ref(false)
const expandedPanels = ref([])

const currentQuestion = computed(() => {
  return questions.value[selectedQuestionIndex.value]
})

const getOptionLabel = (index) => {
  return String.fromCharCode(65 + index) + ')'
}

const getDifficultyText = () => {
  if (!currentQuestion.value || !currentQuestion.value.difficultyLevel) return 'NORMAL'
  return currentQuestion.value.difficultyLevel
}

const getDifficultyClass = () => {
  const difficultyText = getDifficultyText()
  return `difficulty-${difficultyText.toLowerCase()}`
}

const refreshQuestion = () => {
  if (!currentQuestion.value || extraQuestions.value.length === 0) {
    console.warn('교체할 수 있는 EXTRA 문제가 없습니다.')
    return
  }

  isRefreshing.value = true

  try {
    const sameDocumentExtraQuestions = extraQuestions.value.filter(
      (q) => q.documentId === currentQuestion.value.documentId && q.id !== currentQuestion.value.id,
    )

    let replacementQuestion = null

    if (sameDocumentExtraQuestions.length > 0) {
      const randomIndex = Math.floor(Math.random() * sameDocumentExtraQuestions.length)
      replacementQuestion = sameDocumentExtraQuestions[randomIndex]
    } else {
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

    const currentIndex = selectedQuestionIndex.value
    questions.value[currentIndex] = {
      ...replacementQuestion,
      isReplaced: true,
    }

    updateDocumentsList()
    console.log('문제 교체 완료:', replacementQuestion.question.substring(0, 50) + '...')
  } catch (error) {
    console.error('문제 교체 중 오류 발생:', error)
  } finally {
    setTimeout(() => {
      isRefreshing.value = false
    }, 500)
  }
}

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

const processQuestionsData = (data) => {
  console.log('🔍 processQuestionsData 호출됨:', data)

  if (!data || !Array.isArray(data) || data.length === 0) {
    console.log('🔍 questionsData가 비어있음')
    documents.value = []
    questions.value = []
    extraQuestions.value = []
    selectedQuestionIndex.value = 0
    expandedPanels.value = []
    return
  }

  const docsMap = new Map()
  const allQuestions = []
  const allExtraQuestions = []

  data.forEach((q) => {
    const processedQuestion = {
      id: q.id,
      documentId: q.documentId,
      documentName: q.documentName || '알 수 없는 문서',
      question: q.question || '질문 내용 없음',
      type: q.type === 'OBJECTIVE' ? 'MCQ' : q.type === 'SUBJECTIVE' ? 'Subjective' : q.type,
      options: q.options || [],
      answer: q.answer || '정답 정보 없음',
      explanation: q.explanation || '해설 정보 없음',
      gradingCriteria: q.grading_criteria || q.gradingCriteria || null,
      keywords: q.keywords || [],
      tags: q.tags || [],
      difficultyLevel: q.difficulty_level || q.difficultyLevel || 'NORMAL',
      generationType: q.generationType || 'BASIC',
      isReplaced: false,
    }

    console.log('🔍 처리된 문제:', processedQuestion)

    if (processedQuestion.generationType === 'BASIC') {
      if (!docsMap.has(processedQuestion.documentId)) {
        docsMap.set(processedQuestion.documentId, {
          id: processedQuestion.documentId,
          name: processedQuestion.documentName,
          questions: [],
        })
      }
      docsMap.get(processedQuestion.documentId).questions.push(processedQuestion)
      allQuestions.push(processedQuestion)
    }

    if (processedQuestion.generationType === 'EXTRA') {
      allExtraQuestions.push(processedQuestion)
    }
  })

  documents.value = Array.from(docsMap.values())
  questions.value = allQuestions
  extraQuestions.value = allExtraQuestions

  console.log('🔍 최종 처리 결과:', {
    documents: documents.value,
    questions: questions.value.length,
    extraQuestions: extraQuestions.value.length,
  })

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
    console.log('🔍 questionsData props 변경됨:', newQuestionsData)
    isFetchingQuestions.value = props.isLoading
    processQuestionsData(newQuestionsData)
  },
  { immediate: true, deep: true },
)

watch(
  () => props.isLoading,
  (newVal) => {
    console.log('🔍 isLoading 변경됨:', newVal)
    isFetchingQuestions.value = newVal
  },
)

const selectQuestion = (index) => {
  console.log('🔍 문제 선택됨:', index)
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
  console.log('🔍 TestQuestionReviewAI 마운트됨')
  console.log('🔍 초기 props.questionsData:', props.questionsData)
  console.log('🔍 초기 props.isLoading:', props.isLoading)

  // 초기 데이터 처리
  if (props.questionsData && props.questionsData.length > 0) {
    processQuestionsData(props.questionsData)
  }
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
  padding: 2px;
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

.enhanced-tag {
  font-weight: 500 !important;
  background-color: #e0e7ed !important;
  color: #3f5e7f !important;
  border: 1px solid #c8d3dd !important;
  box-shadow: none !important;
  padding: 3px 10px !important;
  font-size: 0.75rem !important;
  height: auto !important;
}

.difficulty-text {
  font-weight: bold;
  font-size: 0.75rem;
  padding: 4px 10px;
  border-radius: 16px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: none !important;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.difficulty-easy {
  background-color: #e6f4ea;
  color: #388e3c;
  border: 1px solid #a8dab5;
}

.difficulty-normal {
  background-color: #fff8e1;
  color: #f57f17;
  border: 1px solid #ffe082;
}

.difficulty-hard {
  background-color: #fbe9e7;
  color: #d32f2f;
  border: 1px solid #ffab91;
}

.refresh-button {
  background-color: #191d5a !important;
  color: white !important;
  border-radius: 8px !important;
  font-weight: 500 !important;
  padding: 8px 16px !important;
  transition: all 0.2s ease-in-out;
}

.refresh-button:hover {
  background-color: #2a306f !important;
  box-shadow: 0 2px 8px rgba(25, 29, 90, 0.3) !important;
}

.refresh-button:active {
  background-color: #10133b !important;
}

.refresh-button.v-btn--disabled {
  opacity: 0.6 !important;
  cursor: not-allowed !important;
}

.aligned-text-item {
  display: inline-flex;
  align-items: center;
  padding-top: 4px;
  padding-bottom: 4px;
}

.question-list-panels {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  min-height: 0;
}

.question-list-panels :deep(.v-expansion-panel) {
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  min-height: unset;
  background-color: #f8f8f8;
  margin-bottom: 8px;
  border: 1px solid #eee;
}

.question-list-panels :deep(.v-expansion-panel.v-expansion-panel--active) {
  flex-grow: 1;
}

.question-list-panels :deep(.v-expansion-panel-title) {
  min-height: 48px;
  padding: 0 16px;
  flex-shrink: 0;
}

.question-list-panels :deep(.v-expansion-panel__content) {
  padding-left: 0;
  padding-right: 0;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  min-height: 0;
  overflow-y: hidden;
}

/* (1) 문제 목록 높이 제한 */
.question-list-scrollable {
  height: 100%;
  max-height: 600px; /* 문제 정보 Section과 맞추어 필요시 조절 */
  overflow-y: auto;
  flex-grow: 1;
  min-height: 0;
}

/* (2) 문제 목록 아이템 구분선 */
.question-list-panels .v-list-item {
  border-radius: 4px;
  margin-bottom: 0; /* margin 제거 */
  border-bottom: 1px solid #ddd;
  transition: background-color 0.2s ease;
  padding-left: 12px;
}

/* 마지막 아이템 구분선 제거 */
.question-list-panels .v-list-item:last-child {
  border-bottom: none;
}

/* (3) 문제 항목 텍스트 한 줄 처리 */
.question-list-panels .v-list-item h6,
.question-list-panels .v-list-item p {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1 1 auto; /* 중요: Flexbox에서 폭이 줄어들지 않게 */
  min-width: 0;
}

.question-list-item .v-list-item-content {
  min-width: 0; /* flex item 줄어들 수 있게 */
  flex: 1 1 auto; /* 공간을 꽉 채움 */
}

.question-list-item .v-list-item-content h6,
.question-list-item .v-list-item-content p {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.question-section {
  background-color: #ffffff;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow-y: auto;
}

.question-section::-webkit-scrollbar {
  width: 8px;
}
.question-section::-webkit-scrollbar-track {
  background: transparent;
  margin: 0 4px;
}
.question-section::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
  border: 2px solid #ffffff;
}
.question-section::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.4);
}

.question-content-wrapper {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.question-text {
  font-size: 17px;
  line-height: 1.7;
  margin: 0 0 20px 0;
  color: #495057;
  flex-shrink: 0;
}

.options-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
  flex-grow: 1;
  min-height: 0;
  align-items: center;
  width: 100%;
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
  width: 100%;
}

.option-item.is-correct {
  background-color: #e6f4ea;
  border-color: #4caf50;
  color: #2e7d32;
  font-weight: 500;
}

.option-item.is-correct .option-label {
  color: #2e7d32;
}

.option-label {
  min-width: 30px;
  font-weight: bold;
  margin-right: 8px;
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
  min-height: 0;
  overflow-y: auto;
}

.solution-section::-webkit-scrollbar {
  width: 8px;
}
.solution-section::-webkit-scrollbar-track {
  background: transparent;
  margin: 0 4px;
}
.solution-section::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
  border: 2px solid #ffffff;
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
  min-height: 0;
}

.grading-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
  background-color: #fcfdfe;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
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
  text-transform: none;
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
