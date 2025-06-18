<template>
  <MainLayout
    :show-sidebar="true"
    sidebar-type="test"
    :test-questions="allQuestions"
    :current-test-question-id="currentQuestionId"
    @select-question-from-sidebar="handleQuestionSelectFromSidebar"
  >
    <template #content>
      <div class="test-taking-container-inner">
        <div class="top-nav">
          <h3 class="question-number-top" v-if="currentQuestion">{{ currentQuestion.id }}.</h3>
          <div class="nav-buttons-wrapper">
            <button
              class="nav-button"
              @click="goToPreviousQuestion"
              :disabled="!hasPreviousQuestion || showGradingOverlay"
            >
              <svg-icon type="mdi" :path="mdiChevronLeft" class="nav-icon" /> 이전 문제
            </button>
            <button
              class="nav-button"
              @click="goToNextQuestion"
              :disabled="!hasNextQuestion || showGradingOverlay"
            >
              다음 문제 <svg-icon type="mdi" :path="mdiChevronRight" class="nav-icon" />
            </button>
          </div>
        </div>

        <div class="question-taking-area" v-if="currentQuestion">
          <div class="question-section">
            <div class="question-text-fixed">
              <p class="question-text">{{ currentQuestion.questionText }}</p>
            </div>
            <div class="question-content-scrollable">
              <div class="options-container" v-if="currentQuestion.type === 'OBJECTIVE'">
                <div
                  v-for="(option, index) in currentQuestion.options"
                  :key="index"
                  :class="[
                    'option-item',
                    { 'is-selected': userAnswers.get(currentQuestion.id) === option },
                  ]"
                  @click="selectOption(option)"
                >
                  <span class="option-label">{{ getOptionLabel(index) }}</span>
                  <span class="option-content">{{ option }}</span>
                </div>
              </div>
              <div
                class="subjective-answer-section"
                v-else-if="currentQuestion.type === 'SUBJECTIVE'"
              >
                <div class="answer-group">
                  <p class="answer-label">나의 답변</p>
                  <textarea
                    class="answer-box user-answer-box"
                    v-model="userAnswers.get(currentQuestion.id).value"
                    placeholder="답변을 입력하세요."
                    :disabled="showGradingOverlay"
                  ></textarea>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="loading-message">
          <p>시험 문제를 로딩 중입니다...</p>
        </div>
      </div>

      <div class="submit-and-exit-buttons">
        <button
          class="submit-button"
          @click="handleSubmitAnswer"
          :disabled="!currentQuestion || showGradingOverlay"
        >
          제출
        </button>
      </div>

      <AiGradingLoading :show="showGradingOverlay" />

      <div class="completion-overlay" v-if="showCompletionButtons">
        <div class="completion-card">
          <p class="completion-message">채점이 완료되었습니다!</p>
          <div class="completion-buttons">
            <button class="action-button primary" @click="goToTestResult">채점 결과 확인</button>
            <button class="action-button secondary" @click="goToTraineeMain">메인 화면</button>
          </div>
        </div>
      </div>
    </template>
  </MainLayout>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import SvgIcon from '@jamescoyle/vue-icon'
import { mdiChevronLeft, mdiChevronRight } from '@mdi/js'

import MainLayout from '@/components/layouts/MainLayout.vue'
// TraineeTestSideBar는 이제 MainLayout 내부에서 직접 사용되므로 여기서 임포트하지 않습니다.
// import TraineeTestSideBar from '@/components/trainee/test/TraineeTestSideBar.vue'
import axios from '@/config/axios'
import AiGradingLoading from '@/components/trainee/test/AiGradingLoading.vue'

const router = useRouter()
const route = useRoute()

const testId = route.params.testId
const userId = ref('testUser123')

const allQuestions = ref([])
const currentQuestionId = ref(null)
const userAnswers = ref(new Map())

const showGradingOverlay = ref(false)
const showCompletionButtons = ref(false)

