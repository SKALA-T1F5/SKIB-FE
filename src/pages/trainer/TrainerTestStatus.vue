<template>
  <MainLayout :show-sidebar="false">
    <template #content>
      <div class="trainer-status-main-content">
        <div class="page-header">
          <h1 class="dashboard-title">테스트 응시 현황</h1>
          <div class="header-right">
            <button @click="downloadAll" class="download-all-button">
              <v-icon>mdi-download</v-icon>
            </button>
            <button @click="goBack" class="back-button">
              <v-icon>mdi-arrow-left</v-icon>
              <span>이전</span>
            </button>
          </div>
        </div>
        <p class="dashboard-subtitle">
          응시자들의 응시 현황을 파악하고, AI가 테스트 관리에 도움을 드립니다.
        </p>

        <div v-if="isLoading" class="loading-container">
          <img src="@/assets/ai-loading.gif" alt="AI Loading" class="ai-loading-gif" />
          <p class="loading-message">AI가 리포트를 작성 중입니다...</p>
        </div>

        <div v-else>
          <div class="top-section-grid">
            <AISummaryCard v-if="hasAISummaryData" :ai-output-data="aiOutputData" @download="downloadAISummary" />
            <div class="right-column">
              <AverageScoreCard
                v-if="hasAverageScoreData"
                :average-score="averageScore"
                :passers-count="passersCount"
                :total-participants="totalParticipants"
                @download="downloadAverageScore"
              />
              <TagAnalysisCard
                v-if="hasTagAnalysisData"
                :tag-radar-data="tagRadarData"
                :tag-accuracy-list="tagAccuracyList"
                @download="downloadTagAnalysis"
              />
              </div>
          </div>

          <ProblemAnalysisCard
            v-if="hasProblemAnalysisData"
            :problem-accuracies="trainerStatusData.problemAccuracies"
            :problem-details="trainerStatusData.problemDetails"
            @download="downloadProblemAnalysis"
          />
          <CorrectnessTableCard
            v-if="hasCorrectnessTableData"
            :question-labels="questionLabels"
            :learner-correctness-data="learnerCorrectnessData"
            @download="downloadCorrectnessTable"
          />
          </div>
      </div>
    </template>
  </MainLayout>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import MainLayout from '@/components/layouts/MainLayout.vue'
import AISummaryCard from '@/components/trainer/feedback/AISummaryCard.vue'
import AverageScoreCard from '@/components/trainer/feedback/AverageScoreCard.vue'
import TagAnalysisCard from '@/components/trainer/feedback/TagAnalysisCard.vue'
import ProblemAnalysisCard from '@/components/trainer/feedback/ProblemAnalysisCard.vue'
import CorrectnessTableCard from '@/components/trainer/feedback/TraineeProblemCorrectnessTableCard.vue'
import axios from '@/config/axios'

const router = useRouter()
const route = useRoute()

const testId = ref(null)
const problemSortOrder = ref('desc') // 문제 분석 카드 정렬 상태
const isLoading = ref(true) // 로딩 상태를 관리하는 변수 추가

const goBack = () => {
  router.back()
}

// 다운로드 함수들 (기존 로직 유지)
const downloadAll = () => {
  console.log('전체 다운로드 실행')
}

const downloadAISummary = () => {
  console.log('AI 요약 PDF 다운로드')
}

const downloadAverageScore = () => {
  console.log('평균 점수 PDF 다운로드')
}

const downloadTagAnalysis = () => {
  console.log('Tag 분석 PDF 다운로드')
}

const downloadProblemAnalysis = () => {
  console.log('문항별 분석 PDF 다운로드')
}

const downloadCorrectnessTable = () => {
  console.log('정오표 PDF 다운로드')
}

// API 응답을 저장할 ref 변수들 초기화
const aiOutputData = ref({
  examGoal: '',
  performanceByDocument: [],
  insights: [],
  improvementPoints: '',
  suggestedTopics: [],
  overallEvaluation: '',
  projectReadiness: '',
})

const trainerStatusData = ref({
  totalParticipants: 0,
  passers: 0,
  averageScore: 0,
  problemAccuracies: [],
  tagAccuracies: {},
  learnerScores: [],
  problemDetails: [],
})

const questionLabels = ref([]) // 문제 라벨 (문제1, 문제2 등)
const learnerCorrectnessData = ref([]) // 학습자별 정오표 데이터

// API 연동 함수들
const fetchTrainerFeedback = async (id) => {
  try {
    const response = await axios.post(`/feedback/trainer-feedback?testId=${id}`)
    aiOutputData.value = response.data.resultData
  } catch (error) {
    console.error('트레이너 피드백을 불러오는 데 실패했습니다:', error)
    aiOutputData.value = {
      examGoal: '',
      performanceByDocument: [],
      insights: [],
      improvementPoints: '',
      suggestedTopics: [],
      overallEvaluation: '',
      projectReadiness: '',
    }
  }
}

