<template>
  <MainLayout :show-sidebar="false">
    <template #content>
      <div class="trainer-status-main-content">
        <h1 class="dashboard-title">테스트 응시 현황</h1>
        <p class="dashboard-subtitle">
          응시자들의 응시 현황을 파악하고, AI가 테스트 관리에 도움을 드립니다.
        </p>

        <div class="top-section-grid">
          <section class="dashboard-card ai-summary-card">
            <h2 class="card-title">AI 테스트 결과 요약</h2>
            <div class="ai-summary-content">
              <div class="ai-summary-item">
                <h3>Correct Answer Rate by Document with Comments</h3>
                <p>
                  문서별 정답률이 양호하며, 특히 '문서1'에서 높은 이해도를 보였습니다. (Good
                  performance, demonstrating strong understanding of 'Document 1')
                </p>
              </div>
              <div class="ai-summary-item">
                <h3>Strengths and Weaknesses according to your test performance</h3>
                <p>
                  문제 해결 능력과 논리적 추론 영역에서 강점을 보입니다. (Strong in problem-solving
                  and logical reasoning)
                </p>
              </div>
              <div class="ai-summary-item">
                <h3>Difficulty of problem solving show weakness</h3>
                <p>
                  난이도 높은 문제 풀이에서 약점을 보였습니다. (Weakness in difficult
                  problem-solving)
                </p>
              </div>
              <div class="ai-summary-item">
                <h3>주요 개선점</h3>
                <ul>
                  <li>새롭게 학습한 개념 공부 (오답 위주)를 통해 이해력을 높여보세요.</li>
                  <li>자세한 풀이 지침서를 참고해주세요. (LPI 모범 답안)</li>
                  <li>새로운 유형의 문제 풀이를 연습해보세요.</li>
                </ul>
              </div>
            </div>
          </section>

          <section class="dashboard-card average-score-card">
            <h2 class="card-title">평균 점수 및 합격자 수</h2>
            <div class="average-score-content">
              <div class="score-item">
                <span class="label">평균 점수</span>
                <span class="value">{{ averageScore }}점</span>
              </div>
              <div class="score-item">
                <span class="label">합격자 수</span>
                <span class="value">{{ passersCount }}명</span>
              </div>
              <div class="chart-container">
                <DoughnutChart :data="passRateData" />
              </div>
            </div>
          </section>
        </div>

        <div class="middle-section-grid">
          <section class="dashboard-card problem-accuracy-card">
            <h2 class="card-title">문항별 분석</h2>
            <div class="controls">
              <label for="sort-problem-accuracy">정렬:</label>
              <select id="sort-problem-accuracy" v-model="problemAccuracySortOrder">
                <option value="asc">정답률 낮은 순</option>
                <option value="desc">정답률 높은 순</option>
              </select>
            </div>
            <ProblemAccuracyBarChart :data="sortedProblemAccuracy" />
          </section>

          <section class="dashboard-card top-bottom-card">
            <h2 class="card-title">상위/하위</h2>
            <table class="problem-detail-table">
              <thead>
                <tr>
                  <th>문제</th>
                  <th>유형</th>
                  <th>정답률</th>
                  <th>평균</th>
                  <th>나의 점수</th>
                  <th>난이도</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="problem in problemDetails" :key="problem.id">
                  <td>{{ problem.id }}</td>
                  <td>{{ problem.type }}</td>
                  <td :class="{ 'low-accuracy': problem.accuracy < 50 }">
                    {{ problem.accuracy }}%
                  </td>
                  <td>{{ problem.average }}%</td>
                  <td>{{ problem.myScore }}점</td>
                  <td>{{ problem.difficulty }}</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section class="dashboard-card tag-analysis-card">
            <h2 class="card-title">Tag별 분석</h2>
            <RadarChart :tag-accuracy="aggregatedTagAccuracy" />
            <p class="tag-analysis-summary">
              이런 패턴을 보이는 응시자는, 특히 <span class="highlight-tag">분석력</span> 분야가
              부족합니다. 워크숍 참여를 추천합니다.
            </p>
          </section>
        </div>

        <section class="dashboard-card score-distribution-card">
          <h2 class="card-title">학습자별 점수 분포</h2>
          <ScoreDistributionBarChart :data="scoreDistribution" />
        </section>

        <section class="dashboard-card learner-correctness-table-card">
          <h2 class="card-title">학습자별 문항 정오표</h2>
          <LearnerProblemCorrectnessTable :data="learnerCorrectnessData" />
        </section>
      </div>
    </template>
  </MainLayout>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import MainLayout from '@/components/layouts/MainLayout.vue'
