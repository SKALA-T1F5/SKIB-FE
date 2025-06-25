<template>
  <MainLayout
    :show-sidebar="allQuestions.length > 0"
    sidebar-type="project"
    :project="associatedProject"
  >
    <template #sidebar="{ isCollapsed }">
      <TrainerSideBar
        :is-collapsed="isCollapsed"
        :projects="userProjects"
        :current-project-id="associatedProject ? associatedProject.id : null"
        @select-project="handleProjectSelectFromSidebar"
      />
    </template>

    <template #content>
      <div class="trainer-test-question-content-wrapper">
        <div class="trainer-test-question-main-content">
          <div class="trainer-test-question-container-inner">
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
              <TrainerQuestionArea
                :question="currentQuestion"
                :difficulty-level="currentQuestion.difficulty_level"
                :question-type="currentQuestion.type"
                :correct-answer="currentQuestion.correctAnswer"
              />
              <TrainerSolutionArea
                :explanation="currentQuestion.explanation"
                :grading-criteria="currentQuestion.gradingCriteria"
                :question-type="currentQuestion.type"
                :correct-answer="currentQuestion.correctAnswer"
              />
            </div>
            <div v-else class="loading-message">
              <p>문제를 로딩 중입니다...</p>
            </div>

            <div class="exit-button-container">
              <button class="exit-button" @click="exitPage">나가기</button>
            </div>
          </div>
        </div>
      </div>
    </template>
  </MainLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import MainLayout from '@/components/layouts/MainLayout.vue'
// TrainerTestQuestionSideBar 대신 TrainerSideBar를 임포트합니다.
import TrainerSideBar from '@/components/trainer/TrainerSideBar.vue' // ProjectDetail.vue와 동일한 사이드바

import TrainerQuestionArea from '@/components/trainer/question/TrainerQuestionArea.vue'
import TrainerSolutionArea from '@/components/trainer/question/TrainerSolutionArea.vue'
import SvgIcon from '@jamescoyle/vue-icon'
import { mdiChevronLeft, mdiChevronRight } from '@mdi/js'

const router = useRouter()
const route = useRoute()

const allQuestions = ref([])
const currentQuestionId = ref(null)

// 이 시험과 연관된 (또는 현재 페이지의) 프로젝트 정보
const associatedProject = ref(null)

// TrainerSideBar에 전달할 사용자 전체 프로젝트 목록
const userProjects = ref([])

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

  // `ProjectDetail.vue`에서처럼 프로젝트 ID를 라우트 파라미터로 받을 수 있다고 가정
  const projectIdFromRoute = route.params.projectId
  if (projectIdFromRoute) {
    // 해당 프로젝트 상세 정보를 가져와 associatedProject에 설정
    fetchAssociatedProject(projectIdFromRoute)
    // TrainerSideBar에 표시할 전체 프로젝트 목록도 가져옵니다.
    fetchUserProjects()
  } else {
    // projectId가 없는 경우, 기본 프로젝트를 설정하거나 에러 처리
    console.warn('라우트 파라미터에 projectId가 없습니다. 기본 프로젝트를 로드합니다.')
    fetchUserProjects() // 전체 목록은 로드
    // associatedProject를 첫 번째 프로젝트로 설정하거나 기본값 유지
  }
})

