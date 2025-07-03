<template>
  <MainLayout :show-sidebar="allQuestions.length > 0" sidebar-type="testResult">
    <template #sidebar="{ isCollapsed }">
      <TraineeTestResultSideBar :is-collapsed="isCollapsed" :questions="allQuestions"
        :current-question-id="currentQuestionId" @select-question="handleQuestionSelectFromSidebar" />
    </template>

    <template #content>
      <div class="test-result-content-and-chatbot-wrapper">
        <div class="test-result-main-content">
          <div class="test-result-container-inner">
            <div class="top-nav">
              <h3 class="question-number-top" v-if="currentQuestion">{{ currentQuestion.questionNo }}.</h3>
              <!-- <div class="nav-buttons-wrapper">
                <button class="nav-button" @click="goToPreviousQuestion" :disabled="!hasPreviousQuestion">
                  <svg-icon type="mdi" :path="mdiChevronLeft" class="nav-icon" /> 이전 문제
                </button>
                <button class="nav-button" @click="goToNextQuestion" :disabled="!hasNextQuestion">
                  다음 문제 <svg-icon type="mdi" :path="mdiChevronRight" class="nav-icon" />
                </button>
              </div> -->
            </div>

            <div class="question-solution-area" v-if="currentQuestion">
              <TraineeQuestionArea :question="currentQuestion" />
              <TraineeSolutionArea :explanation="currentQuestion.explanation"
                :grading-criteria="currentQuestion.gradingCriteria" />
            </div>
            <div v-else class="loading-message">
              <p>{{ $t('loadingTestResult') }}</p>
            </div>

            <!-- <div class="exit-button-container">
              <button class="exit-button" @click="exitTestResult">나가기</button>
            </div> -->
          </div>



          <div class="submit-and-exit-buttons">
            <div class="left-buttons">
              <button class="nav-button" @click="goToPreviousQuestion" :disabled="!hasPreviousQuestion">
                <svg-icon type="mdi" :path="mdiChevronLeft" class="nav-icon" /> {{ $t('prev') }}
              </button>
            </div>
            <div class="right-buttons">
              <button class="nav-button" @click="goToNextQuestion" :disabled="!hasNextQuestion">
                {{ $t('next') }} <svg-icon type="mdi" :path="mdiChevronRight" class="nav-icon" />
              </button>
              <button class="exit-button" @click="exitTestResult">{{ $t('exit') }}</button>
            </div>
          </div>

          <div v-if="isTranslating" class="translating-message-overlay">
            {{ $t('translating') }}
          </div>

        </div>

         <TraineeChatbot :current-question-id="currentQuestion ? currentQuestion.id : null" :test-questions="chatbotQuestions" :user-id="userId" />
      </div>
    </template>

  </MainLayout>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import MainLayout from '@/components/layouts/MainLayout.vue'
import TraineeTestResultSideBar from '@/components/trainee/result/TraineeTestResultSideBar.vue'
import TraineeQuestionArea from '@/components/trainee/result/TraineeQuestionArea.vue'
import TraineeSolutionArea from '@/components/trainee/result/TraineeSolutionArea.vue'
import TraineeChatbot from '@/components/trainee/result/TraineeChatbot.vue'
import SvgIcon from '@jamescoyle/vue-icon'
import { mdiChevronLeft, mdiChevronRight } from '@mdi/js'
import api from '@/config/axios'

import { useI18n } from 'vue-i18n'
const { t, locale } = useI18n()

const router = useRouter()
const route = useRoute()

const allQuestions = ref([])
const chatbotQuestions = ref([])
const currentQuestionId = ref(null)
const isTranslating = ref(false)
const userId = localStorage.getItem('userId') || ''

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

// ===== [보안] blockEvent 함수는 전역에서 한 번만 정의 =====
function blockEvent(e) {
  e.preventDefault()
  return false
}

onMounted(() => {
  fetchTestQuestions()
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
  console.log('🛡️ blockEvent 활성화')
})

onUnmounted(() => {
  // 보안 이벤트 해제
  document.removeEventListener('copy', blockEvent)
  document.removeEventListener('cut', blockEvent)
  document.removeEventListener('paste', blockEvent)
  document.removeEventListener('contextmenu', blockEvent)
  document.removeEventListener('selectstart', blockEvent)
  document.removeEventListener('dragstart', blockEvent)
  document.removeEventListener('keydown', blockEvent)
  console.log('🔓 blockEvent 해제')
})

// 언어 변경 시 API 재호출
watch(locale, (newLang, oldLang) => {
  // console.log('[watch] locale changed:', oldLang, '→', newLang)
  if (newLang !== oldLang) {
    fetchTestQuestions()
  }
})