import RadarChart from '@/components/trainer/feedback/RadarChart.vue'
import DoughnutChart from '@/components/trainer/feedback/DoughnutChart.vue'
import ProblemAccuracyBarChart from '@/components/trainer/feedback/ProblemAccuracyBarChart.vue'
import ScoreDistributionBarChart from '@/components/trainer/feedback/ScoreDistributionBarChart.vue'
import LearnerProblemCorrectnessTable from '@/components/trainer/feedback/TraineeProblemCorrectnessTable.vue'

// Mock Data for TrainerTestStatus
const trainerStatusData = ref({
  totalParticipants: 250,
  passers: 105,
  averageScore: 78.5,
  problemAccuracies: [
    { problemId: 'Problem 1', accuracy: 85 },
    { problemId: 'Problem 2', accuracy: 70 },
    { problemId: 'Problem 3', accuracy: 92 },
    { problemId: 'Problem 4', accuracy: 60 },
    { problemId: 'Problem 5', accuracy: 78 },
    { problemId: 'Problem 6', accuracy: 95 },
    { problemId: 'Problem 7', accuracy: 55 },
    { problemId: 'Problem 8', accuracy: 88 },
    { problemId: 'Problem 9', accuracy: 72 },
    { problemId: 'Problem 10', accuracy: 81 },
  ],
  tagAccuracies: {
    추론력: 80,
    문제해결력: 75,
    이해력: 90,
    논리력: 70,
    분석력: 65,
  },
  learnerScores: [
    70,
    85,
    95,
    60,
    85,
    90,
    78,
    85,
    65,
    99,
    72,
    81,
    55,
    88,
    79, // from TraineeTestFeedback
    40,
    50,
    60,
    65,
    70,
    72,
    75,
    78,
    80,
    82,
    85,
    88,
    90,
    92,
    95,
    98,
    99, // additional scores
    62,
    73,
    84,
    89,
    58,
    67,
    77,
    83,
    91,
    52,
    63,
    74,
    86,
    93,
    61,
    71,
    80,
    87,
    94,
    96,
  ],
  problemDetails: [
    // For '상위/하위' table
    { id: 'Problem 1', type: '기본', accuracy: 85, average: 80, myScore: 88, difficulty: '하' },
    { id: 'Problem 2', type: '추론', accuracy: 70, average: 75, myScore: 65, difficulty: '중' },
    { id: 'Problem 3', type: '응용', accuracy: 92, average: 85, myScore: 90, difficulty: '하' },
    { id: 'Problem 4', type: '분석', accuracy: 60, average: 65, myScore: 40, difficulty: '상' },
    { id: 'Problem 5', type: '기본', accuracy: 78, average: 70, myScore: 75, difficulty: '중' },
  ],
  learnerCorrectnessData: [
    {
      learner: '학습자1',
      P1: 'O',
      P2: 'O',
      P3: 'O',
      P4: 'X',
      P5: 'O',
      P6: 'O',
      P7: 'O',
      P8: 'O',
      P9: 'O',
      P10: 'O',
    },
    {
      learner: '학습자2',
      P1: 'O',
      P2: 'X',
      P3: 'O',
      P4: 'O',
      P5: 'O',
      P6: 'O',
      P7: 'O',
      P8: 'X',
      P9: 'O',
      P10: 'X',
    },
    {
      learner: '학습자3',
      P1: 'O',
      P2: 'O',
      P3: 'O',
      P4: 'O',
      P5: 'O',
      P6: 'O',
      P7: 'O',
      P8: 'O',
      P9: 'X',
      P10: 'O',
    },
    {
      learner: '학습자4',
      P1: 'X',
      P2: 'O',
      P3: 'O',
      P4: 'O',
      P5: 'X',
      P6: 'O',
      P7: 'O',
      P8: 'O',
      P9: 'O',
      P10: 'O',
    },
    {
      learner: '학습자5',
      P1: 'O',
      P2: 'O',
      P3: 'O',
      P4: 'X',
      P5: 'O',
      P6: 'X',
      P7: 'O',
      P8: 'O',
      P9: 'O',
      P10: 'O',
    },
    {
      learner: '학습자6',
      P1: 'X',
      P2: 'X',
      P3: 'O',
      P4: 'X',
      P5: 'O',
      P6: 'O',
      P7: 'X',
      P8: 'O',
      P9: 'O',
      P10: 'O',
    },
    {
      learner: '학습자7',
      P1: 'O',
      P2: 'O',
      P3: 'X',
      P4: 'O',
      P5: 'O',
      P6: 'O',
      P7: 'O',
      P8: 'X',
      P9: 'O',
      P10: 'O',
    },
    {
      learner: '학습자8',
      P1: 'O',
      P2: 'O',
      P3: 'O',
      P4: 'O',
      P5: 'O',
      P6: 'X',
      P7: 'O',
      P8: 'O',
      P9: 'O',
      P10: 'O',
    },
    {
      learner: '학습자9',
      P1: 'X',
      P2: 'O',
      P3: 'O',
      P4: 'O',
      P5: 'O',
      P6: 'O',
      P7: 'O',
      P8: 'O',
      P9: 'O',
      P10: 'X',
    },
    {
      learner: '학습자10',
      P1: 'O',
      P2: 'O',
      P3: 'O',
      P4: 'X',
      P5: 'O',
      P6: 'O',
      P7: 'O',
      P8: 'O',
      P9: 'X',
      P10: 'O',
    },
  ],
})

