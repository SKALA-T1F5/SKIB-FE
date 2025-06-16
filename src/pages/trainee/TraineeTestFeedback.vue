<template>
  <div id="feedback-page-layout">
    <Header />
    <main class="feedback-main-content">
      <div class="feedback-dashboard-layout">
        <h1 class="dashboard-title">시험 피드백 결과</h1>

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
                <p>총 정답률: <span class="detail-value">{{ feedbackData.totalCorrectRate }}%</span></p>
                <p>총 응시문제 수: <span class="detail-value">{{ totalQuestions }}</span></p>
                <p>맞은 문제 수: <span class="detail-value">{{ correctQuestions }}</span></p>
                <p>틀린 문제 수: <span class="detail-value">{{ wrongQuestions }}</span></p>
              </div>
            </div>
          </section>

          <section class="dashboard-card document-accuracy-card">
            <h2 class="card-title">문서별 정답률</h2>
            <ul class="score-list">
              <li v-for="(rate, doc) in feedbackData.documentAccuracy" :key="doc" class="score-item">
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
              당신은 전체 응시자 중 <span class="highlight-rank">{{ myRank }}등</span>이며, 
              상위 <span class="highlight-percent">{{ topPercentage }}%</span>에 해당합니다.
            </p>
        </section>
      </div>
    </main>
    <Footer />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import Header from '@/components/layouts/Header.vue';
import Footer from '@/components/layouts/Footer.vue';
import RadarChart from '@/components/trainee/feedback/RadarChart.vue'; // 새로 생성한 RadarChart 컴포넌트 임포트
import LineAreaChart from '@/components/trainee/feedback/LineAreaChart.vue'; // 새로 생성한 LineAreaChart 컴포넌트 임포트
// import axios from 'axios'; // 실제 API 호출 시 주석 해제

const route = useRoute();
const testId = route.params.testId; // Removed 'as string'
const myUserId = 'userB'; // 현재 사용자 ID (예시, 나의 점수와 매칭될 수 있도록 'userB'로 설정)

// --- Mock Data (Spring Boot에서 받을 예정인 데이터) ---
// Interface definitions are removed in JavaScript
// interface FeedbackData {
//   totalCorrectRate: number; // 총 정답률
//   isPassed: boolean; // 합격 여부
//   documentAccuracy: { [key: string]: number }; // 문서별 정답률 (예: { "문서1": 80, "문서2": 90 })
//   tagAccuracy: { [key: string]: number }; // 태그별 정답률 (예: { "문해력": 75, "이해력": 88 })
//   totalQuestions: number; // 총 문제 수 (새로 추가)
//   correctQuestions: number; // 맞은 문제 수 (새로 추가)
//   wrongQuestions: number; // 틀린 문제 수 (새로 추가)
// }

const feedbackData = ref({ // Removed <FeedbackData> type annotation
  totalCorrectRate: 0,
  isPassed: false,
  documentAccuracy: {},
  tagAccuracy: {},
  totalQuestions: 0,
  correctQuestions: 0,
  wrongQuestions: 0,
});

// 전체 응시자 점수 (프론트엔드에서 나의 위치 계산용) - 백엔드에서 받을 예정
const allParticipantScores = ref([]); // Removed <Array<{ userId: string; score: number }>> type annotation

const myRank = ref(0);
const totalParticipants = ref(0);

// 총합 평가 상세를 위한 계산된 속성
const totalQuestions = computed(() => feedbackData.value.totalQuestions);
const correctQuestions = computed(() => feedbackData.value.correctQuestions);
const wrongQuestions = computed(() => feedbackData.value.wrongQuestions);


// 나의 상위 몇 %인지 계산 (0%가 최상위, 이미지처럼)
const topPercentage = computed(() => {
  if (totalParticipants.value <= 1) { // 참여자가 1명 이하면 상위 0%로 간주
    return 0.0;
  }
  // 등수가 1일 때 0%에 가깝게, 등수가 totalParticipants일 때 100%에 가깝게
  // (현재 등수 - 1) / (전체 인원 - 1) * 100 (상위 % = 낮을수록 좋음)
  const percentage = ((myRank.value - 1) / (totalParticipants.value - 1)) * 100;
  return parseFloat(percentage.toFixed(1));
});


