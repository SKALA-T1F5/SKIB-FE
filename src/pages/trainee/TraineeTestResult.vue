<template>
  <MainLayout :show-sidebar="allQuestions.length > 0" sidebar-type="testResult">
    <template #sidebar="{ isCollapsed }">
      <TraineeTestResultSideBar
        :is-collapsed="isCollapsed"
        :questions="allQuestions"
        :current-question-id="currentQuestionId"
        @select-question="handleQuestionSelectFromSidebar"
      />
    </template>

    <template #content>
      <div class="test-result-content-and-chatbot-wrapper">
        <div class="test-result-main-content">
          <div class="test-result-container-inner">
            <div class="top-nav">
              <h3 class="question-number-top" v-if="currentQuestion">{{ currentQuestion.id }}.</h3>
              <div class="nav-buttons-wrapper">
                <button
                  class="nav-button"
                  @click="goToPreviousQuestion"
                  :disabled="!hasPreviousQuestion"
                >
                  <svg-icon type="mdi" :path="mdiChevronLeft" class="nav-icon" /> 이전 문제
                </button>
                <button class="nav-button" @click="goToNextQuestion" :disabled="!hasNextQuestion">
                  다음 문제 <svg-icon type="mdi" :path="mdiChevronRight" class="nav-icon" />
                </button>
              </div>
            </div>

            <div class="question-solution-area" v-if="currentQuestion">
              <TraineeQuestionArea :question="currentQuestion" />
              <TraineeSolutionArea
                :explanation="currentQuestion.explanation"
                :grading-criteria="currentQuestion.gradingCriteria"
              />
            </div>
            <div v-else class="loading-message">
              <p>시험 결과를 로딩 중입니다...</p>
            </div>

            <div class="exit-button-container">
              <button class="exit-button" @click="exitTestResult">나가기</button>
            </div>
          </div>
        </div>

        <TraineeChatbot :current-question-id="currentQuestionId" />
      </div>
    </template>
  </MainLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import MainLayout from '@/components/layouts/MainLayout.vue'
import TraineeTestResultSideBar from '@/components/trainee/result/TraineeTestResultSideBar.vue'
import TraineeQuestionArea from '@/components/trainee/result/TraineeQuestionArea.vue'
import TraineeSolutionArea from '@/components/trainee/result/TraineeSolutionArea.vue'
import TraineeChatbot from '@/components/trainee/result/TraineeChatbot.vue'
import SvgIcon from '@jamescoyle/vue-icon'
import { mdiChevronLeft, mdiChevronRight } from '@mdi/js'

const router = useRouter()

const allQuestions = ref([])
const currentQuestionId = ref(null)

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

onMounted(() => {
  fetchTestQuestions()
})