const fetchTestBasicStatistics = async (id) => {
  try {
    const response = await axios.get(`/feedback/test-basic-statistics`, { params: { testId: id } })
    const resultData = response.data.resultData
    trainerStatusData.value.averageScore = resultData.averageScore
    trainerStatusData.value.passers = resultData.passCount
    trainerStatusData.value.totalParticipants = resultData.totalTakers
  } catch (error) {
    console.error('테스트 기본 통계를 불러오는 데 실패했습니다:', error)
    trainerStatusData.value.averageScore = 0
    trainerStatusData.value.passers = 0
    trainerStatusData.value.totalParticipants = 0
  }
}

const fetchTagByTest = async (id) => {
  try {
    const response = await axios.get(`/feedback/tag-by-test`, { params: { testId: id } })
    const apiTags = response.data.resultData

    const allTags = ['이해력', '분석력', '문제해결력', '추론력', '논리력']
    const newTagAccuracies = {}

    allTags.forEach((tagName) => {
      const foundTag = apiTags.find((tag) => tag.tagName === tagName)
      newTagAccuracies[tagName] = foundTag ? foundTag.accuracyRate : 0
    })
    trainerStatusData.value.tagAccuracies = newTagAccuracies
  } catch (error) {
    console.error('태그별 정답률을 불러오는 데 실패했습니다:', error)
    trainerStatusData.value.tagAccuracies = {}
  }
}

const fetchAnswerMatrix = async (id) => {
  try {
    const response = await axios.get(`/feedback/answer-matrix`, { params: { testId: id } })
    const resultData = response.data.resultData
    questionLabels.value = resultData.questionLabels

    learnerCorrectnessData.value = resultData.userAnswers.map((userAnswer) => {
      const data = { learner: userAnswer.userName || '이름 없음' }
      userAnswer.correctnessList.forEach((isCorrect, index) => {
        data[questionLabels.value[index]] = isCorrect ? 'O' : 'X'
      })
      return data
    })
  } catch (error) {
    console.error('정오표 데이터를 불러오는 데 실패했습니다:', error)
    questionLabels.value = []
    learnerCorrectnessData.value = []
  }
}

const fetchProblemData = async (id, sortOrder) => {
  try {
    let url = ''
    if (sortOrder === 'desc') {
      url = `/feedback/trainer-feedback/top`
    } else {
      url = `/feedback/trainer-feedback/bottom`
    }

    const response = await axios.get(url, { params: { testId: id } })
    trainerStatusData.value.problemAccuracies = response.data.resultData.map((item) => ({
      problemId: `문제 ${item.questionNumber}`,
      accuracy: item.correctRate,
    }))

    trainerStatusData.value.problemDetails = response.data.resultData.map((item) => ({
      id: item.questionNumber,
      questionText: item.questionText,
      type: item.type,
      difficulty: item.difficulty,
      documentName: item.documentName,
      accuracy: item.correctRate,
      average: null,
      myScore: null,
      correctAnswer: item.answer,
      explanation: '해설 준비 중',
      tags: item.tags,
    }))
  } catch (error) {
    console.error('문항 정답률 데이터를 불러오는 데 실패했습니다:', error)
    trainerStatusData.value.problemAccuracies = []
    trainerStatusData.value.problemDetails = []
  }
}

const averageScore = computed(() => trainerStatusData.value.averageScore)
const passersCount = computed(() => trainerStatusData.value.passers)
const totalParticipants = computed(() => trainerStatusData.value.totalParticipants)

const tagAccuracyList = computed(() => {
  const tagStats = []
  for (const tag in trainerStatusData.value.tagAccuracies) {
    const rate = trainerStatusData.value.tagAccuracies[tag]
    tagStats.push({ name: tag, rate: parseFloat(rate.toFixed(1)) })
  }
  return tagStats
})

const tagRadarData = computed(() => {
  const tagStats = []
  for (const tag in trainerStatusData.value.tagAccuracies) {
    const averageCorrectRate = trainerStatusData.value.tagAccuracies[tag]
    tagStats.push({ label: tag, value: parseFloat(averageCorrectRate.toFixed(2)) })
  }

  return {
    labels: tagStats.map((stat) => stat.label),
    datasets: [
      {
        label: '정답률 (%)',
        data: tagStats.map((stat) => stat.value),
        backgroundColor: 'rgba(30, 34, 81, 0.2)',
        borderColor: '#1e2251',
        borderWidth: 2,
        pointBackgroundColor: '#1e2251',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
      },
    ],
  }
})

