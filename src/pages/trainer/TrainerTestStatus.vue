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

        <div class="top-section-grid">
          <AISummaryCard :ai-output-data="aiOutputData" @download="downloadAISummary" />

          <div class="right-column">
            <AverageScoreCard
              :average-score="averageScore"
              :passers-count="passersCount"
              :total-participants="totalParticipants"
              @download="downloadAverageScore"
            />

            <TagAnalysisCard
              :tag-radar-data="tagRadarData"
              :tag-accuracy-list="tagAccuracyList"
              @download="downloadTagAnalysis"
            />
          </div>
        </div>

        <ProblemAnalysisCard
          :problem-accuracies="trainerStatusData.problemAccuracies"
          :problem-details="trainerStatusData.problemDetails"
          @download="downloadProblemAnalysis"
        />

        <div class="bottom-section-grid">
          <ScoreDistributionCard
            :score-distribution="scoreDistribution"
            :score-distribution-chart-options="scoreDistributionChartOptions"
            :participants-list="participantsList"
            @download="downloadScoreDistribution"
          />
        </div>

        <CorrectnessTableCard
          :learner-correctness-data="learnerCorrectnessData"
          @download="downloadCorrectnessTable"
        />
      </div>
    </template>
  </MainLayout>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router' // useRoute 추가
import MainLayout from '@/components/layouts/MainLayout.vue'
import AISummaryCard from '@/components/trainer/feedback/AISummaryCard.vue'
import AverageScoreCard from '@/components/trainer/feedback/AverageScoreCard.vue'
import TagAnalysisCard from '@/components/trainer/feedback/TagAnalysisCard.vue'
import ProblemAnalysisCard from '@/components/trainer/feedback/ProblemAnalysisCard.vue'
import ScoreDistributionCard from '@/components/trainer/feedback/ScoreDistributionCard.vue'
import CorrectnessTableCard from '@/components/trainer/feedback/TraineeProblemCorrectnessTableCard.vue'
import axios from '@/config/axios' // axios import

const router = useRouter()
const route = useRoute() // useRoute 인스턴스 생성

const testId = ref(null) // testId를 저장할 ref

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

const downloadScoreDistribution = () => {
  console.log('점수 분포 PDF 다운로드')
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
  learnerCorrectnessData: [],
})

// API 연동 함수들
const fetchTrainerFeedback = async (id) => {
  try {
    const response = await axios.get(`/feedback/trainer-feedback`, { params: { testId: id } })
    aiOutputData.value = response.data // AI 요약 데이터 업데이트
  } catch (error) {
    console.error('트레이너 피드백을 불러오는 데 실패했습니다:', error)
  }
}

const fetchTestBasicStatistics = async (id) => {
  try {
    const response = await axios.get(`/feedback/test-basic-statistics`, { params: { testId: id } })
    const data = response.data
    trainerStatusData.value.totalParticipants = data.totalParticipants
    trainerStatusData.value.passers = data.passers
    trainerStatusData.value.averageScore = data.averageScore
    trainerStatusData.value.learnerScores = data.learnerScores // 점수 분포 데이터를 위해 추가
  } catch (error) {
    console.error('테스트 기본 통계를 불러오는 데 실패했습니다:', error)
  }
}

const fetchTagByTest = async (id) => {
  try {
    const response = await axios.get(`/feedback/tag-by-test`, { params: { testId: id } })
    trainerStatusData.value.tagAccuracies = response.data // 태그별 정답률 데이터 업데이트
  } catch (error) {
    console.error('태그별 정답률을 불러오는 데 실패했습니다:', error)
  }
}

const fetchAnswerMatrix = async (id) => {
  try {
    const response = await axios.get(`/feedback/answer-matrix`, { params: { testId: id } })
    trainerStatusData.value.learnerCorrectnessData = response.data // 정오표 데이터 업데이트
  } catch (error) {
    console.error('정오표 데이터를 불러오는 데 실패했습니다:', error)
  }
}

// 문항별 정답률 상위/하위 조회 (ProblemAnalysisCard에 필요)
const fetchProblemAccuraciesTop = async (id) => {
  try {
    const response = await axios.get(`/feedback/trainer-feedback/top`, { params: { testId: id } })
    // 문제 상세 정보에 정확도 데이터를 매핑합니다.
    trainerStatusData.value.problemAccuracies = response.data.map((item) => ({
      problemId: item.problemId,
      accuracy: item.accuracy,
    }))
    trainerStatusData.value.problemDetails = response.data.map((item) => ({
      id: item.problemId,
      type: item.type,
      accuracy: item.accuracy,
      average: item.average,
      myScore: item.myScore,
      difficulty: item.difficulty,
      questionText: item.questionText,
      correctAnswer: item.correctAnswer,
      explanation: item.explanation,
      tags: item.tags,
    }))
  } catch (error) {
    console.error('문항 정답률 상위 데이터를 불러오는 데 실패했습니다:', error)
  }
}

