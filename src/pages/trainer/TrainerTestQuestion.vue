<template>
  <MainLayout :show-sidebar="true" sidebar-type="project" :project="associatedProject">
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
              <p v-if="!currentQuestion && allQuestions.length === 0 && !isLoading">
                테스트 내 문제가 없습니다.
              </p>
              <p v-else>문제를 로딩 중입니다...</p>
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
import axios from '@/config/axios'

const router = useRouter()
const route = useRoute()

const allQuestions = ref([])
const currentQuestionId = ref(null)
const isLoading = ref(true)

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
  const testId = route.params.testId
  if (testId) {
    fetchTestQuestions(testId)
  } else {
    console.warn('라우트 파라미터에 testId가 없습니다.')
    isLoading.value = false
  }

  let resolvedProjectId = route.params.projectId
  if (!resolvedProjectId) {
    resolvedProjectId = localStorage.getItem('projectId')
  }

  // resolvedProjectId를 숫자로 변환
  if (resolvedProjectId) {
    resolvedProjectId = parseInt(resolvedProjectId, 10)
    if (isNaN(resolvedProjectId)) {
      console.error(
        'Resolved projectId가 유효한 숫자가 아닙니다:',
        route.params.projectId || localStorage.getItem('projectId'),
      )
      resolvedProjectId = null
    } else {
      console.log('최종 resolvedProjectId (숫자):', resolvedProjectId)
      localStorage.setItem('projectId', resolvedProjectId.toString()) // localStorage에는 문자열로 저장
    }
  } else {
    console.warn('라우트 파라미터와 Local Storage에 projectId가 없습니다.')
  }

  if (resolvedProjectId) {
    fetchAssociatedProject(resolvedProjectId)
    fetchUserProjects()
  } else {
    console.warn('프로젝트 ID를 찾을 수 없어 관련 프로젝트 정보를 로드하지 않습니다.')
    fetchUserProjects()
  }
})

const fetchTestQuestions = async (testId) => {
  isLoading.value = true
  try {
    const response = await axios.get('/test/getTest', {
      params: {
        testId: testId,
        lang: 'ko',
      },
    })

    const fetchedData = response.data.questions
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
      } else {
        currentQuestionId.value = null
        console.log('테스트 내 문제가 없습니다.')
      }
    } else {
      console.warn('API 응답이 예상된 문제 배열 형태가 아닙니다.', fetchedData)
      allQuestions.value = []
      currentQuestionId.value = null
    }
  } catch (error) {
    console.error('테스트 문제를 로드하는 데 실패했습니다:', error)
    alert('테스트 데이터를 불러오는 데 실패했습니다. 콘솔을 확인해주세요.')
    allQuestions.value = []
    currentQuestionId.value = null
  } finally {
    isLoading.value = false
  }
}

const fetchAssociatedProject = async (projectId) => {
  try {
    const response = await axios.get('/project/getProject', {
      params: {
        projectId: projectId,
      },
    })
    if (response.data?.statusCode === 'OK' && response.data?.resultData) {
      associatedProject.value = {
        id: parseInt(response.data.resultData.projectId, 10), // 숫자로 변환
        projectName: response.data.resultData.projectName,
      }
      console.log('연결된 프로젝트 정보:', associatedProject.value)
    } else {
      console.error('API 응답에 오류가 있거나 resultData가 없습니다.', response.data)
      associatedProject.value = {
        id: parseInt(projectId, 10),
        projectName: `프로젝트 ${projectId}`,
      } // 에러 발생 시에도 숫자로 변환
    }
  } catch (error) {
    console.error('연결된 프로젝트 정보를 불러오는 데 실패했습니다:', error)
    associatedProject.value = { id: parseInt(projectId, 10), projectName: `프로젝트 ${projectId}` } // 에러 발생 시에도 숫자로 변환
  }
}

const fetchUserProjects = async () => {
  try {
    const userId = localStorage.getItem('userId')
    if (!userId) {
      console.error('사용자 ID를 찾을 수 없어 사용자 프로젝트 목록을 로드할 수 없습니다.')
      userProjects.value = []
      return
    }

    const response = await axios.get('/project/getUserProjectList', {
      params: {
        userId: parseInt(userId),
      },
    })

    const fetchedProjectData = response.data?.resultData?.projects
    if (Array.isArray(fetchedProjectData)) {
      userProjects.value = fetchedProjectData.map((project) => ({
        id: parseInt(project.projectId, 10), // 숫자로 변환
        name: project.projectName,
        description: project.projectDescription,
        startDate: project.createdAt?.slice(0, 10) || '',
      }))
    } else {
      console.warn('API 응답이 예상된 프로젝트 배열 형태가 아닙니다.', fetchedProjectData)
      userProjects.value = []
    }
    console.log('사용자 프로젝트 목록:', userProjects.value)
  } catch (error) {
    console.error('사용자 프로젝트 목록을 불러오는 데 실패했습니다:', error)
    userProjects.value = []
  }
}

const handleProjectSelectFromSidebar = (projectId) => {
  console.log(`사이드바에서 프로젝트 ID ${projectId} 선택됨`)
  localStorage.setItem('projectId', projectId.toString()) // localStorage에는 문자열로 저장
  router.push({
    name: 'TrainerTestQuestion',
    params: { projectId: projectId, testId: route.params.testId },
  })
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
  console.log('문제 목록 화면 종료 (이전 페이지로 이동)')
  router.go(-1)
}
</script>

<style scoped>
/* 기존 스타일 유지 */
.trainer-test-question-content-wrapper {
  display: flex;
  flex: 1;
  gap: 25px;
  height: 100%;
  overflow: hidden;
}

.trainer-test-question-main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0;
  overflow: hidden;
  gap: 25px;
  box-sizing: border-box;
  height: 100%;
  position: relative;
}

.trainer-test-question-container-inner {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
  padding-bottom: 20px;
}

.top-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  flex-shrink: 0;
  height: 48px;
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
  display: flex;
  flex-direction: row;
  flex: 1;
  gap: 25px;
  overflow: hidden;
  min-height: 0;
  height: calc(100% - 48px - 25px);
}

.exit-button-container {
  position: absolute;
  bottom: 20px;
  right: 0;
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