const currentQuestion = computed(() => {
  if (!currentQuestionId.value || allQuestions.value.length === 0) {
    return null
  }
  return allQuestions.value.find((q) => q.id === currentQuestionId.value)
})

const currentQuestionIndex = computed(() => {
  if (!currentQuestion.value) return -1
  return allQuestions.value.findIndex((q) => q.id === currentQuestion.value?.id)
})

const hasPreviousQuestion = computed(() => currentQuestionIndex.value > 0)
const hasNextQuestion = computed(() => currentQuestionIndex.value < allQuestions.value.length - 1)
const isLastQuestion = computed(() => currentQuestionIndex.value === allQuestions.value.length - 1)

const sampleApiData = [
  {
    type: 'OBJECTIVE',
    difficulty_level: 'NORMAL',
    question: "To-Be 프로세스 체인 정의서에서 'PC.10' 체인의 명칭은 무엇인가?",
    options: ['세금계산서', '전자결재', '수기전표', 'ERP 전표'],
    answer: '세금계산서',
    explanation: "'PC.10' 체인의 명칭은 '세금계산서'로 정의되어 있습니다.",
    grading_criteria: null,
    document_id: 1,
    tags: ['문해력'],
  },
  {
    type: 'OBJECTIVE',
    difficulty_level: 'NORMAL',
    question: "PC.10.01 프로세스에서 '정발행 세금계산서'의 ERP I/F System은 무엇인가?",
    options: ['스마트빌', 'eBill', 'XML 업로드', '오프라인'],
    answer: 'XML 업로드',
    explanation: '정발행 세금계산서의 ERP I/F System은 XML 업로드 방식으로 처리됩니다.',
    grading_criteria: null,
    document_id: 1,
    tags: ['이해력'],
  },
  {
    type: 'SUBJECTIVE',
    difficulty_level: 'NORMAL',
    question:
      'PC.10.02 프로세스에서 정발행/역발행 건의 결재 요청 및 승인 절차를 설명하세요. 이 문제는 지문이 다소 길어질 수 있으므로, 보기가 스크롤될 수 있도록 충분한 높이를 확보해야 합니다. 이는 사용자가 문제의 모든 보기를 한눈에 볼 수 있도록 하면서도, 전체 레이아웃의 균형을 유지하는 데 중요합니다. 이 문제는 지문이 다소 길어질 수 있으므로, 보기가 스크롤될 수 있도록 충분한 높이를 확보해야 합니다. 이는 사용자가 문제의 모든 보기를 한눈에 볼 수 있도록 하면서도, 전체 레이아웃의 균형을 유지하는 데 중요합니다. 이 문제는 지문이 다소 길어질 수 있으므로, 보기가 스크롤될 수 있도록 충분한 높이를 확보해야 합니다. 이는 사용자가 문제의 모든 보기를 한눈에 볼 수 있도록 하면서도, 전체 레이아웃의 균형을 유지하는 데 중요합니다.',
    options: null,
    answer:
      '검수/출장비 기반으로 발생한 정발행/역발행 건을 결재 요청하고, 결재 승인하는 절차입니다.',
    explanation:
      'PC.10.02 프로세스는 검수/출장비를 기반으로 정발행/역발행 건을 결재 요청하고 승인하는 절차를 포함합니다.',
    grading_criteria: [
      {
        score: 5,
        criteria: '정확하게 결재 요청 및 승인 절차를 설명하고, 관련 프로세스를 언급함.',
        example:
          '검수/출장비 기반으로 발생한 정발행/역발행 건을 결재 요청하고, 결재 승인하는 절차입니다.',
        note: '정확한 프로세스 명칭과 절차를 포함해야 합니다.',
      },
      {
        score: 3,
        criteria: '결재 요청 및 승인 절차를 대략적으로 설명함.',
        example: '정발행/역발행 건을 결재 요청하고 승인하는 절차입니다.',
        note: '프로세스의 주요 요소를 언급해야 합니다.',
      },
      {
        score: 1,
        criteria: '결재 요청 또는 승인 절차 중 하나만 언급함.',
        example: '결재 요청 절차입니다.',
        note: '부분적인 설명만 포함된 경우입니다.',
      },
    ],
    document_id: 1,
    tags: ['분석력'],
  },
  {
    type: 'SUBJECTIVE',
    difficulty_level: 'NORMAL',
    question: 'PC.10.03 수기전표관리 프로세스에서 수기전표의 생성 및 관리 절차를 설명하세요.',
    options: null,
    answer: '수기전표 대상을 조회하고 추가 등록하여 결재 상신하는 절차입니다.',
    explanation:
      'PC.10.03 프로세스는 수기전표 대상을 조회하고 추가 등록하여 결재 상신하는 절차를 포함합니다.',
    grading_criteria: [
      {
        score: 5,
        criteria: '수기전표의 생성 및 관리 절차를 정확하게 설명하고, 관련 프로세스를 언급함.',
        example: '수기전표 대상을 조회하고 추가 등록하여 결재 상신하는 절차입니다.',
        note: '정확한 프로세스 명칭과 절차를 포함해야 합니다.',
      },
      {
        score: 3,
        criteria: '수기전표의 생성 및 관리 절차를 대략적으로 설명함.',
        example: '수기전표를 조회하고 결재 상신하는 절차입니다.',
        note: '프로세스의 주요 요소를 언급해야 합니다.',
      },
      {
        score: 1,
        criteria: '수기전표의 생성 또는 관리 절차 중 하나만 언급함.',
        example: '수기전표 조회 절차입니다.',
        note: '부분적인 설명만 포함된 경우입니다.',
      },
    ],
    document_id: 1,
    tags: ['문제해결력'],
  },
  {
    type: 'OBJECTIVE',
    difficulty_level: 'HARD',
    question: '다음 중 데이터 시각화 도구가 아닌 것은?',
    options: ['Tableau', 'Power BI', 'MS Word', 'Qlik Sense'],
    answer: 'MS Word',
    explanation:
      'MS Word는 워드 프로세싱 소프트웨어이며, Tableau, Power BI, Qlik Sense는 데이터 시각화 도구입니다.',
    grading_criteria: null,
    document_id: 2,
    tags: ['상식', 'IT'],
  },
  {
    type: 'SUBJECTIVE',
    difficulty_level: 'EASY',
    question: 'Vue.js의 주요 특징 두 가지를 설명하세요.',
    options: null,
    answer: 'Vue.js는 점진적 채택이 가능하며, 반응형 데이터 바인딩을 지원합니다.',
    explanation:
      'Vue.js의 주요 특징으로는 점진적 채택(Progressive Framework)과 반응형 시스템이 있습니다. 점진적 채택은 프로젝트의 규모에 따라 유연하게 사용할 수 있다는 것을 의미하며, 반응형 시스템은 데이터 변경 시 자동으로 UI가 업데이트되는 것을 의미합니다.',
    grading_criteria: [
      {
        score: 5,
        criteria: '점진적 채택, 반응형 시스템 등 핵심 특징 2가지 이상을 정확히 설명함.',
        example: '점진적 채택과 반응형 데이터 바인딩이 있습니다.',
        note: '각 특징에 대한 간략한 설명도 포함하면 좋습니다.',
      },
      {
        score: 3,
        criteria: '핵심 특징 중 1가지 또는 유사한 특징을 설명함.',
        example: '데이터 바인딩이 편리합니다.',
        note: '하나의 특징만 정확하거나, 설명이 모호할 수 있습니다.',
      },
    ],
    document_id: 3,
    tags: ['개발', '프론트엔드'],
  },
]

