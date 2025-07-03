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

  <!-- 테스트 정보 Section (가로 1줄 배치) -->
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

  <!-- 문제 정보 Section (TestQuestionReviewAI와 동일) -->
  <v-row class="mt-4">
    <v-col cols="12">
      <v-card elevation="0" class="section-bg">
        <v-card-text class="pa-8 d-flex flex-column flex-grow-1">
          <div class="d-flex justify-space-between align-center mb-6">
            <h4 class="section-title mb-0">문제 상세 및 수정</h4>
            <div class="d-flex align-center" style="gap: 8px">
              <v-btn
                variant="outlined"
                color="#191d5a"
                size="small"
                :disabled="selectedQuestionIndex === 0 || questions.length === 0"
                @click="moveToPreviousQuestion"
              >
                이전 문제
              </v-btn>
              <span class="text-subtitle-1 font-weight-medium" style="color: #191d5a">
                {{ selectedQuestionIndex + 1 }} / {{ questions.length }}
              </span>
              <v-btn
                variant="outlined"
                color="#191d5a"
                size="small"
                :disabled="selectedQuestionIndex === questions.length - 1 || questions.length === 0"
                @click="moveToNextQuestion"
              >
                다음 문제
              </v-btn>
            </div>
          </div>

          <div
            v-if="isFetchingQuestions"
            class="d-flex justify-center align-center py-10 flex-grow-1"
          >
            <v-progress-circular indeterminate color="#191d5a" size="50"></v-progress-circular>
            <span class="ml-4 text-h6" style="color: #191d5a">문제 로딩 중...</span>
          </div>

          <div v-else-if="currentQuestion" class="flex-grow-1 d-flex flex-column">
            <v-card outlined class="mb-4 pa-4 flex-grow-1">
              <v-chip-group column class="mb-4">
                <v-chip label color="blue-grey lighten-5">
                  유형: {{ currentQuestion.type === 'MCQ' ? '객관식' : '주관식' }}
                </v-chip>
                <v-chip label :color="getDifficultyColor(currentQuestion.difficulty)">
                  난이도: {{ getDifficultyText(currentQuestion.difficulty) }}
                </v-chip>
                <v-chip label color="blue-grey lighten-5" v-if="currentQuestion.documentName">
                  출처: {{ currentQuestion.documentName }}
                </v-chip>
              </v-chip-group>

              <v-textarea
                v-model="currentQuestion.question"
                label="문제"
                outlined
                rows="3"
                hide-details
                class="mb-4"
              ></v-textarea>

              <div v-if="currentQuestion.type === 'MCQ'">
                <h5 class="font-weight-medium text-subtitle-1 mb-2">선택지</h5>
                <v-text-field
                  v-for="(option, index) in currentQuestion.options"
                  :key="index"
                  v-model="currentQuestion.options[index]"
                  :label="`선택지 ${index + 1}`"
                  outlined
                  dense
                  hide-details
                  class="mb-2"
                ></v-text-field>
              </div>

              <v-text-field
                v-model="currentQuestion.answer"
                label="정답"
                outlined
                dense
                hide-details
                class="mb-4"
              ></v-text-field>

              <v-textarea
                v-model="currentQuestion.explanation"
                label="풀이"
                outlined
                rows="3"
                hide-details
                class="mb-4"
              ></v-textarea>

              <div v-if="currentQuestion.type === 'Subjective' && currentQuestion.gradingCriteria">
                <h5 class="font-weight-medium text-subtitle-1 mb-2">채점 기준</h5>
                <table class="grading-table">
                  <thead>
                    <tr>
                      <th class="score-column">점수</th>
                      <th>기준</th>
                      <th>예시</th>
                      <th>비고</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(criteria, cIdx) in currentQuestion.gradingCriteria" :key="cIdx">
                      <td class="score-column">{{ criteria.score }}</td>
                      <td>{{ criteria.criteria }}</td>
                      <td>{{ criteria.example }}</td>
                      <td>{{ criteria.note }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <v-combobox
                v-model="currentQuestion.keywords"
                label="키워드 (쉼표로 구분)"
                multiple
                chips
                outlined
                dense
                clearable
                class="mt-4"
              ></v-combobox>

              <v-combobox
                v-model="currentQuestion.tags"
                label="태그 (쉼표로 구분)"
                multiple
                chips
                outlined
                dense
                clearable
              ></v-combobox>

              <v-card-actions class="d-flex justify-end mt-4">
                <v-btn color="#191d5a" class="white--text" @click="saveQuestionChanges">
                  변경 사항 저장
                </v-btn>
                <v-btn color="red" class="white--text" @click="replaceQuestion">
                  문제 교체 (AI 재요청)
                </v-btn>
              </v-card-actions>
            </v-card>
          </div>

          <div v-else class="d-flex flex-column align-center justify-center flex-grow-1">
            <p class="text-h6 text-medium-emphasis">문제 데이터를 불러오는 중입니다...</p>
          </div>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>

  <v-row class="bottom-fixed-actions">
    <v-col cols="12" class="d-flex justify-space-between align-center px-0">
      <v-btn variant="flat" color="grey" class="force-white" @click="prevStep"> 이전 단계 </v-btn>
      <v-btn
        variant="flat"
        color="#191d5a"
        @click="nextStep"
        :disabled="questions.length === 0 || isFetchingQuestions"
      >
        검토 완료
      </v-btn>
    </v-col>
  </v-row>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const emit = defineEmits(['next-step', 'prev-step', 'update:isLoading'])

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

const questions = ref([])
const selectedQuestionIndex = ref(0)
const isFetchingQuestions = ref(false)
const currentQuestion = computed(() => {
  return questions.value[selectedQuestionIndex.value]
})

const getDifficultyColor = (level) => {
  switch (level) {
    case 1:
    case 'EASY':
      return 'green lighten-3'
    case 2:
    case 3:
    case 'NORMAL':
      return 'orange lighten-3'
    case 4:
    case 5:
    case 'HARD':
      return 'red lighten-3'
    default:
      return 'grey lighten-3'
  }
}

const getDifficultyText = (level) => {
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

const processQuestionsData = (data) => {
  console.log('🔍 processQuestionsData 시작:', data)

  const allQuestions = data.map((q, index) => {
    console.log(`🔍 문제 ${index} 처리:`, q)

    const processedQuestion = {
      id: q.id,
      documentId: q.documentId || q.documentName,
      documentName: q.documentName || `문서 ${index + 1}`,
      question: q.question || q.questionText,
      type:
        q.type === 'MULTIPLE_CHOICE' ? 'MCQ' : q.type === 'SHORT_ANSWER' ? 'Subjective' : q.type,
      options: q.options ? q.options.map((opt) => (typeof opt === 'object' ? opt.text : opt)) : [],
      answer: q.answer,
      explanation: q.explanation,
      keywords: q.keywords || [],
      tags: q.tags || [],
      difficulty: q.difficulty || 3,
      gradingCriteria: q.gradingCriteria || null,
    }

    console.log(`🔍 처리된 문제 ${index}:`, processedQuestion)
    return processedQuestion
  })

  questions.value = allQuestions
  selectedQuestionIndex.value = 0

  console.log('🔍 processQuestionsData 완료:', {
    questions: questions.value,
    questionsLength: questions.value.length,
  })
}

const saveQuestionChanges = async () => {
  if (!currentQuestion.value) return

  try {
    // 실제 API 연동 시에는 currentQuestion.value의 변경된 내용을 서버로 전송
    // 예: await axios.put(`/api/questions/${currentQuestion.value.id}`, currentQuestion.value);
    console.log('문제 변경 사항 저장:', currentQuestion.value)
    alert('문제 변경 사항이 저장되었습니다.')
  } catch (error) {
    console.error('문제 변경 사항 저장 실패:', error)
    alert('문제 변경 사항 저장에 실패했습니다.')
  }
}

const replaceQuestion = async () => {
  if (!currentQuestion.value) return

  // 이 부분은 AI에게 새로운 문제 생성을 요청하는 API 호출이 필요합니다.
  alert('문제 교체 기능은 아직 구현되지 않았습니다. AI 재요청 로직이 필요합니다.')
  console.log('문제 교체 요청 (AI 재요청):', currentQuestion.value)

  // 예시: API 호출
  // try {
  //   const response = await axios.post('/api/regenerate-question', {
  //     documentId: currentQuestion.value.documentId,
  //     keywords: currentQuestion.value.keywords,
  //     type: currentQuestion.value.type,
  //     difficultyLevel: currentQuestion.value.difficultyLevel
  //   });
  //   const newQuestion = response.data.resultData;
  //   // 기존 문제를 새 문제로 교체
  //   questions.value[selectedQuestionIndex.value] = newQuestion;
  //   alert('문제가 성공적으로 교체되었습니다!');
  // } catch (error) {
  //   console.error('문제 교체 실패:', error);
  //   alert('문제 교체에 실패했습니다. 다시 시도해주세요.');
  // }
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
      selectedQuestionIndex.value = 0
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

.force-white {
  color: white !important;
}

.grading-table {
  width: 100%;
  min-width: 600px; /* 테이블 최소 너비 설정 (콘텐츠에 따라 조절) */
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
  white-space: nowrap; /* 셀 내용이 줄바꿈되지 않도록 */
}

/* "점수" 열 너비 조정 */
.grading-table :deep(th.score-column),
.grading-table :deep(td.score-column) {
  width: 80px; /* 점수 열의 너비를 더 넓게 */
  min-width: 80px; /* 최소 너비 유지 */
  max-width: 80px; /* 최대 너비 제한 */
  white-space: nowrap;
}
</style>
