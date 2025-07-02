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
      <v-card elevation="0" class="section-bg d-flex flex-column flex-grow-1">
        <v-card-text class="pa-8 d-flex flex-column flex-grow-1">
          <h4 class="section-title">테스트 정보</h4>
          <v-text-field
            v-model="internalTestName"
            label="테스트명"
            variant="outlined"
            density="compact"
            hide-details
            class="mb-4"
            bg-color="white"
          ></v-text-field>
          <v-text-field
            v-model.number="internalTestDuration"
            label="응시 제한 시간 (분)"
            type="number"
            variant="outlined"
            density="compact"
            hide-details
            class="mb-4"
            bg-color="white"
          ></v-text-field>
          <v-text-field
            v-model.number="internalPassingScore"
            label="합격 기준 점수"
            type="number"
            variant="outlined"
            density="compact"
            hide-details
            class="mb-4"
            bg-color="white"
          ></v-text-field>

          <v-divider class="my-4"></v-divider>

          <div class="d-flex justify-space-between align-center mb-6">
            <h4 class="section-title mb-0">문제 목록</h4>
          </div>
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
                v-for="(keyword, kIdx) in currentQuestion.tags"
                :key="kIdx"
                size="x-small"
                color="blue-grey-lighten-4"
                variant="tonal"
                rounded="lg"
                class="ml-1 mr-1 my-1"
              >
                {{ keyword }}
              </v-chip>
              <span class="text-h8 mt-1 ml-2" style="color: grey"> | {{ difficultyStars }} </span>
              <v-spacer></v-spacer>
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
    default: '',
  },
  testDuration: {
    type: Number,
    default: 60,
  },
  passingScore: {
    type: Number,
    default: 60,
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
  emit('next-step', { selectedQuestionIds, toDeleteQuestionIds })
}

function prevStep() {
  emit('prev-step')
}

const documents = ref([])
const questions = ref([])
const selectedQuestionIndex = ref(0)
const isFetchingQuestions = ref(false)
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
  return `정답: ${currentQuestion.value.answer}\n\n해설: ${currentQuestion.value.explanation}`
})

const difficultyStars = computed(() => {
  if (!currentQuestion.value || typeof currentQuestion.value.difficulty !== 'number') return ''
  return (
    '★'.repeat(currentQuestion.value.difficulty) + '☆'.repeat(5 - currentQuestion.value.difficulty)
  )
})

const processQuestionsData = (data) => {
  const docsMap = new Map()
  const allQuestions = []

  data.forEach((q) => {
    const processedQuestion = {
      id: q.id,
      documentId: q.documentId || q.documentName, // documentId가 없는 경우 documentName 사용
      documentName: q.documentName,
      question: q.question || q.questionText, // question 또는 questionText 사용
      type:
        q.type === 'MULTIPLE_CHOICE' ? 'MCQ' : q.type === 'SHORT_ANSWER' ? 'Subjective' : q.type, // 타입 매핑
      options: q.options ? q.options.map((opt) => (typeof opt === 'object' ? opt.text : opt)) : [], // 옵션 형식 통일 (문자열 배열)
      answer: q.answer,
      explanation: q.explanation,
      tags: q.tags || [],
      difficulty: q.difficulty || 3, // 기본 난이도 설정
    }

    if (!docsMap.has(processedQuestion.documentName)) {
      docsMap.set(processedQuestion.documentName, {
        id: processedQuestion.documentId,
        name: processedQuestion.documentName,
        questions: [],
      })
    }
    docsMap.get(processedQuestion.documentName).questions.push(processedQuestion)
    allQuestions.push(processedQuestion)
  })

  documents.value = Array.from(docsMap.values())
  questions.value = allQuestions
  selectedQuestionIndex.value = 0
  if (questions.value.length > 0) {
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
    } else if (newQuestionsData && newQuestionsData.length === 0) {
      documents.value = []
      questions.value = []
      selectedQuestionIndex.value = 0
      expandedPanels.value = []
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
  // 예시 데이터 로드
  if (props.questionsData.length === 0 && !props.isLoading) {
    processQuestionsData([
      {
        id: 'mock-q-1',
        documentId: 'doc-1',
        documentName: '데이터베이스 기초',
        question:
          '관계형 데이터베이스에서 여러 테이블 간의 관계를 정의하는 데 사용되는 키는 무엇입니까?',
        type: 'MULTIPLE_CHOICE',
        options: ['기본 키', '외래 키', '후보 키', '대리 키'],
        answer: '외래 키',
        explanation:
          '외래 키는 한 테이블의 필드가 다른 테이블의 기본 키를 참조하여 두 테이블 간의 관계를 설정하는 데 사용됩니다.',
        tags: ['데이터베이스', '관계형'],
        difficulty: 4,
      },
      {
        id: 'mock-q-2',
        documentId: 'doc-1',
        documentName: '데이터베이스 기초',
        question: 'SQL에서 데이터를 삽입하는 데 사용되는 명령문은 무엇입니까?',
        type: 'SHORT_ANSWER',
        options: [],
        answer: 'INSERT INTO',
        explanation: 'INSERT INTO 명령문은 테이블에 새 행을 추가하는 데 사용됩니다.',
        tags: ['SQL', '데이터 조작'],
        difficulty: 3,
      },
      {
        id: 'mock-q-3',
        documentId: 'doc-2',
        documentName: '네트워크 보안',
        question: 'Dos 공격이란 무엇인지 설명하시오.',
        type: 'SHORT_ANSWER',
        options: [],
        answer:
          '서비스 거부(Denial-of-Service) 공격은 시스템의 리소스를 고갈시키거나 서비스를 중단시켜 사용자가 정상적으로 서비스를 이용할 수 없도록 만드는 공격입니다.',
        explanation:
          '주로 네트워크 트래픽을 과도하게 발생시키거나 시스템 취약점을 이용하여 이루어집니다.',
        tags: ['네트워크', '보안'],
        difficulty: 5,
      },
      {
        id: 'mock-q-4',
        documentId: 'doc-2',
        documentName: '네트워크 보안',
        question: '다음 중 암호화 방식이 아닌 것은?',
        type: 'MULTIPLE_CHOICE',
        options: ['AES', 'RSA', 'MD5', 'DES'],
        answer: 'MD5',
        explanation: 'MD5는 해싱 알고리즘으로, 암호화와는 다른 단방향 함수입니다.',
        tags: ['암호화', '보안'],
        difficulty: 4,
      },
      {
        id: 'mock-q-5',
        documentId: 'doc-3',
        documentName: '운영체제 개론',
        question: '교착 상태(Deadlock)의 4가지 필요 조건은 무엇입니까?',
        type: 'SHORT_ANSWER',
        options: [],
        answer: '상호 배제, 점유와 대기, 비선점, 순환 대기',
        explanation: '이 네 가지 조건이 모두 충족될 때 교착 상태가 발생할 수 있습니다.',
        tags: ['운영체제', '프로세스'],
        difficulty: 4,
      },
    ])
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
  max-width: 100%;
  left: 0;
  right: 0;
  margin: 0 auto;
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