const fetchTestQuestions = async () => {
  try {
    const fetchedData = sampleApiData

    if (Array.isArray(fetchedData)) {
      allQuestions.value = fetchedData.map((rawQ, index) => {
        const generatedId = `Q${(index + 1).toString().padStart(2, '0')}`
        let initialAnswerValue

        if (rawQ.type === 'SUBJECTIVE') {
          initialAnswerValue = ref('')
        } else {
          initialAnswerValue = ''
        }
        userAnswers.value.set(generatedId, initialAnswerValue)

        return {
          id: generatedId,
          type: rawQ.type,
          difficulty_level: rawQ.difficulty_level,
          questionText: rawQ.question,
          options: rawQ.options,
          explanation: '',
          gradingCriteria: null,
          document_id: rawQ.document_id,
          tags: rawQ.tags,
          isAnswered: false,
        }
      })

      if (allQuestions.value.length > 0) {
        currentQuestionId.value = allQuestions.value[0].id
      }
    } else {
      console.warn(
        '문제 데이터를 불러오는 데 실패했습니다: 서버 응답 형식이 예상과 다릅니다.',
        fetchedData,
      )
      allQuestions.value = []
    }
  } catch (error) {
    console.error('문제 데이터를 로드하는 데 실패했습니다:', error)
    alert('시험 문제를 불러오는 데 실패했습니다. 잠시 후 다시 시도해주세요.')
  }
}

