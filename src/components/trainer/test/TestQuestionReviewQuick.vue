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

  <v-row class="mt-4">
    <v-col cols="12">
      <v-card elevation="0" class="section-bg">
        <v-card-text class="pa-8">
          <h4 class="section-title mb-6">테스트 정보</h4>
          <v-row>
            <v-col cols="12" md="4">
              <v-text-field
                v-model="internalTestName"
                label="테스트명"
                variant="outlined"
                density="compact"
                hide-details
                bg-color="white"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field
                v-model.number="internalTestDuration"
                label="응시 제한 시간 (분)"
                type="number"
                variant="outlined"
                density="compact"
                hide-details
                bg-color="white"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field
                v-model.number="internalPassingScore"
                label="합격 기준 점수"
                type="number"
                variant="outlined"
                density="compact"
                hide-details
                bg-color="white"
              ></v-text-field>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
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
                {{ getDifficultyText(currentQuestion.difficulty) }}
              </span>
              <v-spacer></v-spacer>
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
                      <th class="text-left score-column">점수</th>
                      <th class="text-left">기준</th>
                      <th class="text-left">예시</th>
                      <th class="text-left">참고</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(criterion, index) in currentQuestion.gradingCriteria" :key="index">
                      <td class="score-column">{{ criterion.score }}점</td>
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
          :disabled="
            questions.length === 0 ||
            isFetchingQuestions ||
            !internalTestName ||
            !internalTestDuration ||
            internalTestDuration <= 0 ||
            !internalPassingScore ||
            internalPassingScore <= 0
          "
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
const emit = defineEmits(['next-step', 'prev-step'])

console.log('🔍 TestQuestionReviewQuick 컴포넌트 로드됨')

const props = defineProps({
  testId: [Number, String],
  isLoading: {
    type: Boolean,
    default: false,
  },
  revenues: {
    type: Array,
    default: () => [],
  },
  questionsData: {
    // TrainerTestManagement.vue에서 전달받는 questionsData prop
    type: Array,
    default: () => [],
  },
  testName: {
    type: String,
  },
  testDuration: {
    type: Number,
  },
  passingScore: {
    type: Number,
  },
})

// props의 값을 내부 ref로 미러링하여 v-model에 바인딩
const internalTestName = ref(props.testName)
const internalTestDuration = ref(props.testDuration)
const internalPassingScore = ref(props.passingScore)

// props 변경 시 내부 ref 업데이트
watch(
  () => props.testName,
  (newVal) => {
    internalTestName.value = newVal
  },
)
watch(
  () => props.testDuration,
  (newVal) => {
    internalTestDuration.value = newVal
  },
)
watch(
  () => props.passingScore,
  (newVal) => {
    internalPassingScore.value = newVal
  },
)

function nextStep() {
  // 실제 사용 시에는 이 데이터들을 API에 전송해야 합니다.
  const selectedQuestionIds = questions.value.map((q) => q.id) // 모든 문제를 선택된 것으로 가정
  const toDeleteQuestionIds = [] // 삭제할 문제가 없다고 가정
  emit('next-step', {
    selectedQuestionIds,
    toDeleteQuestionIds,
    testName: internalTestName.value, // 추가: 테스트명
    testDuration: internalTestDuration.value, // 추가: 응시 제한 시간
    passingScore: internalPassingScore.value, // 추가: 합격 기준 점수
  })
}

function prevStep() {
  emit('prev-step')
}

const documents = ref([]) // TestQuestionReviewAI에서 추가됨
const questions = ref([])
const extraQuestions = ref([]) // TestQuestionReviewAI에서 추가됨
const selectedQuestionIndex = ref(0)
const isFetchingQuestions = ref(false)
const expandedPanels = ref([]) // TestQuestionReviewAI에서 추가됨

const currentQuestion = computed(() => {
  return questions.value[selectedQuestionIndex.value]
})

// TestQuestionReviewAI에서 가져온 함수
const getOptionLabel = (index) => {
  return String.fromCharCode(65 + index) + ')'
}

// TestQuestionReviewAI에서 가져온 함수 (난이도 텍스트)
const getDifficultyText = (level) => {
  if (!level) return 'NORMAL' // TestQuestionReviewAI는 currentQuestion.value.difficultyLevel을 사용
  switch (level) {
    case 1:
    case 2:
    case 'EASY':
      return '쉬움'
    case 3:
    case 'NORMAL':
      return '보통'
    case 4:
    case 5:
    case 'HARD':
      return '어려움'
    default:
      return '보통'
  }
}

