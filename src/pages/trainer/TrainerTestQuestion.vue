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
            <!-- 상단 영역: 좌측 테스트명, 중앙 드롭다운, 우측 문제 번호들 -->
            <div class="top-header">
              <!-- 좌측: 테스트명 -->
              <div class="left-section">
                <h2 class="test-title" v-if="testInfo">{{ testInfo.name }}</h2>
              </div>

              <!-- 중앙: 출처 문서 드롭다운 -->
              <div class="center-section">
                <div class="source-dropdown-container">
                  <label for="source-select" class="dropdown-label">출처 문서:</label>
                  <select
                    id="source-select"
                    v-model="selectedSourceDocument"
                    @change="onSourceDocumentChange"
                    class="source-dropdown"
                  >
                    <option value="">전체 문서</option>
                    <option v-for="doc in uniqueDocuments" :key="doc.id" :value="doc.id">
                      {{ doc.name }}
                    </option>
                  </select>
                </div>
              </div>

              <!-- 우측: 문제 번호 네비게이션 -->
              <div class="question-numbers-container">
                <button
                  class="nav-arrow left-arrow"
                  @click="scrollQuestionNumbers('left')"
                  :disabled="!canScrollLeft"
                >
                  <svg-icon type="mdi" :path="mdiChevronLeft" class="arrow-icon" />
                </button>
                <div class="question-numbers-nav" ref="questionNumbersRef">
                  <button
                    v-for="question in filteredQuestions"
                    :key="question.id"
                    @click="goToQuestion(question.id)"
                    :class="['question-number-btn', { active: currentQuestionId === question.id }]"
                  >
                    {{ question.id }}
                  </button>
                </div>
                <button
                  class="nav-arrow right-arrow"
                  @click="scrollQuestionNumbers('right')"
                  :disabled="!canScrollRight"
                >
                  <svg-icon type="mdi" :path="mdiChevronRight" class="arrow-icon" />
                </button>
              </div>
            </div>

            <!-- 메인 컨텐츠 영역: 좌측 문제, 우측 풀이 -->
            <div class="question-solution-area" v-if="currentQuestion">
              <!-- 좌측: 문제 영역 -->
              <div class="question-area-wrapper">
                <!-- 문제 컨텐츠 -->
                <TrainerQuestionArea
                  :question="currentQuestion"
                  :difficulty-level="currentQuestion.difficulty_level"
                  :question-type="currentQuestion.type"
                  :correct-answer="currentQuestion.correctAnswer"
                  :question-id="currentQuestion.id"
                  :document-name="currentQuestion.documentName"
                  :question-tags="currentQuestion.tags"
                />
              </div>

              <!-- 우측: 풀이 영역 -->
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

            <!-- 나가기 버튼 -->
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
import { ref, computed, onMounted, nextTick } from 'vue'
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
const selectedSourceDocument = ref('')
const questionNumbersRef = ref(null)
const canScrollLeft = ref(false)
const canScrollRight = ref(false)
const testInfo = ref(null)

const associatedProject = ref(null)
const userProjects = ref([])

const currentQuestion = computed(() => {
  if (!currentQuestionId.value || allQuestions.value.length === 0) {
    return null
  }
  return allQuestions.value.find((q) => q.id === currentQuestionId.value)
})

// 고유한 문서 목록 계산
const uniqueDocuments = computed(() => {
  const documents = new Map()
  allQuestions.value.forEach((question) => {
    if (question.documentId && !documents.has(question.documentId)) {
      documents.set(question.documentId, {
        id: question.documentId,
        name: question.documentName || `문서 ${question.documentId}`,
      })
    }
  })
  return Array.from(documents.values())
})

