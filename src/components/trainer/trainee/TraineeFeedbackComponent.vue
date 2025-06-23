<template>
  <div class="feedback-component-wrapper">
    <div v-if="loadingFeedback" class="feedback-loading-container">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
      <p class="loading-text">피드백 데이터를 불러오는 중입니다...</p>
    </div>

    <div v-else class="feedback-dashboard-layout-inner">
      <div class="top-row-grid-inner">
        <section class="dashboard-card-inner summary-card-inner">
          <h2 class="card-title-inner">종합 평가</h2>
          <div class="summary-content-inner">
            <div class="pass-fail-indicator-inner">
              <p :class="['pass-fail-text-inner', feedbackData.isPassed ? 'pass' : 'fail']">
                {{ feedbackData.isPassed ? 'PASS' : 'FAIL' }}
              </p>
              <p class="congratulations-inner" v-if="feedbackData.isPassed">축하합니다!</p>
              <p class="encouragement-inner" v-else>아쉽네요.</p>
            </div>
            <div class="summary-details-inner">
              <p>
                총 정답률:
                <span class="detail-value-inner">{{ feedbackData.totalCorrectRate }}%</span>
              </p>
              <p>
                총 응시문제 수: <span class="detail-value-inner">{{ totalQuestions }}</span>
              </p>
              <p>
                맞은 문제 수: <span class="detail-value-inner">{{ correctQuestions }}</span>
              </p>
              <p>
                틀린 문제 수: <span class="detail-value-inner">{{ wrongQuestions }}</span>
              </p>
            </div>
          </div>
        </section>

        <section class="dashboard-card-inner document-accuracy-card-inner">
          <h2 class="card-title-inner">문서별 정답률</h2>
          <ul class="score-list-inner">
            <li
              v-for="(rate, doc) in feedbackData.documentAccuracy"
              :key="doc"
              class="score-item-inner"
            >
              <span class="item-label-inner">{{ doc }}</span>
              <div class="progress-info-inner">
                <span class="item-value-inner">{{ rate }}%</span>
                <div class="progress-bar-container-inner">
                  <div class="progress-bar-inner" :style="{ width: rate + '%' }"></div>
                </div>
              </div>
            </li>
          </ul>
        </section>

        <section class="dashboard-card-inner tag-capacity-card-inner">
          <h2 class="card-title-inner">항목별 평가</h2>
          <p class="chart-placeholder">레이더 차트 위치 (RadarChart 컴포넌트 필요)</p>
        </section>
      </div>

      <section class="dashboard-card-inner my-level-card-inner">
        <h2 class="card-title-inner">현재 나의 레벨</h2>
        <p class="chart-placeholder">라인/영역 차트 위치 (LineAreaChart 컴포넌트 필요)</p>
        <p class="rank-summary-inner">
          당신은 전체 응시자 중 <span class="highlight-rank-inner">{{ myRank }}등</span>이며, 상위
          <span class="highlight-percent-inner">{{ topPercentage }}%</span>에 해당합니다.
        </p>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
// import RadarChart from '@/components/trainee/feedback/RadarChart.vue'; // 필요시 주석 해제
// import LineAreaChart from '@/components/trainee/feedback/LineAreaChart.vue'; // 필요시 주석 해제

const props = defineProps({
  testId: {
    type: String,
    required: true,
  },
})

const myUserId = 'userB' // 현재 사용자 ID (예시)
const loadingFeedback = ref(true)

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

