<template>
  <MainLayout :show-sidebar="false">
    <template #content>
      <div class="feedback-main-content">
        <div class="feedback-dashboard-layout">
          <h1 class="dashboard-title">시험 피드백 결과</h1>

          <div v-if="isLoading" class="loading-indicator">데이터를 불러오는 중입니다...</div>
          <div v-else-if="fetchError" class="error-message">
            <p>피드백 데이터를 불러오는 데 실패했습니다. 잠시 후 다시 시도해주세요.</p>
            <p>오류: {{ fetchError.message }}</p>
          </div>
          <div v-else-if="!hasData" class="no-data-message">
            <p>표시할 피드백 데이터가 없습니다.</p>
          </div>
          <div v-else>
            <div class="top-row-grid">
              <section class="dashboard-card summary-card">
                <h2 class="card-title">종합 평가</h2>
                <div class="summary-content">
                  <div class="pass-fail-indicator">
                    <p :class="['pass-fail-text', feedbackData.isPassed ? 'pass' : 'fail']">
                      {{ feedbackData.isPassed ? 'PASS' : 'FAIL' }}
                    </p>
                    <p class="congratulations" v-if="feedbackData.isPassed">축하합니다!</p>
                    <p class="encouragement" v-else>아쉽네요.</p>
                  </div>
                  <div class="summary-details">
                    <p>
                      총 정답률:
                      <span class="detail-value">{{ feedbackData.totalCorrectRate }}%</span>
                    </p>
                    <p>
                      총 응시문제 수: <span class="detail-value">{{ totalQuestions }}</span>
                    </p>
                    <p>
                      맞은 문제 수: <span class="detail-value">{{ correctQuestions }}</span>
                    </p>
                    <p>
                      틀린 문제 수: <span class="detail-value">{{ wrongQuestions }}</span>
                    </p>
                  </div>
                </div>
              </section>

              <section class="dashboard-card document-accuracy-card">
                <h2 class="card-title">문서별 정답률</h2>
                <ul class="score-list">
                  <li
                    v-for="(rate, doc) in feedbackData.documentAccuracy"
                    :key="doc"
                    class="score-item"
                  >
                    <span class="item-label">{{ doc }}</span>
                    <div class="progress-info">
                      <span class="item-value">{{ rate }}%</span>
                      <div class="progress-bar-container">
                        <div class="progress-bar" :style="{ width: rate + '%' }"></div>
                      </div>
                    </div>
                  </li>
                </ul>
              </section>

              <section class="dashboard-card tag-capacity-card">
                <h2 class="card-title">항목별 평가</h2>
                <RadarChart :tag-accuracy="feedbackData.tagAccuracy" />
              </section>
            </div>

            <section class="dashboard-card my-level-card">
              <h2 class="card-title">현재 나의 레벨</h2>
              <LineAreaChart
                :my-score="feedbackData.totalCorrectRate"
                :all-participant-scores="allParticipantScores"
                :my-user-id="myUserId"
              />
              <p class="rank-summary">
                당신은 전체 응시자 중 <span class="highlight-rank">{{ myRank }}등</span>이며, 상위
                <span class="highlight-percent">{{ topPercentage }}%</span>에 해당합니다.
              </p>
            </section>
          </div>
        </div>
      </div>
    </template>
  </MainLayout>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import MainLayout from '@/components/layouts/MainLayout.vue'
import RadarChart from '@/components/trainee/feedback/RadarChart.vue'
import LineAreaChart from '@/components/trainee/feedback/LineAreaChart.vue'
import axios from '@/config/axios'

const route = useRoute()
const testId = route.params.testId
const myUserId = ref(localStorage.getItem('userId'))

// 로딩 상태 및 에러 메시지 관리를 위한 ref 추가
const isLoading = ref(true)
const fetchError = ref(null)
const hasData = computed(
  () =>
    feedbackData.value.totalCorrectRate > 0 ||
    Object.keys(feedbackData.value.documentAccuracy).length > 0,
)

const feedbackData = ref({
  totalCorrectRate: 0,
  isPassed: false,
  documentAccuracy: {},
  tagAccuracy: {},
  totalQuestions: 0,
  correctQuestions: 0,
  wrongQuestions: 0,
})

const allParticipantScores = ref([])

const myRank = ref(0)
const totalParticipants = ref(0)