// TestQuestionReviewAI에서 가져온 함수 (난이도 클래스)
const getDifficultyClass = () => {
  const difficultyText = currentQuestion.value?.difficultyLevel || currentQuestion.value?.difficulty
  let levelString = ''
  if (typeof difficultyText === 'number') {
    if (difficultyText <= 2) levelString = 'EASY'
    else if (difficultyText === 3) levelString = 'NORMAL'
    else if (difficultyText >= 4) levelString = 'HARD'
  } else {
    levelString = difficultyText
  }
  return `difficulty-${levelString.toLowerCase()}`
}

const processQuestionsData = (data) => {
  console.log('🔍 processQuestionsData 시작:', data)

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

  data.forEach((q, index) => {
    const processedQuestion = {
      id: q.id,
      documentId: q.documentId || `doc_${index}`, // quick에서는 documentId가 없을 수 있어 임시값 부여
      documentName: q.documentName || `문서 ${index + 1}`,
      question: q.question || q.questionText,
      type:
        q.type === 'MULTIPLE_CHOICE' ? 'MCQ' : q.type === 'SHORT_ANSWER' ? 'Subjective' : q.type,
      options: q.options ? q.options.map((opt) => (typeof opt === 'object' ? opt.text : opt)) : [],
      answer: q.answer,
      explanation: q.explanation,
      gradingCriteria: q.grading_criteria || q.gradingCriteria || null,
      keywords: q.keywords || [],
      tags: q.tags || [],
      difficultyLevel: q.difficulty_level || q.difficulty || 'NORMAL', // TestQuestionReviewAI와 맞춤
      generationType: q.generationType || 'BASIC', // quick 모드에서는 모두 BASIC으로 간주
      isReplaced: false,
    }

    // Quick 모드에서는 모든 질문을 BASIC으로 간주
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
    // Quick 모드에서는 EXTRA 질문 개념을 사용하지 않으므로, 이 부분은 비워둡니다.
    // if (processedQuestion.generationType === 'EXTRA') {
    //   allExtraQuestions.push(processedQuestion)
    // }
  })

  documents.value = Array.from(docsMap.values())
  questions.value = allQuestions
  extraQuestions.value = allExtraQuestions // 여기서는 사용되지 않을 수 있지만, TestQuestionReviewAI와의 일관성을 위해 유지

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
    console.log('🔍 questionsData prop 변경됨:', {
      newQuestionsData,
      length: newQuestionsData?.length,
      isLoading: props.isLoading,
    })

    isFetchingQuestions.value = props.isLoading
    if (newQuestionsData && newQuestionsData.length > 0) {
      console.log('🔍 processQuestionsData 호출 - 데이터 있음')
      processQuestionsData(newQuestionsData)
    } else if (newQuestionsData && newQuestionsData.length === 0) {
      console.log('🔍 questionsData 빈 배열')
      questions.value = []
      documents.value = [] // 문서 목록도 비워줍니다.
      selectedQuestionIndex.value = 0
      expandedPanels.value = []
    } else {
      console.log('🔍 questionsData null 또는 undefined')
    }
  },
  { immediate: true },
)

watch(
  () => props.isLoading,
  (newVal) => {
    console.log('🔍 isLoading prop 변경됨:', newVal)
    isFetchingQuestions.value = newVal
  },
)

// TestQuestionReviewAI에서 가져온 selectQuestion
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
  console.log('🔍 TestQuestionReviewQuick mounted')
  console.log('🔍 초기 props:', {
    questionsData: props.questionsData,
    isLoading: props.isLoading,
    testName: props.testName,
    testDuration: props.testDuration,
    passingScore: props.passingScore,
  })

  // 초기 데이터 처리 (prop watch에서 이미 immediate: true로 처리되지만, 명시적으로 호출 유지)
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
  padding: 2px; /* TestQuestionReviewAI와 맞춤 */
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
  max-width: 1150px; /* TestQuestionReviewAI와 맞춤 */
  left: 0;
  right: 0;
  margin: 0 auto;
}

.force-white {
  color: white !important;
}

/* TestQuestionReviewAI에서 가져온 스타일 */
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