// 가상의 API 호출 함수 (실제 Spring Boot API 호출로 대체 예정)
const fetchFeedbackData = async () => {
  try {
    // 실제 API 호출 시 주석 해제
    // const response = await axios.get(`/api/feedback/${testId}?userId=${myUserId}`);
    // feedbackData.value = response.data;

    // --- Mock Data Load (개발용) ---
    await new Promise(resolve => setTimeout(resolve, 500)); // 로딩 지연 시뮬레이션
    feedbackData.value = {
      totalCorrectRate: 85, // 나의 점수
      isPassed: true,
      documentAccuracy: {
        "Document1": 90,
        "Document2": 70,
        "Document3": 85,
        "Document4": 95,
        "Document5": 80, // 5개로 맞춤
      },
      tagAccuracy: {
        "추론력": 88,
        "문제해결력": 80,
        "이해력": 92,
        "논리력": 75,
        "분석력": 60,
      },
      totalQuestions: 20,
      correctQuestions: 17,
      wrongQuestions: 3,
    };

    // 모든 응시자 점수도 백엔드에서 가져온다고 가정
    allParticipantScores.value = [
      { userId: 'userA', score: 70 },
      { userId: 'userB', score: 85 }, // 나의 점수
      { userId: 'userC', score: 95 },
      { userId: 'userD', score: 60 },
      { userId: 'userE', score: 85 },
      { userId: 'userF', score: 90 },
      { userId: 'userG', score: 78 },
      { userId: 'userH', score: 85 },
      { userId: 'userI', score: 65 },
      { userId: 'userJ', score: 99 },
      { userId: 'userK', score: 72 },
      { userId: 'userL', score: 81 },
      { userId: 'userM', score: 55 },
      { userId: 'userN', score: 88 },
      { userId: 'userO', score: 79 },
    ];

    calculateRank();

  } catch (error) {
    console.error('피드백 데이터를 불러오는 데 실패했습니다:', error);
    alert('피드백 데이터를 불러오는 중 오류가 발생했습니다. 다시 시도해주세요.');
  }
};

const calculateRank = () => {
  if (allParticipantScores.value.length === 0) {
    myRank.value = 0;
    totalParticipants.value = 0;
    return;
  }

  const myScore = feedbackData.value.totalCorrectRate;

  // 점수가 높은 순서로 정렬
  const sortedScores = allParticipantScores.value
    .map(p => p.score)
    .sort((a, b) => b - a); // 내림차순 정렬

  totalParticipants.value = sortedScores.length;

  let currentRank = 1;
  let prevScore = sortedScores[0];
  let rankSet = false;

  for (let i = 0; i < sortedScores.length; i++) {
    if (sortedScores[i] < prevScore) {
      currentRank = i + 1; // 점수가 바뀌면 등수 업데이트
    }
    if (allParticipantScores.value.some(p => p.userId === myUserId && p.score === sortedScores[i]) && !rankSet) {
      myRank.value = currentRank;
      rankSet = true;
    }
    prevScore = sortedScores[i];
  }

  if (!rankSet && myScore !== undefined) {
      const higherScoresCount = sortedScores.filter(score => score > myScore).length;
      myRank.value = higherScoresCount + 1;
  }
};


onMounted(() => {
  fetchFeedbackData();
});
</script>

<style scoped>
#feedback-page-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f0f2f5;
  font-family: 'Noto Sans KR', sans-serif;
}

.feedback-main-content {
  flex-grow: 1;
  padding: 30px;
  max-width: 1200px; /* 전체 최대 너비 */
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
  /* border-bottom: 3px solid #e0e0e0; 제거하여 너무 무겁지 않게 */
}

/* 새로운 대시보드 레이아웃 그리드 */
.feedback-dashboard-layout {
  display: grid;
  gap: 25px; /* 그리드 항목 간 간격 */
  grid-template-rows: auto auto; /* 2개의 행, 첫 행은 콘텐츠에 따라, 둘째 행은 남은 공간 채움 */
}

/* 상단 그리드 (종합 평가, 문서별, 항목별) */
.top-row-grid {
  display: grid;
  grid-template-columns: 1fr 1.5fr 1fr; /* 종합: 문서: 항목 = 1:1.5:1 비율 */
  gap: 25px;
}

/* 대시보드 카드 공통 스타일 */
.dashboard-card {
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  padding: 25px; /* 내부 패딩 */
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
  flex-grow: 1; /* 남은 공간 채우기 */
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
  color: #28a745; /* 초록색 */
}

.pass-fail-text.fail {
  color: #dc3545; /* 빨간색 */
}

.congratulations, .encouragement {
  font-size: 16px;
  color: #6c757d;
  font-weight: 500;
}

.summary-details {
  font-size: 15px;
  color: #495057;
  text-align: left;
  width: 100%;
  max-width: 180px; /* 상세 정보 너비 제한 */
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
  float: right; /* 값을 오른쪽에 정렬 */
}

/* 2. 문서별 정답률 카드 */
.document-accuracy-card {
  /* flex-direction: column; 이미 .dashboard-card에 정의됨 */
  justify-content: center; /* 내용 수직 중앙 정렬 */
}

.score-list {
  list-style: none;
  padding: 0;
  margin: 0;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-around; /* 항목들을 균등하게 분배 */
}

.score-item {
  display: flex;
  align-items: center;
  margin-bottom: 0; /* flex-grow로 간격 조절 */
  font-size: 15px;
  color: #495057;
  flex-wrap: nowrap; /* 줄바꿈 방지 */
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
  flex-shrink: 0; /* 축소 방지 */
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
  /* flex-direction: column; 이미 .dashboard-card에 정의됨 */
  justify-content: center; /* 차트를 수직 중앙 정렬 */
}


/* 4. 현재 나의 레벨 카드 (Line Area Chart) */
.my-level-card {
  /* 상단 그리드 아래에 전체 너비로 배치 */
  grid-column: 1 / -1; /* 그리드 전체 너비 사용 */
  padding-bottom: 40px; /* 아래쪽 여백 추가 */
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
    grid-template-columns: 1fr; /* 태블릿에서는 한 줄에 하나씩 */
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
    max-width: none; /* 모바일에서 너비 제한 해제 */
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
</style>