const totalQuestions = computed(() => feedbackData.value.totalQuestions)
const correctQuestions = computed(() => feedbackData.value.correctQuestions)
const wrongQuestions = computed(() => feedbackData.value.wrongQuestions)

const topPercentage = computed(() => {
  if (totalParticipants.value <= 1) {
    return 0.0
  }
  const percentage = ((myRank.value - 1) / (totalParticipants.value - 1)) * 100
  return parseFloat(percentage.toFixed(1))
})

const fetchFeedbackData = async () => {
  isLoading.value = true // 데이터 로딩 시작
  fetchError.value = null // 이전 에러 초기화

  if (!myUserId.value) {
    console.error('User ID not found in Local Storage. Cannot fetch feedback data.')
    fetchError.value = new Error('사용자 정보를 찾을 수 없습니다. 다시 로그인해주세요.')
    isLoading.value = false
    return
  }

  try {
    // Promise.all을 사용하여 모든 API 요청을 동시에 보냅니다.
    // 이렇게 하면 모든 데이터가 준비될 때까지 기다릴 수 있으며, 효율적입니다.
    const [totalAccuracyResponse, tagAccuracyResponse, docAccuracyResponse, distributionResponse] =
      await Promise.all([
        axios.get(`/feedback/all`, { params: { userId: myUserId.value, testId: testId } }),
        axios.get(`/feedback/tag`, { params: { userId: myUserId.value, testId: testId } }),
        axios.get(`/feedback/docs`, { params: { userId: myUserId.value, testId: testId } }),
        axios.get(`/feedback/distribution`, {
          params: { userId: myUserId.value, testId: testId },
        }),
      ])

    // 1. 학습자별 총 정답률 조회
    feedbackData.value.totalCorrectRate = totalAccuracyResponse.data.totalCorrectRate || 0
    feedbackData.value.isPassed = totalAccuracyResponse.data.isPassed || false
    feedbackData.value.totalQuestions = totalAccuracyResponse.data.totalQuestions || 0
    feedbackData.value.correctQuestions = totalAccuracyResponse.data.correctQuestions || 0
    feedbackData.value.wrongQuestions = totalAccuracyResponse.data.wrongQuestions || 0

    // 2. 학습자별 태그별 정답률 조회
    feedbackData.value.tagAccuracy = tagAccuracyResponse.data.tagAccuracy || {}

    // 3. 학습자별 문서별 정답률 조회
    feedbackData.value.documentAccuracy = docAccuracyResponse.data.documentAccuracy || {}

    // 4. 학습자별 위치 조회 (+점수 분포)
    allParticipantScores.value = distributionResponse.data.allParticipantScores || []

    calculateRank()
  } catch (error) {
    console.error('피드백 데이터를 불러오는 데 실패했습니다:', error)
    fetchError.value = error // 에러 객체를 저장
  } finally {
    isLoading.value = false // 데이터 로딩 완료 (성공 또는 실패)
  }
}

const calculateRank = () => {
  if (allParticipantScores.value.length === 0) {
    myRank.value = 0
    totalParticipants.value = 0
    return
  }

  const myScore = feedbackData.value.totalCorrectRate

  const sortedScores = allParticipantScores.value.map((p) => p.score).sort((a, b) => b - a)

  totalParticipants.value = sortedScores.length

  let currentRank = 1
  let rankSet = false

  for (let i = 0; i < sortedScores.length; i++) {
    if (i > 0 && sortedScores[i] < sortedScores[i - 1]) {
      currentRank = i + 1
    }

    const myParticipant = allParticipantScores.value.find((p) => p.userId === myUserId.value)
    if (myParticipant && myParticipant.score === sortedScores[i] && !rankSet) {
      myRank.value = currentRank
      rankSet = true
    }
  }

  if (!rankSet && myScore !== undefined) {
    const higherScoresCount = sortedScores.filter((score) => score > myScore).length
    myRank.value = higherScoresCount + 1
  }
}

onMounted(() => {
  fetchFeedbackData()
})
</script>

<style scoped>
/* 기존 스타일은 변경 사항이 없으므로 그대로 유지합니다. */
.feedback-main-content {
  flex-grow: 1;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
}

.dashboard-title {
  font-size: 36px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 30px;
  text-align: center;
  padding-bottom: 20px;
}

.feedback-dashboard-layout {
  display: grid;
  gap: 25px;
  grid-template-rows: auto auto;
}