// 샘플 API 데이터 (문제 데이터는 기존과 동일)
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
        return {
          id: generatedId,
          type: rawQ.type,
          difficulty_level: rawQ.difficulty_level,
          questionText: rawQ.question,
          options: rawQ.options,
          correctAnswer: rawQ.answer, // 정답 정보도 함께 전달
          explanation: rawQ.explanation,
          gradingCriteria: rawQ.grading_criteria,
          document_id: rawQ.document_id,
          tags: rawQ.tags,
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

// 이 함수를 통해 해당 시험과 연결된 프로젝트 정보를 가져옵니다.
const fetchAssociatedProject = async (projectId) => {
  // 실제 API 호출 로직을 여기에 구현합니다.
  // 예: const response = await axios.get(`/api/projects/${projectId}`);
  // const projectData = response.data;

  // 임시 데이터 (실제 프로젝트 정보라고 가정)
  const sampleProjectData = {
    id: parseInt(projectId),
    projectName: `데모 프로젝트 ${projectId}: 신입 역량 평가`, // `MainLayout`이 이 이름을 사용할 수 있도록
    description: '신입 트레이니의 기본 역량 평가를 위한 프로젝트입니다.',
  }
  associatedProject.value = sampleProjectData
  console.log('연결된 프로젝트 정보:', associatedProject.value)
}

// TrainerSideBar에 표시할 사용자 전체 프로젝트 목록을 가져옵니다.
const fetchUserProjects = async () => {
  // 실제 API 호출 로직을 여기에 구현합니다.
  // 예: const response = await axios.get('/api/users/current/projects');
  // userProjects.value = response.data;

  // 임시 데이터
  const dummyProjects = [
    { id: 1, name: '프로젝트 A: AI 기반 추천 시스템' },
    { id: 2, name: '프로젝트 B: 웹 서비스 성능 개선' },
    { id: 3, name: '프로젝트 C: 모바일 앱 UI/UX 리뉴얼' },
    { id: 123, name: '데모 프로젝트: 신입 역량 평가' }, // 현재 페이지와 연관된 프로젝트도 포함
  ]
  userProjects.value = dummyProjects
  console.log('사용자 프로젝트 목록:', userProjects.value)
}

// TrainerSideBar에서 프로젝트 선택 시 처리하는 함수
const handleProjectSelectFromSidebar = (projectId) => {
  console.log(`사이드바에서 프로젝트 ID ${projectId} 선택됨`)
  // TrainerTestQuestion 페이지 내에서 다른 프로젝트의 시험을 볼 수 있도록 라우팅 변경
  // 예: /trainer/project/:projectId/test/:testId
  // 현재는 `currentQuestionId`를 변경하는 로직이 없으므로,
  // 프로젝트 변경 시 시험 목록 자체를 변경하는 로직이 필요할 수 있습니다.
  router.push({
    name: 'TrainerTestQuestion',
    params: { projectId: projectId, testId: route.params.testId },
  }) // 예시 라우트 이름
  // 또는 현재 페이지에서 프로젝트 데이터만 변경하여 UI를 업데이트할 수도 있습니다.
  fetchAssociatedProject(projectId)
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

const exitPage = () => {
  if (confirm('문제 목록 화면을 종료하시겠습니까?')) {
    console.log('문제 목록 화면 종료 (실제 앱에서는 이전 페이지로 이동)')
    router.go(-1)
  }
}
</script>

<style scoped>
/* 기존 스타일은 변경 없습니다. */
.trainer-test-question-content-wrapper {
  display: flex;
  flex: 1;
  gap: 25px;
  height: 100%;
  overflow: hidden; /* 전체 래퍼의 오버플로우는 숨김 */
}

.trainer-test-question-main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0;
  overflow: hidden; /* 내부 컨텐츠 잘림 방지를 위해 여기도 hidden */
  gap: 25px; /* top-nav와 question-solution-area 사이의 간격 */
  box-sizing: border-box;
  height: 100%;
  position: relative; /* 나가기 버튼 absolute 포지셔닝의 기준이 됨 */
}

.trainer-test-question-container-inner {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden; /* 내부 요소가 넘치지 않도록 hidden */
  padding-bottom: 20px; /* 나가기 버튼과의 최소한의 하단 패딩 유지 */
}

.top-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px; /* question-solution-area와의 간격 */
  flex-shrink: 0; /* 공간이 부족해도 축소되지 않도록 */
  height: 48px; /* 명확한 높이 설정 */
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

.question-solution-area {
  display: flex; /* 가로로 배치 */
  flex-direction: row; /* 가로 방향으로 정렬 */
  flex: 1; /* 남은 수직 공간을 모두 차지 */
  gap: 25px; /* 문제 영역과 풀이 영역 사이의 간격 */
  overflow: hidden; /* 개별 컴포넌트 내부에서 스크롤 처리하므로 여기는 hidden */
  min-height: 0; /* flex 아이템의 기본 min-height 충돌 방지 */
  height: calc(100% - 48px - 25px); /* top-nav 높이와 gap을 제외한 나머지 높이 */
}

.exit-button-container {
  position: absolute; /* 부모(trainer-test-question-main-content) 기준 위치 */
  bottom: 20px; /* 하단에서 20px 위로 */
  right: 0; /* 우측에 정렬 */
  text-align: right;
  flex-shrink: 0;
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