const fetchTestQuestions = async () => {
  try {
    isTranslating.value = true
    // userId, testId, lang 파라미터 준비
    let testId = route.params.testId
    if (!testId) testId = localStorage.getItem('testId')
    const lang = locale.value || 'ko'
    // console.log('[fetchTestQuestions] lang:', lang)
    // console.log('[getResult] params:', { userId, testId, lang })
    const params = { userId, testId, lang }
    // 언어 변경 전 현재 문제 id 저장
    const prevQuestionId = currentQuestionId.value
    // 기존 allQuestions용 API
    const res = await api.get('/answer/getResult', { params })
    // console.log('[fetchTestQuestions] resultData:', res.data.resultData)
    if (res.data.statusCode === 'OK' && Array.isArray(res.data.resultData)) {
      allQuestions.value = res.data.resultData.map((q, index) => ({
        id: q.questionId,
        questionNo: `Q${(index + 1).toString().padStart(2, '0')}`,
        type: q.type,
        difficulty_level: q.difficulty_level || '',
        questionText: q.question,
        options: q.options,
        correctAnswer: q.answer,
        explanation: q.explanation,
        gradingCriteria: q.grading_criteria || null,
        document_id: q.document_id || null,
        tags: q.tags || [],
        userAnswer: q.response,
        isCorrect: q.correct,
        score: q.score,
      }))
      if (allQuestions.value.length > 0) {
        // 기존에 보고 있던 문제 id가 있으면 그걸로, 없으면 첫 번째 문제로
        const found = allQuestions.value.find(q => q.id === prevQuestionId)
        currentQuestionId.value = found ? found.id : allQuestions.value[0].id
      }
    } else {
      allQuestions.value = []
    }
    // 챗봇용 API 호출
    const chatbotRes = await api.get('/test/getUserTest', { params })
    if (chatbotRes.data.statusCode === 'OK' && chatbotRes.data.resultData && Array.isArray(chatbotRes.data.resultData.questions)) {
      chatbotQuestions.value = chatbotRes.data.resultData.questions
    } else {
      chatbotQuestions.value = []
    }
    isTranslating.value = false
  } catch (error) {
    console.error('/answer/getResult 또는 /test/getUserTest API 호출 실패:', error)
    allQuestions.value = []
    chatbotQuestions.value = []
    isTranslating.value = false
  }
}

const handleQuestionSelectFromSidebar = (questionId) => {
  currentQuestionId.value = questionId
}

const goToPreviousQuestion = () => {
  const currentIndex = allQuestions.value.findIndex((q) => String(q.id) === String(currentQuestionId.value))
  if (currentIndex > 0) {
    currentQuestionId.value = allQuestions.value[currentIndex - 1].id
  }
}

const goToNextQuestion = () => {
  const currentIndex = allQuestions.value.findIndex((q) => String(q.id) === String(currentQuestionId.value))
  if (currentIndex < allQuestions.value.length - 1) {
    currentQuestionId.value = allQuestions.value[currentIndex + 1].id
  }
}

const exitTestResult = () => {
  if (confirm(t('confirmExitResult'))) {
    // console.log('테스트 결과 화면 종료 (실제 앱에서는 메인 페이지로 이동)')
    router.push({ name: 'TraineeMain' })
  }
}
</script>

<style scoped>
.test-result-content-and-chatbot-wrapper {
  display: flex;
  flex: 1;
  gap: 25px;
  height: 100%;
  /* 부모의 전체 높이를 차지하도록 설정 */
  overflow: hidden;
  /* 내부 요소가 넘치지 않도록 숨김 */
}

.test-result-main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0;
  overflow: hidden;
  gap: 25px;
  /* `top-nav`, `question-solution-area`, `exit-button-container` 사이의 간격 */
  box-sizing: border-box;
  height: 100%;
  /* 부모의 전체 높이를 차지하도록 설정 */
}

.test-result-container-inner {
  display: flex;
  flex-direction: column;
  flex: 1;
  /* .test-result-main-content 내에서 남은 공간을 차지 */
  overflow: hidden;
}

/* Top Navigation */
.top-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  /* margin-bottom: 25px; */
  /* question-solution-area와의 간격 */
  flex-shrink: 0;
  height: 48px;
  /* 고정 높이 */
  /* 이 top-nav의 height와 margin-bottom이 .question-solution-area의 계산에 영향을 줍니다. */
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

/* Question and Solution Area */
.question-solution-area {
  display: flex;
  flex-direction: column;
  flex: 1;
  /* .test-result-container-inner 내에서 남은 공간을 차지 */
  gap: 25px;
  /* 문제 영역과 풀이 영역 사이의 간격 */
  overflow-y: hidden;
  /* 자식 컴포넌트들이 스스로 스크롤을 가짐 */
  min-height: 0;
  /* 중요: Flex 컨테이너의 자식인 .question-solution-area가 내용물에 의해 커지는 것을 방지 */
}

.exit-button-container {
  margin-top: 30px;
  /* question-solution-area와의 간격 */
  text-align: left;
  flex-shrink: 0;
  height: 44px;
  /* 고정 높이 */
}

.exit-button {
  background-color: #1e2251;
  color: white;
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
}

.exit-button:hover {
  background-color: #2c3e50;
  transform: translateY(-1px);
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

.translating-message-overlay {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: #222;
  color: #fff;
  padding: 12px 32px;
  border-radius: 8px;
  font-size: 18px;
  font-weight: 600;
  z-index: 99999;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  pointer-events: none;
  opacity: 0.96;
}
</style>