const averageScore = computed(() => trainerStatusData.value.averageScore)
const passersCount = computed(() => trainerStatusData.value.passers)
const totalParticipants = computed(() => trainerStatusData.value.totalParticipants)

const passRateData = computed(() => ({
  labels: ['합격자', '불합격자'],
  datasets: [
    {
      data: [passersCount.value, totalParticipants.value - passersCount.value],
      backgroundColor: ['#4CAF50', '#FFC107'],
      hoverOffset: 4,
    },
  ],
}))

// 문항별 정답률 정렬
const problemAccuracySortOrder = ref('desc') // 'asc' for ascending, 'desc' for descending

const sortedProblemAccuracy = computed(() => {
  const data = [...trainerStatusData.value.problemAccuracies]
  if (problemAccuracySortOrder.value === 'asc') {
    return data.sort((a, b) => a.accuracy - b.accuracy)
  } else {
    return data.sort((a, b) => b.accuracy - a.accuracy)
  }
})

const aggregatedTagAccuracy = computed(() => trainerStatusData.value.tagAccuracies)
const problemDetails = computed(() => trainerStatusData.value.problemDetails)
const learnerCorrectnessData = computed(() => trainerStatusData.value.learnerCorrectnessData)

// 학습자별 점수 분포 계산
const scoreDistribution = computed(() => {
  const scores = trainerStatusData.value.learnerScores
  const bins = {
    '0-49': 0,
    '50-59': 0,
    '60-69': 0,
    '70-79': 0,
    '80-89': 0,
    '90-100': 0,
  }

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
        label: '학습자 수',
        backgroundColor: '#42A5F5',
        data: Object.values(bins),
      },
    ],
  }
})

onMounted(() => {
  // In a real application, you would fetch data here
  // For now, we're using mock data initialized above.
  console.log('TrainerTestStatus component mounted.')
})
</script>

<style scoped>
/* MainLayout handles general layout and sidebar */
/* 사이드바가 없으므로 main-content의 padding과 width, max-width만 중요해집니다. */
.trainer-status-main-content {
  flex-grow: 1;
  max-width: 1400px; /* Wider than Trainee feedback for more content */
  margin: 0 auto;
  padding: 30px; /* Add padding here as MainLayout's .main-content might not have enough */
  width: 100%;
  box-sizing: border-box;
}

.dashboard-title {
  font-size: 36px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 10px;
  text-align: center;
}

.dashboard-subtitle {
  font-size: 18px;
  color: #6c757d;
  text-align: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e0e0e0;
}

/* Sidebar styling for TrainerTestStatus - 이 섹션은 이제 필요 없지만, 혹시 모를 재활용을 위해 주석 처리하거나 제거할 수 있습니다. */
/*
.sidebar-menu {
  padding: 20px;
  border-bottom: 1px solid #eee;
  margin-bottom: 15px;
}

.sidebar-title {
  font-size: 1.2em;
  font-weight: 600;
  color: #34495e;
  margin-bottom: 15px;
}

.sidebar-menu ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar-menu li {
  margin-bottom: 10px;
}

.sidebar-menu a {
  text-decoration: none;
  color: #555;
  font-size: 0.95em;
  transition: color 0.2s ease;
}

.sidebar-menu a:hover {
  color: #007bff;
}
*/

/* Grid Layouts */
.top-section-grid {
  display: grid;
  grid-template-columns: 2fr 1fr; /* AI Summary (2) : Avg Score (1) */
  gap: 25px;
  margin-bottom: 25px;
}

.middle-section-grid {
  display: grid;
  grid-template-columns: 1.5fr 1fr 1fr; /* Problem Accuracy : Top/Bottom : Tag Analysis */
  gap: 25px;
  margin-bottom: 25px;
}

/* Common Dashboard Card Style */
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

/* AI Summary Card */
.ai-summary-card .card-title {
  text-align: left;
  border-bottom: none; /* No border for AI summary, as per image */
  margin-bottom: 10px;
}

