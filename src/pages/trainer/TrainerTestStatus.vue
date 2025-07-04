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
          <AISummaryCard
            v-if="hasAISummaryData"
            :ai-output-data="aiOutputData"
            @download="downloadAISummary"
          />
          <div v-else class="no-data-message">표시할 데이터가 없습니다</div>

          <div class="right-column">
            <AverageScoreCard
              v-if="hasAverageScoreData"
              :average-score="averageScore"
              :passers-count="passersCount"
              :total-participants="totalParticipants"
              @download="downloadAverageScore"
            />
            <div v-else class="no-data-message small-no-data-message">표시할 데이터가 없습니다</div>

            <TagAnalysisCard
              v-if="hasTagAnalysisData"
              :tag-radar-data="tagRadarData"
              :tag-accuracy-list="tagAccuracyList"
              @download="downloadTagAnalysis"
            />
            <div v-else class="no-data-message small-no-data-message">표시할 데이터가 없습니다</div>
          </div>
        </div>

        <ProblemAnalysisCard
          v-if="hasProblemAnalysisData"
          :problem-accuracies="trainerStatusData.problemAccuracies"
          :problem-details="trainerStatusData.problemDetails"
          @download="downloadProblemAnalysis"
        />
        <div v-else class="no-data-message">표시할 데이터가 없습니다</div>

        <CorrectnessTableCard
          v-if="hasCorrectnessTableData"
          :question-labels="questionLabels"
          :learner-correctness-data="learnerCorrectnessData"
          @download="downloadCorrectnessTable"
        />
        <div v-else class="no-data-message">표시할 데이터가 없습니다</div>
      </div>
    </template>
  </MainLayout>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import MainLayout from '@/components/layouts/MainLayout.vue'
import AISummaryCard from '@/components/trainer/feedback/AISummaryCard.vue'
import AverageScoreCard from '@/components/trainer/feedback/AverageScoreCard.vue'
import TagAnalysisCard from '@/components/trainer/feedback/TagAnalysisCard.vue'
import ProblemAnalysisCard from '@/components/trainer/feedback/ProblemAnalysisCard.vue'
// import ScoreDistributionCard from '@/components/trainer/feedback/ScoreDistributionCard.vue' // 주석처리
import CorrectnessTableCard from '@/components/trainer/feedback/TraineeProblemCorrectnessTableCard.vue'
import axios from '@/config/axios'

const router = useRouter()
const route = useRoute()

const testId = ref(null)
const problemSortOrder = ref('desc') // 문제 분석 카드 정렬 상태

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

// ScoreDistribution 관련 함수 주석처리
// const downloadScoreDistribution = () => {
//   console.log('점수 분포 PDF 다운로드')
// }

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
  learnerScores: [], // 더미 데이터 생성 로직 제거, 빈 배열 유지
  problemDetails: [], // 문제 상세 정보 리스트
})

const questionLabels = ref([]) // 문제 라벨 (문제1, 문제2 등)
const learnerCorrectnessData = ref([]) // 학습자별 정오표 데이터