const handleQuestionSelectFromSidebar = (questionId) => {
  if (!showGradingOverlay.value && !showCompletionButtons.value) {
    currentQuestionId.value = questionId
  }
}

const goToPreviousQuestion = () => {
  if (showGradingOverlay.value || showCompletionButtons.value) return
  const currentIndex = allQuestions.value.findIndex((q) => q.id === currentQuestionId.value)
  if (currentIndex > 0) {
    currentQuestionId.value = allQuestions.value[currentIndex - 1].id
  }
}

const goToNextQuestion = () => {
  if (showGradingOverlay.value || showCompletionButtons.value) return
  const currentIndex = allQuestions.value.findIndex((q) => q.id === currentQuestionId.value)
  if (currentIndex < allQuestions.value.length - 1) {
    currentQuestionId.value = allQuestions.value[currentIndex + 1].id
  }
}

const getOptionLabel = (index) => {
  return String.fromCharCode(65 + index) + ')'
}

const selectOption = (option) => {
  if (showGradingOverlay.value || showCompletionButtons.value) return
  if (currentQuestion.value) {
    userAnswers.value.set(currentQuestion.value.id, option)
    const questionToUpdate = allQuestions.value.find((q) => q.id === currentQuestion.value?.id)
    if (questionToUpdate) {
      questionToUpdate.isAnswered = true
    }
  }
}

const handleSubmitAnswer = () => {
  if (!currentQuestion.value || showGradingOverlay.value || showCompletionButtons.value) return

  const unansweredQuestions = allQuestions.value.filter((q) => !q.isAnswered)
  let confirmMessage = ''

  if (unansweredQuestions.length > 0) {
    confirmMessage = `풀지 않은 문제가 ${unansweredQuestions.length}개 존재합니다. 정말 제출하시겠습니까? 제출 후에는 수정할 수 없습니다.`
  } else {
    confirmMessage = `정말 제출하시겠습니까? 제출 후에는 수정할 수 없습니다.`
  }

  if (confirm(confirmMessage)) {
    submitFinalTest()
  }
}