const fetchFeedbackData = async (id) => {
  loadingFeedback.value = true
  feedbackData.value = {
    // 데이터 초기화
    totalCorrectRate: 0,
    isPassed: false,
    documentAccuracy: {},
    tagAccuracy: {},
    totalQuestions: 0,
    correctQuestions: 0,
    wrongQuestions: 0,
  }
  allParticipantScores.value = []
  myRank.value = 0
  totalParticipants.value = 0

  try {
    await new Promise((resolve) => setTimeout(resolve, 700)) // 로딩 시뮬레이션

    // testId에 따른 Mock 데이터
    if (id === 'test-101') {
      feedbackData.value = {
        totalCorrectRate: 85,
        isPassed: true,
        documentAccuracy: {
          'Front-end Concepts': 90,
          'JavaScript Basics': 70,
          'Vue.js Framework': 85,
        },
        tagAccuracy: {
          추론력: 88,
          문제해결력: 80,
          이해력: 92,
          논리력: 75,
          분석력: 60,
        },
        totalQuestions: 20,
        correctQuestions: 17,
        wrongQuestions: 3,
      }
      allParticipantScores.value = [
        { userId: 'userA', score: 70 },
        { userId: 'userB', score: 85 },
        { userId: 'userC', score: 95 },
        { userId: 'userD', score: 60 },
        { userId: 'userE', score: 85 },
        { userId: 'userF', score: 90 },
      ]
    } else if (id === 'test-102') {
      feedbackData.value = {
        totalCorrectRate: 60,
        isPassed: false,
        documentAccuracy: {
          'Data Structures': 50,
          Algorithms: 70,
        },
        tagAccuracy: {
          추론력: 65,
          문제해결력: 55,
          이해력: 70,
          논리력: 60,
          분석력: 50,
        },
        totalQuestions: 15,
        correctQuestions: 9,
        wrongQuestions: 6,
      }
      allParticipantScores.value = [
        { userId: 'userA', score: 50 },
        { userId: 'userB', score: 60 },
        { userId: 'userC', score: 75 },
        { userId: 'userD', score: 40 },
        { userId: 'userE', score: 60 },
        { userId: 'userF', score: 65 },
      ]
    } else if (id === 'test-201') {
      feedbackData.value = {
        totalCorrectRate: 92,
        isPassed: true,
        documentAccuracy: {
          'SQL Basics': 95,
          'Database Design': 88,
        },
        tagAccuracy: {
          추론력: 90,
          문제해결력: 95,
          이해력: 92,
          논리력: 88,
          분석력: 90,
        },
        totalQuestions: 10,
        correctQuestions: 9,
        wrongQuestions: 1,
      }
      allParticipantScores.value = [
        { userId: 'userA', score: 80 },
        { userId: 'userB', score: 92 },
        { userId: 'userC', score: 98 },
        { userId: 'userD', score: 75 },
        { userId: 'userE', score: 92 },
        { userId: 'userF', score: 85 },
      ]
    } else if (id === 'test-301') {
      feedbackData.value = {
        totalCorrectRate: 45,
        isPassed: false,
        documentAccuracy: {
          '네트워크 기초 이론': 40,
          '프로토콜 이해': 50,
        },
        tagAccuracy: {
          추론력: 40,
          문제해결력: 45,
          이해력: 50,
          논리력: 40,
          분석력: 55,
        },
        totalQuestions: 12,
        correctQuestions: 5,
        wrongQuestions: 7,
      }
      allParticipantScores.value = [
        { userId: 'userA', score: 35 },
        { userId: 'userB', score: 45 },
        { userId: 'userC', score: 60 },
        { userId: 'userD', score: 30 },
        { userId: 'userE', score: 45 },
        { userId: 'userF', score: 50 },
      ]
    } else {
      feedbackData.value = {
        // 데이터 없음
        totalCorrectRate: 0,
        isPassed: false,
        documentAccuracy: {},
        tagAccuracy: {},
        totalQuestions: 0,
        correctQuestions: 0,
        wrongQuestions: 0,
      }
      allParticipantScores.value = []
    }

    calculateRank()
  } catch (error) {
    console.error(`피드백 데이터를 불러오는 데 실패했습니다 (Test ID: ${id}):`, error)
  } finally {
    loadingFeedback.value = false
  }
}

const calculateRank = () => {
  if (allParticipantScores.value.length === 0) {
    myRank.value = 0
    totalParticipants.value = 0
    return
  }

  const myScore = feedbackData.value.totalCorrectRate
  const sortedScores = [...allParticipantScores.value].sort((a, b) => b.score - a.score)

  totalParticipants.value = sortedScores.length

  let currentRank = 1
  let rankFound = false
  for (let i = 0; i < sortedScores.length; i++) {
    if (i > 0 && sortedScores[i].score < sortedScores[i - 1].score) {
      currentRank = i + 1
    }
    if (sortedScores[i].userId === myUserId && sortedScores[i].score === myScore) {
      myRank.value = currentRank
      rankFound = true
      break
    }
  }

  if (!rankFound) {
    // Fallback for cases where myUserId might not be in allParticipantScores
    const higherScoresCount = sortedScores.filter((p) => p.score > myScore).length
    myRank.value = higherScoresCount + 1
  }
}

// testId prop이 변경될 때마다 데이터 다시 불러오기
watch(
  () => props.testId,
  (newId) => {
    if (newId) {
      fetchFeedbackData(newId)
    }
  },
  { immediate: true },
) // 컴포넌트 마운트 시 즉시 호출
</script>

<style scoped>
/* MainLayout 관련 스타일 제거 (이 컴포넌트가 MainLayout에 종속되지 않도록) */
.feedback-component-wrapper {
  padding: 10px; /* 내부 컴포넌트로서의 패딩 조정 */
}

.feedback-loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  background-color: #fcfcfc;
  border-radius: 8px;
  padding: 20px;
}

.loading-text {
  margin-top: 15px;
  font-size: 1rem;
  color: #666;
}