const fetchProblemAccuraciesBottom = async (id) => {
  try {
    const response = await axios.get(`/feedback/trainer-feedback/bottom`, {
      params: { testId: id },
    })
    // 문제 상세 정보에 정확도 데이터를 매핑합니다.
    // 기존 problemAccuracies에 하위 데이터를 추가하거나, 필요한 경우 별도 처리
    const bottomProblems = response.data.map((item) => ({
      problemId: item.problemId,
      accuracy: item.accuracy,
    }))
    trainerStatusData.value.problemAccuracies = [
      ...trainerStatusData.value.problemAccuracies,
      ...bottomProblems,
    ]
    const bottomProblemDetails = response.data.map((item) => ({
      id: item.problemId,
      type: item.type,
      accuracy: item.accuracy,
      average: item.average,
      myScore: item.myScore,
      difficulty: item.difficulty,
      questionText: item.questionText,
      correctAnswer: item.correctAnswer,
      explanation: item.explanation,
      tags: item.tags,
    }))
    trainerStatusData.value.problemDetails = [
      ...trainerStatusData.value.problemDetails,
      ...bottomProblemDetails,
    ]
  } catch (error) {
    console.error('문항 정답률 하위 데이터를 불러오는 데 실패했습니다:', error)
  }
}

const averageScore = computed(() => trainerStatusData.value.averageScore)
const passersCount = computed(() => trainerStatusData.value.passers)
const totalParticipants = computed(() => trainerStatusData.value.totalParticipants)

// Tag별 정답률 리스트 생성
const tagAccuracyList = computed(() => {
  const tagStats = []
  for (const tag in trainerStatusData.value.tagAccuracies) {
    const { correct, total } = trainerStatusData.value.tagAccuracies[tag]
    const rate = total > 0 ? (correct / total) * 100 : 0
    tagStats.push({ name: tag, rate: parseFloat(rate.toFixed(2)) })
  }
  return tagStats
})

// 레이더 차트 데이터
const tagRadarData = computed(() => {
  const tagStats = []
  for (const tag in trainerStatusData.value.tagAccuracies) {
    const { correct, total } = trainerStatusData.value.tagAccuracies[tag]
    const averageCorrectRate = total > 0 ? (correct / total) * 100 : 0
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

// 응시자 목록 (더미 데이터 생성 로직 유지, 실제 학습자명은 API에서 받아오면 변경)
const participantsList = computed(() => {
  const participants = []
  const names = [
    '김철수',
    '이영희',
    '박민수',
    '정수연',
    '최대현',
    '한지민',
    '강태욱',
    '윤서아',
    '임현우',
    '조미영',
  ]

  trainerStatusData.value.learnerScores.forEach((score, index) => {
    participants.push({
      name:
        names[index % names.length] +
        (Math.floor(index / names.length) > 0 ? Math.floor(index / names.length) + 1 : ''),
      score: score,
      pass: score >= 70,
    })
  })

  return participants.sort((a, b) => b.score - a.score)
})

const learnerCorrectnessData = computed(() => trainerStatusData.value.learnerCorrectnessData)

// 점수 분포 데이터
const scoreDistribution = computed(() => {
  const scores = trainerStatusData.value.learnerScores
  const bins = { '0-49': 0, '50-59': 0, '60-69': 0, '70-79': 0, '80-89': 0, '90-100': 0 }

  scores.forEach((score) => {
    if (score >= 0 && score <= 49) bins['0-49']++
    else if (score >= 50 && score <= 59) bins['50-59']++
    else if (score >= 60 && score <= 69) bins['60-69']++
    else if (score >= 70 && score <= 79) bins['70-79']++
    else if (score >= 80 && score <= 89) bins['80-89']++
    else if (score >= 90 && score <= 100) bins['90-100']++
  })

  return {
    labels: Object.keys(bins),
    datasets: [
      {
        label: '응시자 수',
        data: Object.values(bins),
        backgroundColor: 'rgba(30, 34, 81, 0.2)',
        borderColor: '#1e2251',
        fill: 'origin',
        tension: 0.4,
        pointBackgroundColor: '#1e2251',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#a2a6d4',
        pointHoverBorderColor: '#1e2251',
      },
    ],
  }
})

const scoreDistributionChartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: function (context) {
          const label = context.dataset.label || ''
          const rawValue = context.parsed.y
          const total = trainerStatusData.value.learnerScores.length
          const percentage = total ? ((rawValue / total) * 100).toFixed(1) : '0.0'
          return `${label}: ${rawValue}명 (${percentage}%)`
        },
      },
    },
  },
  scales: {
    x: {
      title: { display: true, text: '점수 구간', color: '#343a40' },
      grid: { display: false },
      ticks: { color: '#495057' },
    },
    y: {
      title: { display: true, text: '학습자 수', color: '#343a40' },
      beginAtZero: true,
      ticks: { color: '#495057', stepSize: 5 },
      grid: { color: 'rgba(0, 0, 0, 0.05)' },
    },
  },
}))

onMounted(async () => {
  console.log('TrainerTestStatus component mounted.')
  // URL에서 testId 추출
  testId.value = route.params.testId || 1 // 라우터 파라미터에서 testId를 가져옴, 없으면 기본값 1

  if (testId.value) {
    await fetchTrainerFeedback(testId.value)
    await fetchTestBasicStatistics(testId.value)
    await fetchTagByTest(testId.value)
    await fetchAnswerMatrix(testId.value)
    await fetchProblemAccuraciesTop(testId.value)
    await fetchProblemAccuraciesBottom(testId.value)
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

.bottom-section-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 25px;
  margin-bottom: 25px;
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
  .bottom-section-grid {
    grid-template-columns: 1fr;
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