const submitFinalTest = async () => {
  showGradingOverlay.value = true

  const answersToSend = Array.from(userAnswers.value.entries()).map(([questionId, answer]) => {
    const question = allQuestions.value.find((q) => q.id === questionId)
    return {
      id: questionId,
      response: typeof answer === 'object' ? answer.value : answer,
      questionType: question ? question.type : 'UNKNOWN',
    }
  })

  const requestBody = {
    userId: userId.value,
    testId: testId,
    answers: answersToSend,
  }

  console.log('최종 제출될 요청 바디:', requestBody)

  try {
    await new Promise((resolve) => setTimeout(resolve, 3000))

    console.log('시험 제출 및 채점 완료 (시뮬레이션)')

    showGradingOverlay.value = false
    showCompletionButtons.value = true
  } catch (error) {
    console.error('시험 제출 실패:', error)
    showGradingOverlay.value = false

    if (axios.isAxiosError(error) && error.response) {
      alert(`시험 제출 중 오류가 발생했습니다: ${error.response.data.message || '알 수 없는 오류'}`)
    } else {
      alert('시험 제출 중 네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
    }
    showCompletionButtons.value = false
  }
}

const goToTestResult = () => {
  router.push({
    name: 'TraineeTestResult',
    params: { testId: testId },
    state: { testName: '모의 시험', actualScore: 85, isPassed: true },
  })
}

const goToTraineeMain = () => {
  router.push({ name: 'TraineeMain' })
}

watch(
  () => {
    if (currentQuestion.value?.type === 'SUBJECTIVE') {
      const answerRef = userAnswers.value.get(currentQuestion.value.id)
      return answerRef.value
    }
    return undefined
  },
  (newValue) => {
    if (currentQuestion.value && currentQuestion.value.type === 'SUBJECTIVE') {
      const questionToUpdate = allQuestions.value.find((q) => q.id === currentQuestion.value?.id)
      if (questionToUpdate) {
        questionToUpdate.isAnswered = newValue !== '' && newValue !== undefined && newValue !== null
      }
    }
  },
)

onMounted(() => {
  fetchTestQuestions()
})
</script>

<style scoped>
/* MainLayout에 의해 관리되는 .page-content-wrapper, .main-content-area 등의 스타일은 제거되었습니다. */
/* 이제 이 스타일들은 MainLayout 내부에서 처리되거나, TraineeTest.vue의 실제 콘텐츠에 맞게 재정의되어야 합니다. */
/* 다만, MainLayout의 CSS가 이전에 예상했던 레이아웃을 제공하므로, 여기서는 불필요한 레이아웃 관련 스타일을 제거했습니다. */
/* 실제 콘텐츠 영역에만 적용되는 스타일은 유지됩니다. */

/* 기존 .page-content-wrapper, .main-content-area 에 적용되었던 레이아웃 관련 스타일은 MainLayout에서 처리되므로 TraineeTest.vue에서는 제거합니다. */
/* TraineeTest.vue는 이제 MainLayout의 content 슬롯에 직접 들어갈 내용만을 스타일링합니다. */

/* .test-taking-container-inner 는 content 슬롯에 직접 들어가는 최상위 요소가 됩니다. */
.test-taking-container-inner {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  min-height: 0;
  overflow: hidden;
  padding-bottom: 120px; /* 제출 버튼 공간 확보 */
}

.question-taking-area {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  gap: 25px;
  min-height: 0;
  overflow: hidden;
}

.question-section {
  background-color: #ffffff;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  flex-shrink: 0;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  min-height: 350px;
  overflow: hidden;
}

.top-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  flex-shrink: 0;
}

.question-number-top {
  font-size: 26px;
  font-weight: 700;
  color: #343a40;
  margin: 0;
  padding-right: 20px;
}

.nav-buttons-wrapper {
  display: flex;
  gap: 12px;
}

.nav-button {
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 10px 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  font-size: 15px;
  font-weight: 500;
  color: #495057;
  transition: all 0.2s ease-in-out;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.nav-button:hover:not(:disabled) {
  background-color: #f0f0f0;
  border-color: #d0d0d0;
  color: #343a40;
  transform: translateY(-1px);
}

.nav-button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
  background-color: #f8f9fa;
  color: #adb5bd;
}

.nav-icon {
  font-size: 20px;
  margin: 0 5px;
  color: #6c757d;
}
.nav-button:hover:not(:disabled) .nav-icon {
  color: #495057;
}

.question-text-fixed {
  flex-shrink: 0;
  margin-bottom: 20px;
}

.question-text {
  font-size: 17px;
  line-height: 1.7;
  margin: 0;
  color: #495057;
}