.ai-summary-content {
  display: flex;
  flex-direction: column;
  gap: 15px;
  font-size: 15px;
  color: #495057;
  flex-grow: 1;
}

.ai-summary-item h3 {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 5px;
}

.ai-summary-item p,
.ai-summary-item ul {
  font-size: 14px;
  line-height: 1.5;
  color: #555;
}

.ai-summary-item ul {
  list-style: disc;
  padding-left: 20px;
  margin: 0;
}

/* Average Score Card */
.average-score-card {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.average-score-content {
  text-align: center;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
}

.average-score-content .score-item {
  margin-bottom: 10px;
  font-size: 18px;
  color: #495057;
  display: flex;
  justify-content: space-between;
  width: 100%;
  max-width: 200px;
}

.average-score-content .score-item .label {
  font-weight: 500;
}

.average-score-content .score-item .value {
  font-weight: 700;
  color: #007bff;
}

.average-score-card .chart-container {
  width: 150px; /* Adjust size as needed */
  height: 150px;
  margin-top: 20px;
}

/* Problem Accuracy Card */
.problem-accuracy-card .controls {
  display: flex;
  justify-content: flex-end; /* Align to right */
  align-items: center;
  margin-bottom: 15px;
  gap: 10px;
  font-size: 14px;
}

.problem-accuracy-card .controls label {
  color: #555;
}

.problem-accuracy-card .controls select {
  padding: 8px 10px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 14px;
  background-color: #fff;
  cursor: pointer;
  outline: none;
}

.problem-accuracy-card .controls select:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

/* Top/Bottom Card (Problem Details Table) */
.top-bottom-card {
  overflow-x: auto; /* Enable horizontal scrolling for table */
}

.problem-detail-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  color: #343a40;
}

.problem-detail-table th,
.problem-detail-table td {
  padding: 12px 10px;
  text-align: center;
  border-bottom: 1px solid #f0f2f5;
}

.problem-detail-table th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #495057;
  white-space: nowrap; /* Prevent wrapping in headers */
}

.problem-detail-table td {
  background-color: #ffffff;
  white-space: nowrap; /* Prevent wrapping in cells */
}

.problem-detail-table tbody tr:hover {
  background-color: #f5f5f5;
}

.problem-detail-table .low-accuracy {
  color: #dc3545; /* Red color for low accuracy */
  font-weight: 600;
}

/* Tag Analysis Card */
.tag-analysis-card {
  align-items: center; /* Center chart and summary */
}

.tag-analysis-card .chart-container {
  width: 100%;
  max-width: 300px; /* Max width for radar chart */
  margin: 0 auto 20px;
}

.tag-analysis-summary {
  font-size: 16px;
  color: #495057;
  text-align: center;
  line-height: 1.6;
}

.tag-analysis-summary .highlight-tag {
  font-weight: 700;
  color: #dc3545; /* Highlight weak tag */
}

/* Score Distribution Card */
.score-distribution-card .chart-container {
  width: 100%;
  height: 300px; /* Fixed height for bar chart */
  margin-top: 15px;
}

/* Learner Correctness Table Card */
.learner-correctness-table-card {
  overflow-x: auto; /* Enable horizontal scrolling */
}

.learner-correctness-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  color: #343a40;
  min-width: 800px; /* Ensure table is wide enough for columns */
}

.learner-correctness-table th,
.learner-correctness-table td {
  padding: 10px 8px;
  text-align: center;
  border: 1px solid #e0e0e0;
}

.learner-correctness-table th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #495057;
  position: sticky;
  top: 0;
  z-index: 1; /* Keep headers visible on scroll */
}

.learner-correctness-table td {
  background-color: #ffffff;
}

.learner-correctness-table tbody tr:hover {
  background-color: #f5f5f5;
}

.learner-correctness-table td.correct {
  color: #28a745; /* Green for correct */
  font-weight: 600;
}

.learner-correctness-table td.incorrect {
  color: #dc3545; /* Red for incorrect */
  font-weight: 600;
}

/* Responsive Design */
@media (max-width: 1200px) {
  .middle-section-grid {
    grid-template-columns: 1fr; /* Stack all middle sections */
  }
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
    grid-template-columns: 1fr; /* Stack top sections */
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
  .dashboard-card {
    padding: 20px;
  }
  .card-title {
    font-size: 18px;
  }

  /* Table adjustments for small screens */
  .problem-detail-table,
  .learner-correctness-table {
    font-size: 12px;
  }
  .problem-detail-table th,
  .problem-detail-table td,
  .learner-correctness-table th,
  .learner-correctness-table td {
    padding: 8px 5px;
  }
}
</style>
