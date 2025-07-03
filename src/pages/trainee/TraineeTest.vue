<template>
  <MainLayout :show-sidebar="true" sidebar-type="test" :test-questions="allQuestions"
    :current-test-question-id="currentQuestionId" @select-question-from-sidebar="handleQuestionSelectFromSidebar">
    <template #sidebar="{ isCollapsed }">
      <TraineeTestSideBar :is-collapsed="isCollapsed" :questions="allQuestions" :current-question-id="currentQuestionId"
        @select-question="handleQuestionSelectFromSidebar" />
    </template>

    <template #content>
      <div class="test-taking-container-inner">
        <div class="time-progress">
          <span class="time-progress-clock">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#191d5a" stroke-width="2" />
              <path d="M12 7v5l3 3" stroke="#191d5a" stroke-width="2" stroke-linecap="round" />
            </svg>
            <span class="time-progress-text">{{ formattedTime }}</span>
          </span>
          <div class="time-progress-bar-bg">
            <div class="time-progress-bar" :style="{ width: `${progressPercentage}%`, backgroundColor: progressColor }">
            </div>
          </div>
        </div>
        <!-- <div class="top-nav">
          <h3 class="question-number-top" v-if="currentQuestion">{{ currentQuestion.id }}.</h3>
          <div class="nav-buttons-wrapper">
            <button class="nav-button" @click="goToPreviousQuestion"
              :disabled="!hasPreviousQuestion || showGradingOverlay">
              <svg-icon type="mdi" :path="mdiChevronLeft" class="nav-icon" /> 이전 문제
            </button>
            <button class="nav-button" @click="goToNextQuestion" :disabled="!hasNextQuestion || showGradingOverlay">
              다음 문제 <svg-icon type="mdi" :path="mdiChevronRight" class="nav-icon" />
            </button>
          </div>
        </div> -->

        <div class="question-taking-area" v-if="currentQuestion">
          <div class="question-section">
            <div class="question-text-fixed">
              <p class="question-text"><strong>{{ currentQuestion.id }}. </strong></p>
              <p class="question-text">{{ currentQuestion.questionText }}</p>
            </div>
            <div class="question-content-scrollable">
              <div class="options-container" v-if="currentQuestion.type === 'OBJECTIVE'">
                <div v-for="(option, index) in currentQuestion.options" :key="index" :class="[
                  'option-item',
                  { 'is-selected': userAnswers.get(currentQuestion.id) === option },
                ]" @click="selectOption(option)">
                  <span class="option-label">{{ getOptionLabel(index) }}</span>
                  <span class="option-content">{{ option }}</span>
                </div>
              </div>
              <div class="subjective-answer-section" v-else-if="currentQuestion.type === 'SUBJECTIVE'">
                <div class="answer-group">
                  <p class="answer-label">{{ $t('myAnswer') }}</p>
                  <textarea class="answer-box user-answer-box" v-model="userAnswers.get(currentQuestion.id).value"
                    placeholder="답변을 입력하세요." :disabled="showGradingOverlay"></textarea>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="loading-message">
          <p>{{ $t('loadingQuestions') }}</p>
        </div>
      </div>

      <div class="submit-and-exit-buttons">
        <div class="left-buttons">
          <button class="nav-button" @click="goToPreviousQuestion"
            :disabled="!hasPreviousQuestion || showGradingOverlay">
            <svg-icon type="mdi" :path="mdiChevronLeft" class="nav-icon" /> {{ $t('prev') }}
          </button>
        </div>
        <div class="right-buttons">
          <button class="nav-button" @click="goToNextQuestion" :disabled="!hasNextQuestion || showGradingOverlay">
            {{ $t('next') }} <svg-icon type="mdi" :path="mdiChevronRight" class="nav-icon" />
          </button>
          <button class="submit-button" @click="handleSubmitAnswer"
            :class="{ 'not-all-answered': !answerStatusList.every(Boolean) }"
            :disabled="!currentQuestion || showGradingOverlay">
            {{ $t('submit') }}
          </button>
        </div>
      </div>

      <AiGradingLoading :show="showGradingOverlay" />

      <div class="completion-overlay" v-if="showCompletionButtons">
        <div class="completion-card">
          <p class="completion-message">{{ t('gradingComplete') }}</p>
          <div class="completion-buttons">
            <button class="action-button primary" @click="goToTestResult">{{ $t('result') }}</button>
            <button class="action-button secondary" @click="goToTraineeMain">{{ $t('mainPage') }}</button>
          </div>
        </div>
      </div>
    </template>
  </MainLayout>