.question-content-scrollable {
  flex-grow: 1;
  overflow-y: auto;
  padding-right: 10px;
}

.question-content-scrollable::-webkit-scrollbar {
  width: 6px;
}
.question-content-scrollable::-webkit-scrollbar-track {
  background: transparent;
}
.question-content-scrollable::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
}
.question-content-scrollable::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.4);
}

.options-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
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
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  position: relative;
}

.option-item:hover {
  background-color: #e9ecef;
  border-color: #ced4da;
}

.option-item.is-selected {
  background-color: #e6f7ff;
  border-color: #a8dcf0;
  font-weight: 600;
  color: #2b6cb0;
  box-shadow: 0 2px 5px rgba(0, 123, 255, 0.1);
}

.option-label {
  min-width: 30px;
  font-weight: bold;
  margin-right: 15px;
  color: #6c757d;
  flex-shrink: 0;
}
.option-item.is-selected .option-label {
  color: #2b6cb0;
}

.option-content {
  flex-grow: 1;
  word-break: break-word;
}

.subjective-answer-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-bottom: 5px;
}

.answer-group {
  display: flex;
  flex-direction: column;
}

.answer-label {
  font-size: 15px;
  font-weight: 600;
  color: #343a40;
  margin-bottom: 8px;
  align-self: flex-start;
}

.answer-box {
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 10px;
  padding: 15px 20px;
  font-size: 16px;
  line-height: 1.6;
  word-break: break-word;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  min-height: 150px;
  resize: vertical;
  color: #495057;
}

.answer-box:focus {
  border-color: #a8dcf0;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
  outline: none;
}

.submit-and-exit-buttons {
  position: absolute;
  bottom: 85px;
  right: 25px;
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  flex-shrink: 0;
  z-index: 10;
}

.submit-button {
  border: none;
  border-radius: 10px;
  padding: 12px 25px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition:
    background-color 0.2s ease-in-out,
    transform 0.1s ease-in-out;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  background-color: #28a745;
  color: white;
}

.submit-button:hover:not(:disabled) {
  background-color: #218838;
  transform: translateY(-1px);
}

.submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background-color: #92b192;
}

.loading-message {
  background-color: #ffffff;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  text-align: center;
  color: #555;
  font-size: 17px;
  height: 250px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 채점 완료 후 선택 버튼 오버레이 스타일 */
.completion-overlay {
  position: fixed; /* MainLayout의 content 슬롯 안에 있으므로 absolute 대신 fixed를 사용하여 전체 화면을 덮습니다. */
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9998; /* AiGradingLoading 보다 낮은 z-index */
}

.completion-card {
  background-color: #ffffff;
  border-radius: 12px;
  padding: 40px 50px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.25);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 25px;
  max-width: 500px;
  width: 90%;
  box-sizing: border-box;
}

.completion-message {
  font-size: 26px;
  font-weight: 700;
  color: #343a40;
  margin: 0;
}

.completion-buttons {
  display: flex;
  gap: 15px;
  justify-content: center;
  width: 100%;
}

.action-button {
  border: none;
  border-radius: 10px;
  padding: 14px 28px;
  font-size: 17px;
  font-weight: 600;
  cursor: pointer;
  transition:
    background-color 0.2s ease-in-out,
    transform 0.1s ease-in-out,
    box-shadow 0.2s ease-in-out;
  flex-grow: 1;
  max-width: 200px;
}

.action-button.primary {
  background-color: #007bff;
  color: white;
  box-shadow: 0 2px 8px rgba(0, 123, 255, 0.2);
}

.action-button.primary:hover {
  background-color: #0069d9;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
}

.action-button.secondary {
  background-color: #6c757d;
  color: white;
  box-shadow: 0 2px 8px rgba(108, 117, 125, 0.2);
}

.action-button.secondary:hover {
  background-color: #5a6268;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(108, 117, 125, 0.3);
}
</style>