// 선택된 문서에 따른 필터링된 문제 목록
const filteredQuestions = computed(() => {
  if (!selectedSourceDocument.value) {
    return allQuestions.value
  }
  return allQuestions.value.filter((q) => q.documentId === selectedSourceDocument.value)
})

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

    const resultData = response.data?.resultData
    if (resultData) {
      // 테스트 정보 저장
      testInfo.value = {
        testId: resultData.testId,
        name: resultData.name,
        limitedTime: resultData.limitedTime,
        createdAt: resultData.createdAt,
        passScore: resultData.passScore,
      }

      // 문제 데이터 처리
      const fetchedQuestions = resultData.questions
      if (Array.isArray(fetchedQuestions)) {
        allQuestions.value = fetchedQuestions.map((rawQ, index) => {
          const generatedId = `Q${(index + 1).toString().padStart(2, '0')}`
          return {
            id: generatedId,
            originalId: rawQ.id,
            type: rawQ.type,
            difficulty_level: rawQ.difficulty_level,
            questionText: rawQ.question,
            options: rawQ.options,
            correctAnswer: rawQ.answer,
            explanation: rawQ.explanation,
            gradingCriteria: rawQ.grading_criteria,
            documentId: rawQ.documentId,
            documentName: rawQ.documentName,
            keywords: rawQ.keywords,
            tags: rawQ.tags,
            generationType: rawQ.generationType,
          }
        })

        if (allQuestions.value.length > 0) {
          currentQuestionId.value = allQuestions.value[0].id
        } else {
          currentQuestionId.value = null
          console.log('테스트 내 문제가 없습니다.')
        }

        // 스크롤 상태 업데이트
        nextTick(() => {
          updateScrollState()
        })
      } else {
        console.warn('API 응답에 문제 배열이 없습니다.', fetchedQuestions)
        allQuestions.value = []
        currentQuestionId.value = null
      }
    } else {
      console.warn('API 응답에 resultData가 없습니다.', response.data)
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

const goToQuestion = (questionId) => {
  currentQuestionId.value = questionId
}

const onSourceDocumentChange = () => {
  // 선택된 문서가 변경되면 해당 문서의 첫 번째 문제로 이동
  if (filteredQuestions.value.length > 0) {
    currentQuestionId.value = filteredQuestions.value[0].id
  }
  // 스크롤 상태 업데이트
  nextTick(() => {
    updateScrollState()
  })
}

const scrollQuestionNumbers = (direction) => {
  const container = questionNumbersRef.value
  if (!container) return

  const scrollAmount = 200 // 스크롤할 픽셀 수
  if (direction === 'left') {
    container.scrollBy({ left: -scrollAmount, behavior: 'smooth' })
  } else {
    container.scrollBy({ left: scrollAmount, behavior: 'smooth' })
  }

  // 스크롤 후 상태 업데이트
  setTimeout(updateScrollState, 300)
}

const updateScrollState = () => {
  const container = questionNumbersRef.value
  if (!container) return

  canScrollLeft.value = container.scrollLeft > 0
  canScrollRight.value = container.scrollLeft < container.scrollWidth - container.clientWidth
}

const formatDifficulty = (level) => {
  const difficultyMap = {
    EASY: '쉬움',
    NORMAL: '보통',
    HARD: '어려움',
    1: '쉬움',
    2: '보통',
    3: '어려움',
    easy: '쉬움',
    medium: '보통',
    hard: '어려움',
  }
  return difficultyMap[level] || level
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
}

/* 상단 헤더: 테스트명, 중앙 드롭다운, 문제 번호들 */
.top-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-shrink: 0;
  min-height: 48px;
  gap: 20px;
}

.left-section {
  flex: 1;
  min-width: 0;
}

.center-section {
  flex-shrink: 0;
  display: flex;
  justify-content: center;
}

.test-title {
  font-size: 22px;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
  line-height: 1.3;
  word-break: break-word;
}

.source-dropdown-container {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.dropdown-label {
  font-weight: 600;
  color: #495057;
  font-size: 13px;
  white-space: nowrap;
}

.source-dropdown {
  padding: 6px 10px;
  border: 1px solid #ced4da;
  border-radius: 6px;
  background-color: white;
  font-size: 13px;
  color: #495057;
  cursor: pointer;
  transition:
    border-color 0.15s ease-in-out,
    box-shadow 0.15s ease-in-out;
  width: 150px;
}

.source-dropdown:focus {
  border-color: #80bdff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
  outline: 0;
}

/* 문제 번호 네비게이션 컨테이너 */
.question-numbers-container {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 30%;
  width: 35%;
  max-width: 40%;
  flex-shrink: 0;
}

.nav-arrow {
  background-color: white;
  border: 1px solid #ced4da;
  border-radius: 6px;
  padding: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.nav-arrow:hover:not(:disabled) {
  background-color: #f8f9fa;
  border-color: #adb5bd;
}

.nav-arrow:disabled {
  cursor: not-allowed;
  opacity: 0.4;
  background-color: #f8f9fa;
}

.arrow-icon {
  font-size: 16px;
  color: #495057;
}

.question-numbers-nav {
  display: flex;
  gap: 8px;
  overflow-x: hidden;
  padding: 4px;
  scroll-behavior: smooth;
  flex: 1;
}

.question-number-btn {
  background-color: white;
  border: 1px solid #ced4da;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 13px;
  font-weight: 500;
  color: #495057;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  min-width: 44px;
  text-align: center;
  flex-shrink: 0;
}

.question-number-btn:hover {
  background-color: #e9ecef;
  border-color: #adb5bd;
}

.question-number-btn.active {
  background-color: #007bff;
  border-color: #007bff;
  color: white;
  font-weight: 600;
}

/* 문제 영역 래퍼 */
.question-area-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.question-solution-area {
  display: flex;
  flex-direction: row;
  flex: 1;
  gap: 25px;
  overflow: hidden;
  min-height: 0;
}

.exit-button-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
  flex-shrink: 0;
}

.exit-button {
  background-color: #1e2251;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition:
    background-color 0.2s ease-in-out,
    transform 0.1s ease-in-out;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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