.feedback-dashboard-layout-inner {
  display: grid;
  gap: 20px; /* 그리드 항목 간 간격 */
  /* grid-template-rows: auto auto; // 이 컴포넌트에서는 필요 없음 */
}

.top-row-grid-inner {
  display: grid;
  grid-template-columns: 1fr 1.5fr 1fr; /* 종합: 문서: 항목 = 1:1.5:1 비율 */
  gap: 20px;
}

.dashboard-card-inner {
  background-color: #ffffff;
  border-radius: 8px; /* 부모 패널보다 작게 조정 */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05); /* 그림자 조정 */
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.card-title-inner {
  font-size: 1.2rem; /* 폰트 크기 조정 */
  font-weight: 600;
  color: #34495e;
  margin-bottom: 15px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e0e0e0;
  text-align: center;
}

/* 종합 평가 카드 */
.summary-card-inner {
  align-items: center;
  text-align: center;
}

.summary-content-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-grow: 1;
  width: 100%;
}

.pass-fail-indicator-inner {
  margin-bottom: 15px;
}

.pass-fail-text-inner {
  font-size: 3.5rem; /* 폰트 크기 조정 */
  font-weight: 800;
  line-height: 1;
  margin-bottom: 8px;
}

.pass-fail-text-inner.pass {
  color: #28a745;
}

.pass-fail-text-inner.fail {
  color: #dc3545;
}

.congratulations-inner,
.encouragement-inner {
  font-size: 0.9rem;
  color: #6c757d;
  font-weight: 500;
}

.summary-details-inner {
  font-size: 0.9rem;
  color: #495057;
  text-align: left;
  width: 100%;
  max-width: 160px; /* 너비 제한 조정 */
}

.summary-details-inner p {
  margin-bottom: 6px;
}

.summary-details-inner .detail-value-inner {
  font-weight: 600;
  color: #343a40;
  float: right;
}

/* 문서별 정답률 카드 */
.score-list-inner {
  list-style: none;
  padding: 0;
  margin: 0;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
}

.score-item-inner {
  display: flex;
  align-items: center;
  font-size: 0.9rem;
  color: #495057;
  flex-wrap: nowrap;
  margin-bottom: 5px; /* 각 항목 간 간격 */
}

.score-item-inner:last-child {
  margin-bottom: 0;
}

.score-item-inner .item-label-inner {
  font-weight: 600;
  flex-basis: 35%; /* 라벨 너비 조정 */
  min-width: 70px;
  text-align: left;
}

.score-item-inner .progress-info-inner {
  flex-grow: 1;
  display: flex;
  align-items: center;
  gap: 8px; /* 간격 조정 */
}

.score-item-inner .item-value-inner {
  font-weight: 700;
  color: #007bff;
  width: 45px; /* 값 너비 조정 */
  text-align: right;
  flex-shrink: 0;
}

.progress-bar-container-inner {
  flex-grow: 1;
  height: 6px; /* 높이 조정 */
  background-color: #e9ecef;
  border-radius: 3px;
  overflow: hidden;
}

.progress-bar-inner {
  height: 100%;
  background-color: #28a745;
  border-radius: 3px;
  transition: width 0.5s ease-in-out;
}

/* 차트 플레이스홀더 */
.chart-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 150px; /* 차트 영역 높이 */
  background-color: #f5f5f5;
  border-radius: 4px;
  color: #999;
  font-style: italic;
  text-align: center;
  flex-grow: 1;
}

/* 현재 나의 레벨 카드 */
.my-level-card-inner {
  grid-column: 1 / -1;
  padding-bottom: 25px; /* 아래쪽 여백 추가 */
}

.my-level-card-inner .rank-summary-inner {
  font-size: 1rem;
  color: #495057;
  margin-top: 20px;
  text-align: center;
  font-weight: 500;
}

.my-level-card-inner .highlight-rank-inner {
  font-weight: 700;
  color: #dc3545;
}
.my-level-card-inner .highlight-percent-inner {
  font-weight: 700;
  color: #007bff;
}

/* 반응형 디자인 */
@media (max-width: 1024px) {
  .top-row-grid-inner {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .feedback-component-wrapper {
    padding: 5px;
  }
  .dashboard-card-inner {
    padding: 15px;
  }
  .card-title-inner {
    font-size: 1.1rem;
    margin-bottom: 10px;
  }
  .pass-fail-text-inner {
    font-size: 2.8rem;
  }
  .summary-details-inner {
    font-size: 0.85rem;
  }
  .score-item-inner {
    font-size: 0.85rem;
  }
  .score-item-inner .item-label-inner {
    min-width: 80px;
  }
  .score-item-inner .item-value-inner {
    width: 40px;
  }
  .my-level-card-inner .rank-summary-inner {
    font-size: 0.95rem;
    margin-top: 15px;
  }
}
</style>