</template>

<script setup>
// ===== [1] 라이브러리 및 컴포넌트 import =====
import { ref, computed, onMounted, watch, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import SvgIcon from '@jamescoyle/vue-icon'
import { mdiChevronLeft, mdiChevronRight } from '@mdi/js'
import MainLayout from '@/components/layouts/MainLayout.vue'
import TraineeTestSideBar from '@/components/trainee/test/TraineeTestSideBar.vue'
import api from '@/config/axios'
import AiGradingLoading from '@/components/trainee/test/AiGradingLoading.vue'

import { useI18n } from 'vue-i18n'
const { t, locale } = useI18n()

// ===== [2] 라우터 및 기본 변수 선언 =====
const router = useRouter()
const route = useRoute()
const testId = route.params.testId
const userId = ref('')

// ===== [3] 시험 문제 및 답변 관련 상태 =====
const allQuestions = ref([])
const currentQuestionId = ref(null)
const userAnswers = ref(new Map())

// ===== [4] UI 상태 관련 변수 =====
const showGradingOverlay = ref(false)
const showCompletionButtons = ref(false)

// ===== [5] 현재 문제 및 인덱스 계산 =====
const currentQuestion = computed(() => {
  if (!currentQuestionId.value || allQuestions.value.length === 0) return null
  return allQuestions.value.find((q) => q.id === currentQuestionId.value)
})
const currentQuestionIndex = computed(() => {
  if (!currentQuestion.value) return -1
  return allQuestions.value.findIndex((q) => q.id === currentQuestion.value?.id)
})
const hasPreviousQuestion = computed(() => currentQuestionIndex.value > 0)
const hasNextQuestion = computed(() => currentQuestionIndex.value < allQuestions.value.length - 1)

// ===== [6] 답변 완료 여부 리스트 =====
const answerStatusList = computed(() =>
  allQuestions.value.map((q) => {
    const answer = userAnswers.value.get(q.id)
    if (q.type === 'SUBJECTIVE') {
      return !!(answer && answer.value && answer.value.trim() !== '')
    } else {
      return !!(answer && answer !== '')
    }
  })
)

// ===== [7] 타이머 및 진행률 관련 변수 =====
const totalTime = ref(0) // 서버에서 받아올 제한시간 (초)
const remainingTime = ref(0) // 남은 시간 (초)
const timerInterval = ref(null) // 타이머 인터벌 ID
const animationFrameId = ref(null) // progress bar 애니메이션 ID
const startTimestamp = ref(0) // 타이머 시작 시각(ms)
const endTimestamp = ref(0) // 타이머 종료 시각(ms)

const progressPercentage = ref(100)
const progressColor = computed(() => remainingTime.value <= 10 ? '#e74c3c' : '#191d5a')
const formattedTime = computed(() => {
  const m = String(Math.floor(remainingTime.value / 60)).padStart(2, '0')
  const s = String(remainingTime.value % 60).padStart(2, '0')
  return `${m}:${s}`
})

// ===== [7-1] progress bar 실시간 애니메이션 함수 =====
const updateProgressBar = () => {
  const now = Date.now()
  const total = endTimestamp.value - startTimestamp.value
  const left = Math.max(endTimestamp.value - now, 0)
  progressPercentage.value = total > 0 ? (left / total) * 100 : 0

  if (left > 0 && !showGradingOverlay.value && !showCompletionButtons.value) {
    animationFrameId.value = requestAnimationFrame(updateProgressBar)
  }
}

// ===== [7-2] 타이머 시작 함수 =====
const startTimer = () => {
  if (timerInterval.value) clearInterval(timerInterval.value)
  if (animationFrameId.value) cancelAnimationFrame(animationFrameId.value)

  startTimestamp.value = Date.now()
  endTimestamp.value = startTimestamp.value + remainingTime.value * 1000

  // 1초마다 남은 시간 감소
  timerInterval.value = setInterval(() => {
    const now = Date.now()
    const leftSec = Math.max(Math.ceil((endTimestamp.value - now) / 1000), 0)
    remainingTime.value = leftSec
    if (leftSec <= 0) {
      clearInterval(timerInterval.value)
      handleTimeExpired()
    }
  }, 1000)

  // progress bar 자연스럽게
  updateProgressBar()
}

// ===== [7-3] 타이머 정지 함수 =====
const stopTimer = () => {
  if (timerInterval.value) {
    clearInterval(timerInterval.value)
    timerInterval.value = null
  }
  if (animationFrameId.value) {
    cancelAnimationFrame(animationFrameId.value)
    animationFrameId.value = null
  }
}

// ===== [7-4] 시간 만료 시 자동 제출 함수 =====
const handleTimeExpired = () => {
  if (showGradingOverlay.value || showCompletionButtons.value) return

  alert(t('timeExpired'))
  submitFinalTest()
}

// ===== [7-5] 컴포넌트 언마운트 시 타이머 정리 =====
onUnmounted(() => {
  stopTimer()
})

// ===== [8] 시험 문제 불러오기 함수 =====
const fetchTestQuestions = async () => {
  const storedUserId = localStorage.getItem('userId')
  if (!storedUserId) {
    alert('사용자 ID를 찾을 수 없습니다. 로그인 후 다시 시도해주세요.')
    router.push({ name: 'Login' })
    return
  }
  userId.value = storedUserId
  if (!testId || !userId.value) {
    alert('시험 ID 또는 사용자 ID가 유효하지 않습니다.')
    router.back()
    return
  }
  try {
    const lang = localStorage.getItem('lang') || 'ko'
    const params = { userId: userId.value, testId: testId, lang }
    // console.log('[fetchTestQuestions] params:', params)
    const response = await api.get('/test/getUserTest', { params })
    // console.log('[fetchTestQuestions] response:', response.data)
    const { statusCode, resultMsg, resultData } = response.data
    if (statusCode === 'OK' && resultData && Array.isArray(resultData.questions)) {
      // 제한시간 설정
      if (resultData.limitedTime) {
        totalTime.value = resultData.limitedTime * 60 // 분을 초로 변환
        remainingTime.value = totalTime.value
        startTimer() // 타이머 시작
      }

      allQuestions.value = resultData.questions.map((rawQ, index) => {
        const questionId = `Q${(index + 1).toString().padStart(2, '0')}`
        let initialAnswerValue
        if (rawQ.type === 'SUBJECTIVE') {
          initialAnswerValue = ref('')
        } else {
          initialAnswerValue = ''
        }
        userAnswers.value.set(questionId, initialAnswerValue)
        return {
          id: questionId, // 프론트 표시용
          rawId: rawQ.id, // 백엔드용(MongoDB ObjectId)
          type: rawQ.type,
          difficulty_level: rawQ.difficulty_level,
          questionText: rawQ.question,
          options: rawQ.options,
          answer: rawQ.answer,
          explanation: rawQ.explanation || '',
          gradingCriteria: rawQ.grading_criteria || null,
          documentId: rawQ.documentId,
          documentName: rawQ.documentName,
          keywords: rawQ.keywords,
          tags: rawQ.tags,
          generationType: rawQ.generationType,
          isAnswered: false,
        }
      })
      // console.log('🟩 백엔드에서 받은 질문 목록:', resultData.questions)
      if (allQuestions.value.length > 0) {
        currentQuestionId.value = allQuestions.value[0].id
      } else {
        alert(t('noQuestions'))
        router.back()
      }
    } else {
      allQuestions.value = []
      alert(`시험 문제를 불러오는 데 실패했습니다: ${resultMsg || '알 수 없는 오류'}`)
      router.back()
    }
  } catch (error) {
    alert(t('loadingQuestions'))
    router.back()
  }
}

// ===== [9] 문제 이동 및 선택 관련 함수 =====
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

// ===== [10] 객관식/주관식 답변 선택 함수 =====
const getOptionLabel = (index) => String.fromCharCode(65 + index) + ')'
const selectOption = (option) => {
  if (showGradingOverlay.value || showCompletionButtons.value) return
  if (currentQuestion.value) {
    userAnswers.value.set(currentQuestion.value.id, option)

    // 객관식 답변 완료 상태 업데이트
    const questionToUpdate = allQuestions.value.find((q) => q.id === currentQuestion.value.id)
    if (questionToUpdate) {
      questionToUpdate.isAnswered = true
    }
  }
}

// ===== [11] 답변 제출 및 서버 전송 함수 =====
const handleSubmitAnswer = () => {
  if (!currentQuestion.value || showGradingOverlay.value || showCompletionButtons.value) return
  const unansweredQuestions = allQuestions.value.filter((q) => {
    const answer = userAnswers.value.get(q.id)
    if (q.type === 'SUBJECTIVE') {
      return !answer || (typeof answer === 'object' && answer.value.trim() === '')
    } else {
      return !answer || answer === ''
    }
  })
  let confirmMessage = ''
  if (unansweredQuestions.length > 0) {
    confirmMessage = t('confirmSubmitWithUnanswered', { count: unansweredQuestions.length })
  } else {
    confirmMessage = t('confirmSubmit')
  }
  if (confirm(confirmMessage)) {
    submitFinalTest()
  }
}
const submitFinalTest = async () => {
  showGradingOverlay.value = true
  stopTimer() // 타이머 정지

  const answersToSend = allQuestions.value.map((q) => {
    const answer = userAnswers.value.get(q.id)
    return {
      id: q.rawId, // ObjectId 그대로 전달
      response: typeof answer === 'object' ? answer.value : answer,
      questionType: q.type,
    }
  })
  try {
    await api.post('/answer',
      { answers: answersToSend },
      {
        params: {
          userId: userId.value,
          testId: testId,
        },
      }
    )
    showGradingOverlay.value = false
    showCompletionButtons.value = true
    if (removeRouterGuard) {
      removeRouterGuard()
      removeRouterGuard = null
    }
  } catch (error) {
    showGradingOverlay.value = false
    alert(t('submitError'))
    showCompletionButtons.value = false
  }
}

// ===== [12] 결과 페이지 이동 함수 =====
const goToTestResult = () => {
  router.push({
    name: 'TraineeTestResult',
    params: { testId: testId },
  })
}
const goToTraineeMain = () => {
  router.push({ name: 'TraineeMain' })
}

// ===== [13] 주관식 답변 변경 감지 =====
watch(
  () => {
    if (currentQuestion.value?.type === 'SUBJECTIVE') {
      const answerRef = userAnswers.value.get(currentQuestion.value.id)
      return answerRef ? answerRef.value : undefined
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

// ===== [14] 컴포넌트 마운트 시 시험 문제 불러오기 =====
let removeRouterGuard = null

// ===== [보안] blockEvent 함수는 전역에서 한 번만 정의 =====
function blockEvent(e) {
  e.preventDefault()
  return false
}

onMounted(() => {
  fetchTestQuestions()

  // 브라우저 새로고침/닫기 방지
  window.addEventListener('beforeunload', beforeUnloadHandler)

  // 라우터 이동 방지
  removeRouterGuard = router.beforeEach((to, from, next) => {
    if (!showCompletionButtons.value) {
      if (to.fullPath !== from.fullPath) {
        alert('시험 제출 전에는 페이지를 벗어날 수 없습니다.');
        next(false)
        return
      }
    }
    next()
  })

  // ===== [보안] 복사/붙여넣기/우클릭/드래그/개발자도구 차단 =====
  document.addEventListener('copy', blockEvent)
  document.addEventListener('cut', blockEvent)
  document.addEventListener('paste', blockEvent)
  document.addEventListener('contextmenu', blockEvent)
  document.addEventListener('selectstart', blockEvent)
  document.addEventListener('dragstart', blockEvent)
  document.addEventListener('keydown', (e) => {
    if (
      e.key === 'F12' ||
      (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'i') ||
      (e.ctrlKey && e.key.toLowerCase() === 'u') ||
      (e.key === 'PrintScreen')
    ) {
      e.preventDefault()
      return false
    }
  })
  // console.log('🛡️ blockEvent 활성화')
})

// ===== [14-1] 컴포넌트 언마운트 시 이벤트 해제 =====
onUnmounted(() => {
  stopTimer()
  window.removeEventListener('beforeunload', beforeUnloadHandler)
  // 보안 이벤트 해제
  document.removeEventListener('copy', blockEvent)
  document.removeEventListener('cut', blockEvent)
  document.removeEventListener('paste', blockEvent)
  document.removeEventListener('contextmenu', blockEvent)
  document.removeEventListener('selectstart', blockEvent)
  document.removeEventListener('dragstart', blockEvent)
  document.removeEventListener('keydown', blockEvent)
  // console.log('🔓 blockEvent 해제')
})

// ===== [14-2] 새로고침/닫기 방지 핸들러 =====
function beforeUnloadHandler(event) {
  if (!showCompletionButtons.value) {
    event.preventDefault()
    event.returnValue = ''
    return ''
  }
}
</script>

<style scoped>
/* 기존 스타일 유지 */
.test-taking-container-inner {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  min-height: 550px;
  overflow: hidden;
  /* max-width:980px; */
  /* margin-left: 250px;
  margin-right: 250px; */
  

  /* 제출 버튼 공간 확보 */
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
  border-color: #25426e86;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0);
  outline: none;
}

.submit-and-exit-buttons {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
  flex-shrink: 0;
  z-index: 10;
  margin-top: auto;
  padding: 0 25px 30px 25px;
}

.left-buttons {
  display: flex;
  gap: 15px;
}

.right-buttons {
  display: flex;
  gap: 15px;
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

.submit-button.not-all-answered {
  background-color: #92b192;
  color: #f3f3f3;
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
  position: fixed;
  /* MainLayout의 content 슬롯 안에 있으므로 absolute 대신 fixed를 사용하여 전체 화면을 덮습니다. */
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9998;
  /* AiGradingLoading 보다 낮은 z-index */
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

.time-progress {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-left: 25px;
  margin-right: 25px;
  /* margin-bottom: 25px; */
  width: 94%;
  max-width: 100%;
}

.time-progress-clock {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 60px;
}

.time-progress-text {
  font-size: 16px;
  font-weight: 700;
  color: #191d5a;
}

.time-progress-bar-bg {
  flex: 1;
  background: #e0e0e0;
  border-radius: 6px;
  height: 8px;
  position: relative;
  overflow: hidden;
  max-width: none;
  min-width: 120px;
  direction: rlt;
}

.time-progress-bar {
  height: 100%;
  border-radius: 6px;
  transition: width 0.5s, background-color 0.3s;
  float: right;
}
</style>
