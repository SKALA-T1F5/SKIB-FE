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
import axios from '@/config/axios'
import AiGradingLoading from '@/components/trainee/test/AiGradingLoading.vue'

const router = useRouter()
const route = useRoute()

const testId = route.params.testId // URL 파라미터에서 testId 가져옴
const userId = ref('') // Local Storage에서 userId 가져올 예정

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
// const isLastQuestion = computed(() => currentQuestionIndex.value === allQuestions.value.length - 1) // 현재 사용되지 않음

const fetchTestQuestions = async () => {
  // 1. userId를 Local Storage에서 가져오기
  const storedUserId = localStorage.getItem('userId')
  if (!storedUserId) {
    alert('사용자 ID를 찾을 수 없습니다. 로그인 후 다시 시도해주세요.')
    router.push({ name: 'Login' }) // 예: 로그인 페이지로 리다이렉트
    return
  }
  userId.value = storedUserId

  // 2. testId 유효성 검사
  if (!testId || !userId.value) {
    alert('시험 ID 또는 사용자 ID가 유효하지 않습니다.')
    router.back() // 이전 페이지로 돌아가기
    return
  }

  try {
    // 3. API 호출
    const response = await axios.get(`/test/getUserTest?userId=${userId.value}&testId=${testId}`)
    const { statusCode, resultMsg, resultData } = response.data

    if (statusCode === 'OK' && resultData && Array.isArray(resultData.questions)) {
      allQuestions.value = resultData.questions.map((rawQ, index) => {
        // 백엔드에서 받은 question 객체에 'id' 또는 'questionId' 필드가 있다고 가정
        // 예시 응답에는 'questions' 배열 안에 질문 객체들이 직접 포함되어 있으므로,
        // 각 질문 객체에 고유한 식별자 (예: questionId)가 있다고 가정합니다.
        const questionId = rawQ.questionId || `Q${(index + 1).toString().padStart(2, '0')}` // 백엔드에서 questionId를 제공한다고 가정합니다.

        let initialAnswerValue
        if (rawQ.type === 'SUBJECTIVE') {
          initialAnswerValue = ref('')
        } else {
          initialAnswerValue = ''
        }
        userAnswers.value.set(questionId, initialAnswerValue)

        return {
          id: questionId, // 백엔드에서 제공하는 questionId 사용 또는 생성된 ID 사용
          type: rawQ.type,
          difficulty_level: rawQ.difficulty_level,
          questionText: rawQ.question, // API 응답의 'question' 필드를 'questionText'로 매핑
          options: rawQ.options,
          explanation: rawQ.explanation || '', // API 응답에 explanation이 있다면 사용
          gradingCriteria: rawQ.grading_criteria || null, // API 응답에 grading_criteria이 있다면 사용
          document_id: rawQ.document_id,
          tags: rawQ.tags,
          isAnswered: false,
        }
      })

      if (allQuestions.value.length > 0) {
        currentQuestionId.value = allQuestions.value[0].id
      } else {
        alert('시험 문제가 없습니다.')
        router.back() // 문제가 없는 경우 이전 페이지로 돌아가기
      }
    } else {
      console.warn(
        '문제 데이터를 불러오는 데 실패했습니다: 서버 응답 형식이 예상과 다르거나 questions 필드가 없습니다.',
        response.data,
      )
      allQuestions.value = []
      alert(`시험 문제를 불러오는 데 실패했습니다: ${resultMsg || '알 수 없는 오류'}`)
      router.back() // 문제 로드 실패 시 이전 페이지로 돌아가기
    }
  } catch (error) {
    console.error('문제 데이터를 로드하는 데 실패했습니다:', error)
    if (axios.isAxiosError(error) && error.response) {
      alert(
        `시험 문제를 불러오는 중 오류가 발생했습니다: ${error.response.data.message || '알 수 없는 오류'}`,
      )
    } else {
      alert('시험 문제를 불러오는 중 네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
    }
    router.back() // 문제 로드 실패 시 이전 페이지로 돌아가기
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

  const unansweredQuestions = allQuestions.value.filter((q) => {
    const answer = userAnswers.value.get(q.id)
    if (q.type === 'SUBJECTIVE') {
      // 주관식은 ref.value의 trim()이 비어있는지 확인
      return !answer || (typeof answer === 'object' && answer.value.trim() === '')
    } else {
      // 객관식은 Map에 값이 없거나 빈 문자열인지 확인
      return !answer || answer === ''
    }
  })

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
      questionId: questionId, // 백엔드에서 받는 questionId 필드를 사용
      response: typeof answer === 'object' ? answer.value : answer,
      questionType: question ? question.type : 'UNKNOWN',
    }
  })

  const requestBody = {
    userId: userId.value,
    testId: parseInt(testId), // testId를 숫자로 변환
    answers: answersToSend,
  }

  console.log('최종 제출될 요청 바디:', requestBody)

  try {
    // 실제 API 호출 (예시: 채점 결과를 제출하는 API)
    // Spring Boot에 채점 결과를 제출하는 API가 따로 있다면 해당 API를 호출해야 합니다.
    // 예: await axios.post(`/api/test/submitTestResult`, requestBody);
    // 현재 예시에서는 getUserTest API를 통해 문제를 가져왔으므로, 답안 제출 API는 별도로 가정합니다.
    // 여기서는 시뮬레이션으로 대체합니다.

    await new Promise((resolve) => setTimeout(resolve, 3000)) // 3초 대기 시뮬레이션

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
    state: { testName: '모의 시험', actualScore: 85, isPassed: true }, // 실제 채점 결과로 대체 필요
  })
}

const goToTraineeMain = () => {
  router.push({ name: 'TraineeMain' })
}

watch(
  () => {
    if (currentQuestion.value?.type === 'SUBJECTIVE') {
      const answerRef = userAnswers.value.get(currentQuestion.value.id)
      return answerRef ? answerRef.value : undefined // answerRef가 없을 경우를 대비
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
/* 기존 스타일 유지 */
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