// API 연동 함수들
const fetchTrainerFeedback = async (id) => {
  try {
    const response = await axios.post(`/feedback/trainer-feedback?testId=${id}`)
    // API 응답 구조에 맞게 resultData를 추출
    aiOutputData.value = response.data.resultData
  } catch (error) {
    console.error('트레이너 피드백을 불러오는 데 실패했습니다:', error)
    aiOutputData.value = {
      // 에러 발생 시 빈 데이터로 설정
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
    const apiTags = response.data.resultData // API 응답의 resultData 배열

    const allTags = ['이해력', '분석력', '문제해결력', '추론력', '논리력']
    const newTagAccuracies = {}

    allTags.forEach((tagName) => {
      const foundTag = apiTags.find((tag) => tag.tagName === tagName)
      newTagAccuracies[tagName] = foundTag ? foundTag.accuracyRate : 0 //
    })
    trainerStatusData.value.tagAccuracies = newTagAccuracies
  } catch (error) {
    console.error('태그별 정답률을 불러오는 데 실패했습니다:', error)
    trainerStatusData.value.tagAccuracies = {} // 에러 발생 시 빈 객체로 설정
  }
}

const fetchAnswerMatrix = async (id) => {
  try {
    const response = await axios.get(`/feedback/answer-matrix`, { params: { testId: id } })
    const resultData = response.data.resultData // resultData 접근
    questionLabels.value = resultData.questionLabels // questionLabels 저장

    // API 응답 구조에 맞춰 learnerCorrectnessData 변환
    learnerCorrectnessData.value = resultData.userAnswers.map((userAnswer) => {
      const data = { learner: userAnswer.userName || '이름 없음' } // userName 사용, null일 경우 '이름 없음'
      userAnswer.correctnessList.forEach((isCorrect, index) => {
        data[questionLabels.value[index]] = isCorrect ? 'O' : 'X' // 'O' 또는 'X'로 변환
      })
      return data
    })
  } catch (error) {
    console.error('정오표 데이터를 불러오는 데 실패했습니다:', error)
    questionLabels.value = []
    learnerCorrectnessData.value = [] // 에러 발생 시 빈 배열로 설정
  }
}

// 문항별 정답률 조회 (ProblemAnalysisCard에 필요)
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
      problemId: `문제 ${item.questionNumber}`, // 문제 번호를 사용하여 레이블 생성
      accuracy: item.correctRate,
    }))

    trainerStatusData.value.problemDetails = response.data.resultData.map((item) => ({
      id: item.questionNumber, // 문제 번호를 ID로 사용
      questionText: item.questionText,
      type: item.type,
      difficulty: item.difficulty,
      documentName: item.documentName, // 출처 문서 추가
      accuracy: item.correctRate,
      // myScore와 average는 이 API에서 제공되지 않으므로, 필요시 다른 API에서 가져와야 함
      average: null, // 더미 값
      myScore: null, // 더미 값
      correctAnswer: item.answer, // API의 'answer' 필드 사용
      explanation: '해설 준비 중', // API에 해설 필드가 없으므로 더미 값
      tags: item.tags,
    }))
  } catch (error) {
    console.error('문항 정답률 데이터를 불러오는 데 실패했습니다:', error)
    trainerStatusData.value.problemAccuracies = []
    trainerStatusData.value.problemDetails = [] // 에러 발생 시 빈 배열로 설정
  }
}

const averageScore = computed(() => trainerStatusData.value.averageScore)
const passersCount = computed(() => trainerStatusData.value.passers)
const totalParticipants = computed(() => trainerStatusData.value.totalParticipants)

// Tag별 정답률 리스트 생성
const tagAccuracyList = computed(() => {
  const tagStats = []
  // trainerStatusData.value.tagAccuracies는 이제 직접 태그 이름: 정확도 비율 형태이므로 수정
  for (const tag in trainerStatusData.value.tagAccuracies) {
    const rate = trainerStatusData.value.tagAccuracies[tag]
    tagStats.push({ name: tag, rate: parseFloat(rate.toFixed(1)) }) // 소수점 첫째 자리까지
  }
  return tagStats
})

// 레이더 차트 데이터
const tagRadarData = computed(() => {
  const tagStats = []
  // trainerStatusData.value.tagAccuracies는 이제 직접 태그 이름: 정확도 비율 형태이므로 수정
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

// 데이터 존재 여부 확인을 위한 computed 속성 추가
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

// ProblemAnalysisCard에서 정렬 순서 변경 시 호출될 함수
const handleProblemSortOrderChange = async (order) => {
  problemSortOrder.value = order
  if (testId.value) {
    await fetchProblemData(testId.value, problemSortOrder.value)
  }
}

onMounted(async () => {
  console.log('TrainerTestStatus component mounted.')
  testId.value = route.params.testId || 1

  if (testId.value) {
    await fetchTrainerFeedback(testId.value)
    await fetchTestBasicStatistics(testId.value)
    await fetchTagByTest(testId.value)
    await fetchAnswerMatrix(testId.value) // 정오표 데이터 호출
    await fetchProblemData(testId.value, problemSortOrder.value) // 초기 문항 데이터 로드 (기본은 desc)
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

/* ScoreDistribution 관련 스타일 주석처리 */
/*
.bottom-section-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 25px;
  margin-bottom: 25px;
}
*/

.no-data-message {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f8f9fa;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  padding: 25px;
  min-height: 200px; /* 기본 메시지 높이 */
  color: #6c757d;
  font-size: 18px;
  font-weight: 500;
  text-align: center;
  border: 1px dashed #e0e0e0;
  flex-grow: 1; /* 컨테이너 내에서 확장 */
}

.small-no-data-message {
  min-height: 150px; /* smaller height for cards in right column */
  font-size: 16px;
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
  /*
  .bottom-section-grid {
    grid-template-columns: 1fr;
  }
  */
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