// 데이터 존재 여부 확인을 위한 computed 속성 (기존 로직 유지)
const hasAISummaryData = computed(
  () =>
    aiOutputData.value &&
    (aiOutputData.value.examGoal ||
      aiOutputData.value.performanceByDocument.length > 0 ||
      aiOutputData.value.insights.length > 0 ||
      aiOutputData.value.improvementPoints ||
      aiOutputData.value.suggestedTopics.length > 0 ||
      aiOutputData.value.overallEvaluation ||
      aiOutputData.value.projectReadiness),
)

const hasAverageScoreData = computed(() => trainerStatusData.value.totalParticipants > 0)

const hasTagAnalysisData = computed(
  () => Object.keys(trainerStatusData.value.tagAccuracies).length > 0,
)

const hasProblemAnalysisData = computed(() => trainerStatusData.value.problemAccuracies.length > 0)

const hasCorrectnessTableData = computed(() => learnerCorrectnessData.value.length > 0)

const handleProblemSortOrderChange = async (order) => {
  problemSortOrder.value = order
  if (testId.value) {
    isLoading.value = true // 정렬 변경 시에도 로딩 시작
    await fetchProblemData(testId.value, problemSortOrder.value)
    isLoading.value = false // 로딩 완료
  }
}

onMounted(async () => {
  console.log('TrainerTestStatus component mounted.')
  testId.value = route.params.testId || 1

  if (testId.value) {
    isLoading.value = true // 데이터 로딩 시작
    await Promise.all([
      fetchTrainerFeedback(testId.value),
      fetchTestBasicStatistics(testId.value),
      fetchTagByTest(testId.value),
      fetchAnswerMatrix(testId.value),
      fetchProblemData(testId.value, problemSortOrder.value),
    ])
    isLoading.value = false // 모든 데이터 로딩 완료
  }
})
</script>

<style scoped>
.trainer-status-main-content {
  flex-grow: 1;
  max-width: 1400px;
  margin: 0 auto;
  padding: 30px;
  width: 100%;
  box-sizing: border-box;
  overflow-x: hidden;
}

.page-header {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e0e0e0;
  position: relative;
}

.dashboard-title {
  font-size: 36px;
  font-weight: 700;
  color: #1e2251;
  margin: 0;
  text-align: center;
}

.header-right {
  position: absolute;
  right: 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.back-button,
.download-all-button {
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 18px;
  color: #1e2251;
  font-weight: 600;
  padding: 8px 12px;
  border-radius: 8px;
  transition: background-color 0.2s ease;
}

.back-button:hover,
.download-all-button:hover {
  background-color: #f0f2f5;
}

.back-button .v-icon,
.download-all-button .v-icon {
  font-size: 20px;
  color: #1e2251;
}

.dashboard-subtitle {
  font-size: 18px;
  color: #4a507f;
  text-align: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e0e0e0;
}

.top-section-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 25px;
  margin-bottom: 25px;
  min-height: 600px;
  align-items: start;
}

.right-column {
  display: flex;
  flex-direction: column;
  gap: 25px;
  height: 100%;
  min-width: 0;
}

/* 추가된 스타일 */
.right-column > :first-child {
  /* AverageScoreCard */
  flex: 1; /* 평균 점수 카드의 세로 크기를 줄임 */
  min-height: unset; /* 최소 높이 제한 해제 */
}

.right-column > :last-child {
  /* TagAnalysisCard */
  flex: 1.1; /* Tag 분석 카드의 세로 크기를 늘림 */
}

/* 로딩 스피너 및 메시지 스타일 */
.loading-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 400px; /* 로딩 스피너가 표시될 공간 확보 */
  background-color: #f8f9fa;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  padding: 25px;
  color: #1e2251;
  font-size: 20px;
  font-weight: 600;
  text-align: center;
  border: 1px dashed #e0e0e0;
}

.ai-loading-gif {
  width: 150px; /* gif 크기 조절 */
  height: 150px;
  margin-bottom: 20px;
}

.no-data-message {
  display: none; /* '표시할 데이터가 없습니다' 문구 숨김 */
}

@media (max-width: 1024px) {
  .trainer-status-main-content {
    padding: 20px;
  }
  .dashboard-title {
    font-size: 30px;
  }
  .dashboard-subtitle {
    font-size: 16px;
  }
  .top-section-grid {
    grid-template-columns: 1fr;
    min-height: auto;
  }
  .right-column {
    flex-direction: column;
  }
}

@media (max-width: 768px) {
  .trainer-status-main-content {
    padding: 15px;
  }
  .dashboard-title {
    font-size: 26px;
  }
  .dashboard-subtitle {
    font-size: 14px;
  }
  .page-header {
    flex-direction: column;
    align-items: center;
    gap: 15px;
  }
  .header-right {
    position: static;
    margin-top: 0;
  }
  .dashboard-title {
    text-align: center;
    margin: 0;
  }
  .top-section-grid {
    grid-template-columns: 1fr;
  }
}
</style>