// UI 확인을 위한 Sample Data (Hardcoded) - 이전과 동일하므로 생략
const sampleApiData = [
  {
    type: 'OBJECTIVE',
    difficulty_level: 'NORMAL',
    question: "To-Be 프로세스 체인 정의서에서 'PC.10' 체인의 명칭은 무엇인가?",
    options: ['세금계산서', '전자결재', '수기전표', 'ERP 전표'], // 4지선다로 수정
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
    options: ['스마트빌', 'eBill', 'XML 업로드', '오프라인'], // 4지선다
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
      '검수/출장비 기반으로 발생한 정발행/역발행 건을 결재 요청하고, 결재 승인하는 절차입니다. 이 예시 답안은 실제 답변의 길이와 복잡성을 반영하며, 사용자가 작성한 답변과 비교될 수 있도록 충분한 정보를 포함합니다. 이 예시 답안은 실제 답변의 길이와 복잡성을 반영하며, 사용자가 작성한 답변과 비교될 수 있도록 충분한 정보를 포함합니다. 이 예시 답안은 실제 답변의 길이와 복잡성을 반영하며, 사용자가 작성한 답변과 비교될 수 있도록 충분한 정보를 포함합니다. 이 예시 답안은 실제 답변의 길이와 복잡성을 반영하며, 사용자가 작성한 답변과 비교될 수 있도록 충분한 정보를 포함합니다.',
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
    options: ['Tableau', 'Power BI', 'MS Word', 'Qlik Sense'], // 4지선다
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
        let userAnswer = ''
        let isCorrect = undefined

        if (rawQ.type === 'OBJECTIVE') {
          if (generatedId === 'Q01') {
            userAnswer = rawQ.answer
            isCorrect = true
          } else if (generatedId === 'Q02') {
            userAnswer = rawQ.options && rawQ.options.length > 0 ? rawQ.options[0] : ''
            isCorrect = false
          } else if (generatedId === 'Q05') {
            userAnswer = rawQ.answer
            isCorrect = true
          }
        } else {
          if (generatedId === 'Q03') {
            userAnswer =
              '검수/출장비 기반으로 정발행/역발행 건을 결재 요청하고 승인하는 절차입니다. 저의 답변은 좀 더 자세한 내용을 포함합니다. 이 답변은 예시 답안과 비교하여 채점될 수 있습니다.'
            isCorrect = true
          } else if (generatedId === 'Q04') {
            userAnswer =
              '수기전표는 조회하고 추가 등록하여 결재 상신하는 과정으로 관리됩니다. 이 과정은 전표의 정확성을 보장하고 승인을 위한 중요한 단계입니다.'
            isCorrect = true
          } else if (generatedId === 'Q06') {
            userAnswer = '반응형 데이터 바인딩입니다.'
            isCorrect = false
          }
        }

        return {
          id: generatedId,
          type: rawQ.type,
          difficulty_level: rawQ.difficulty_level,
          questionText: rawQ.question,
          options: rawQ.options,
          correctAnswer: rawQ.answer,
          explanation: rawQ.explanation,
          gradingCriteria: rawQ.grading_criteria,
          document_id: rawQ.document_id,
          tags: rawQ.tags,
          userAnswer: userAnswer,
          isCorrect: isCorrect,
        }
      })

      if (allQuestions.value.length > 0) {
        currentQuestionId.value = allQuestions.value[0].id
      }
    } else {
      console.warn('샘플 데이터가 예상된 문제 배열 형태가 아닙니다.', fetchedData)
      allQuestions.value = []
    }
  } catch (error) {
    console.error('샘플 데이터를 로드하는 데 실패했습니다:', error)
    alert('UI 데이터를 불러오는 데 실패했습니다. 콘솔을 확인해주세요.')
  }
}

const handleQuestionSelectFromSidebar = (questionId) => {
  currentQuestionId.value = questionId
}

const goToPreviousQuestion = () => {
  const currentIndex = allQuestions.value.findIndex((q) => q.id === currentQuestionId.value)
  if (currentIndex > 0) {
    currentQuestionId.value = allQuestions.value[currentIndex - 1].id
  }
}

const goToNextQuestion = () => {
  const currentIndex = allQuestions.value.findIndex((q) => q.id === currentQuestionId.value)
  if (currentIndex < allQuestions.value.length - 1) {
    currentQuestionId.value = allQuestions.value[currentIndex + 1].id
  }
}

const exitTestResult = () => {
  if (confirm('테스트 결과 화면을 종료하시겠습니까?')) {
    console.log('테스트 결과 화면 종료 (실제 앱에서는 메인 페이지로 이동)')
    router.push({ name: 'TraineeMain' })
  }
}
</script>

<style scoped>
.test-result-content-and-chatbot-wrapper {
  display: flex;
  flex: 1;
  gap: 25px;
  height: 100%; /* 부모의 전체 높이를 차지하도록 설정 */
  overflow: hidden; /* 내부 요소가 넘치지 않도록 숨김 */
}

.test-result-main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0;
  overflow: hidden;
  gap: 25px; /* `top-nav`, `question-solution-area`, `exit-button-container` 사이의 간격 */
  box-sizing: border-box;
  height: 100%; /* 부모의 전체 높이를 차지하도록 설정 */
}

.test-result-container-inner {
  display: flex;
  flex-direction: column;
  flex: 1; /* .test-result-main-content 내에서 남은 공간을 차지 */
  overflow: hidden;
}

/* Top Navigation */
.top-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px; /* question-solution-area와의 간격 */
  flex-shrink: 0;
  height: 48px; /* 고정 높이 */
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
  flex: 1; /* .test-result-container-inner 내에서 남은 공간을 차지 */
  gap: 25px; /* 문제 영역과 풀이 영역 사이의 간격 */
  overflow-y: hidden; /* 자식 컴포넌트들이 스스로 스크롤을 가짐 */
  min-height: 0; /* 중요: Flex 컨테이너의 자식인 .question-solution-area가 내용물에 의해 커지는 것을 방지 */
}

.exit-button-container {
  margin-top: 30px; /* question-solution-area와의 간격 */
  text-align: left;
  flex-shrink: 0;
  height: 44px; /* 고정 높이 */
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
</style>