.top-row-grid {
  display: grid;
  grid-template-columns: 1fr 1.5fr 1fr;
  gap: 25px;
}

.dashboard-card {
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  padding: 25px;
  display: flex;
  flex-direction: column;
}

.card-title {
  font-size: 22px;
  font-weight: 600;
  color: #34495e;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e0e0e0;
  text-align: center;
}

/* 1. 종합 평가 카드 */
.summary-card {
  align-items: center;
  text-align: center;
}

.summary-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-grow: 1;
  width: 100%;
}

.pass-fail-indicator {
  margin-bottom: 20px;
}

.pass-fail-text {
  font-size: 52px;
  font-weight: 800;
  line-height: 1;
  margin-bottom: 10px;
}

.pass-fail-text.pass {
  color: #28a745;
}

.pass-fail-text.fail {
  color: #dc3545;
}

.congratulations,
.encouragement {
  font-size: 16px;
  color: #6c757d;
  font-weight: 500;
}

.summary-details {
  font-size: 15px;
  color: #495057;
  text-align: left;
  width: 100%;
  max-width: 180px;
}

.summary-details p {
  margin-bottom: 8px;
}

.summary-details p:last-child {
  margin-bottom: 0;
}

.summary-details .detail-value {
  font-weight: 600;
  color: #343a40;
  float: right;
}

/* 2. 문서별 정답률 카드 */
.document-accuracy-card {
  justify-content: center;
}

.score-list {
  list-style: none;
  padding: 0;
  margin: 0;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
}

.score-item {
  display: flex;
  align-items: center;
  margin-bottom: 0;
  font-size: 15px;
  color: #495057;
  flex-wrap: nowrap;
}

.score-item .item-label {
  font-weight: 600;
  flex-basis: 30%;
  min-width: 80px;
  text-align: left;
}

.score-item .progress-info {
  flex-grow: 1;
  display: flex;
  align-items: center;
  gap: 10px;
}

.score-item .item-value {
  font-weight: 700;
  color: #007bff;
  width: 50px;
  text-align: right;
  flex-shrink: 0;
}

.progress-bar-container {
  flex-grow: 1;
  height: 8px;
  background-color: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background-color: #28a745;
  border-radius: 4px;
  transition: width 0.5s ease-in-out;
}

/* 3. 문제 Tag별 역량 카드 (Radar Chart) */
.tag-capacity-card {
  justify-content: center;
}

/* 4. 현재 나의 레벨 카드 (Line Area Chart) */
.my-level-card {
  grid-column: 1 / -1;
  padding-bottom: 40px;
}

.my-level-card .rank-summary {
  font-size: 18px;
  color: #495057;
  margin-top: 25px;
  text-align: center;
  font-weight: 500;
}

.my-level-card .highlight-rank {
  font-weight: 700;
  color: #dc3545;
}
.my-level-card .highlight-percent {
  font-weight: 700;
  color: #007bff;
}

/* 반응형 디자인 */
@media (max-width: 1024px) {
  .top-row-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .feedback-main-content {
    padding: 20px;
  }
  .dashboard-title {
    font-size: 28px;
    margin-bottom: 25px;
  }
  .dashboard-card {
    padding: 20px;
  }
  .card-title {
    font-size: 20px;
    margin-bottom: 15px;
  }

  /* 종합 평가 */
  .pass-fail-text {
    font-size: 44px;
  }
  .summary-details {
    max-width: none;
  }

  /* 문서별 정답률 */
  .score-item {
    font-size: 14px;
  }
  .score-item .item-label {
    min-width: 100px;
  }
  .score-item .item-value {
    width: 40px;
  }
  .progress-bar-container {
    height: 6px;
  }

  /* 차트 높이 조정 */
  .tag-capacity-card .chart-container-wrapper {
    height: 250px;
  }
  .my-level-card .chart-container-wrapper {
    height: 220px;
  }
  .my-level-card .rank-summary {
    font-size: 16px;
    margin-top: 20px;
  }
}

/* 추가된 스타일 */
.loading-indicator,
.error-message,
.no-data-message {
  text-align: center;
  padding: 50px 20px;
  font-size: 18px;
  color: #555;
  background-color: #f8f8f8;
  border-radius: 12px;
  margin-top: 25px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.error-message {
  color: #dc3545;
  background-color: #ffebeb;
  border: 1px solid #dc3545;
}
</style>
