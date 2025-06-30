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
import TrainerSideBar from '@/components/trainer/TrainerSideBar.vue'
import TrainerQuestionArea from '@/components/trainer/question/TrainerQuestionArea.vue'
import TrainerSolutionArea from '@/components/trainer/question/TrainerSolutionArea.vue'
import SvgIcon from '@jamescoyle/vue-icon'
import { mdiChevronLeft, mdiChevronRight } from '@mdi/js'
import axios from '@/config/axios' // axios 임포트

const router = useRouter()
const route = useRoute()

const allQuestions = ref([])
const currentQuestionId = ref(null)

const associatedProject = ref(null)
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
  // 라우트에서 testId를 가져옴
  const testId = route.params.testId
  if (testId) {
    fetchTestQuestions(testId)
  } else {
    console.warn('라우트 파라미터에 testId가 없습니다.')
    // testId가 없을 경우, 적절한 처리 (예: 문제 로딩 실패 메시지 표시, 이전 페이지로 리다이렉트)
  }

  const projectIdFromRoute = route.params.projectId
  if (projectIdFromRoute) {
    fetchAssociatedProject(projectIdFromRoute)
    fetchUserProjects()
  } else {
    console.warn('라우트 파라미터에 projectId가 없습니다. 기본 프로젝트를 로드합니다.')
    fetchUserProjects()
  }
})

// fetchTestQuestions 함수를 API 호출에 맞게 수정
const fetchTestQuestions = async (testId) => {
  try {
    // API 호출
    const response = await axios.get('/test/getTest', {
      params: {
        testId: testId,
        lang: 'ko', // 기본값 'ko'
      },
    })

    const fetchedData = response.data.questions // API 응답 구조에 따라 'questions' 키 사용
    if (Array.isArray(fetchedData)) {
      allQuestions.value = fetchedData.map((rawQ, index) => {
        const generatedId = `Q${(index + 1).toString().padStart(2, '0')}`
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
        }
      })

      if (allQuestions.value.length > 0) {
        currentQuestionId.value = allQuestions.value[0].id
      }
    } else {
      console.warn('API 응답이 예상된 문제 배열 형태가 아닙니다.', fetchedData)
      allQuestions.value = []
    }
  } catch (error) {
    console.error('테스트 문제를 로드하는 데 실패했습니다:', error)
    alert('테스트 데이터를 불러오는 데 실패했습니다. 콘솔을 확인해주세요.')
    allQuestions.value = [] // 에러 발생 시 문제 목록 초기화
  }
}

const fetchAssociatedProject = async (projectId) => {
  // 실제 API 호출 로직을 여기에 구현합니다.
  // 예: const response = await axios.get(`/api/projects/${projectId}`);
  // const projectData = response.data;

  // 임시 데이터 (실제 프로젝트 정보라고 가정)
  const sampleProjectData = {
    id: parseInt(projectId),
    projectName: `데모 프로젝트 ${projectId}: 신입 역량 평가`,
    description: '신입 트레이니의 기본 역량 평가를 위한 프로젝트입니다.',
  }
  associatedProject.value = sampleProjectData
  console.log('연결된 프로젝트 정보:', associatedProject.value)
}

const fetchUserProjects = async () => {
  // 실제 API 호출 로직을 여기에 구현합니다.
  // 예: const response = await axios.get('/api/users/current/projects');
  // userProjects.value = response.data;

  // 임시 데이터
  const dummyProjects = [
    { id: 1, name: '프로젝트 A: AI 기반 추천 시스템' },
    { id: 2, name: '프로젝트 B: 웹 서비스 성능 개선' },
    { id: 3, name: '프로젝트 C: 모바일 앱 UI/UX 리뉴얼' },
    { id: 123, name: '데모 프로젝트: 신입 역량 평가' },
  ]
  userProjects.value = dummyProjects
  console.log('사용자 프로젝트 목록:', userProjects.value)
}

const handleProjectSelectFromSidebar = (projectId) => {
  console.log(`사이드바에서 프로젝트 ID ${projectId} 선택됨`)
  router.push({
    name: 'TrainerTestQuestion',
    params: { projectId: projectId, testId: route.params.testId },
  })
  fetchAssociatedProject(projectId)
  // 프로젝트가 변경되면 해당 프로젝트의 testId를 사용하여 fetchTestQuestions를 다시 호출해야 할 수도 있습니다.
  // 현재 코드에서는 testId가 route.params에서 한 번만 가져오므로, 필요하다면 이 부분을 수정해야 합니다.
  // 예를 들어, 새로운 testId를 가져오는 로직을 추가하거나, 프로젝트 변경 시 라우트 이동을 통해 페이지를 다시 로드하게 할 수 있습니다.
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
