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
import { useRouter } from 'vue-router'
import MainLayout from '@/components/layouts/MainLayout.vue'
import AISummaryCard from '@/components/trainer/feedback/AISummaryCard.vue'
import AverageScoreCard from '@/components/trainer/feedback/AverageScoreCard.vue'
import TagAnalysisCard from '@/components/trainer/feedback/TagAnalysisCard.vue'
import ProblemAnalysisCard from '@/components/trainer/feedback/ProblemAnalysisCard.vue'
import ScoreDistributionCard from '@/components/trainer/feedback/ScoreDistributionCard.vue'
import CorrectnessTableCard from '@/components/trainer/feedback/TraineeProblemCorrectnessTableCard.vue'

const router = useRouter()

const goBack = () => {
  router.back()
}

// 다운로드 함수들
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

// AI Output 데이터
const aiOutputData = ref({
  examGoal: '클라우드 DB 관리 역량 평가 (관계형, NoSQL, 보안)',
  performanceByDocument: [
    {
      documentName: 'AWS RDS 가이드',
      averageCorrectRate: 68.47,
      comment:
        '관계형 DB 기본 개념 및 운영 기능에 대한 이해는 있으나, 성능 최적화와 같은 심화 내용 적용에는 추가 학습이 필요해 보입니다.',
    },
    {
      documentName: 'MongoDB Atlas Documentation',
      averageCorrectRate: 69.84,
      comment:
        'NoSQL의 특징과 복제 및 샤딩과 같은 확장성 관련 개념을 잘 이해하고 있으며, 실무 적용 가능성이 높습니다.',
    },
    {
      documentName: '데이터베이스 보안 모범 사례',
      averageCorrectRate: 38.69,
      comment:
        'DB 보안의 기본적인 중요성은 인지하고 있으나, SQL Injection 방지, DB 암호화, 키 보관 등 구체적인 보안 기법 및 원칙에 대한 이해도가 현저히 낮습니다.',
    },
  ],
  insights: [
    {
      type: 'strength',
      text: '관계형 DB와 NoSQL DB의 기본 개념에 대한 이해도가 높음 (#관계형 DB, #NoSQL 특징)',
    },
    {
      type: 'strength',
      text: '데이터베이스 확장성 관련 기술인 복제 및 샤딩에 대한 이해도가 우수함 (#복제, #샤딩)',
    },
    {
      type: 'weakness',
      text: '데이터베이스 보안의 전반적인 중요성은 인지하나, 구체적인 보안 기법(SQL Injection, DB 암호화, 키 보관)에 대한 이해 부족 (#SQL Injection, #DB 암호화, #키 보관)',
    },
    {
      type: 'weakness',
      text: 'DB 백업 및 장애 조치, 성능 조정과 같은 운영 기능의 실무 적용 심화 학습 필요 (#DB 백업, #성능 조정, #장애 조치)',
    },
  ],
  improvementPoints:
    '관계형 및 NoSQL DB의 기본 구조와 확장성 개념은 잘 파악하고 있으나, DB 보안에 대한 이해도가 매우 낮아 해당 부분에 대한 집중 학습이 시급합니다. 특히 SQL Injection 방지, DB 암호화 방식, 안전한 키 관리 방법 등을 구체적인 사례와 함께 학습하고, 보안 취약점 점검 및 대응 방안을 실습하는 것이 중요합니다. 또한, RDS의 성능 조정과 백업/장애 조치 관련 실무 적용 능력을 강화하기 위해 실제 운영 환경을 가정한 시나리오 학습이 필요합니다.',
  suggestedTopics: [
    'SQL Injection 공격 유형별 방어 전략 및 실제 코드 예제',
    'DB 암호화 방식 비교 (TDE, 컬럼 암호화 등) 및 키 관리 시스템(KMS) 활용',
    'AWS RDS 성능 튜닝 실습: 인덱스 최적화 및 쿼리 분석',
  ],
  overallEvaluation:
    '관계형 및 NoSQL 데이터베이스의 기본 개념과 확장성에 대한 이해는 양호하나, 데이터베이스 보안 관련 역량이 현저히 부족하여 현재 상태로는 프로젝트 수행이 어렵습니다. 특히 보안에 대한 기초적인 학습과 실습이 선행되어야 하며, 이후 심화 학습을 통해 전반적인 클라우드 데이터베이스 관리 역량을 강화한 후 재평가가 필요합니다.',
  projectReadiness: 'Fail',
})

// 목업 데이터
const trainerStatusData = ref({
  totalParticipants: 250,
  passers: 105,
  averageScore: 78.5,
  problemAccuracies: [
    { problemId: 'P1', accuracy: 85 },
    { problemId: 'P2', accuracy: 70 },
    { problemId: 'P3', accuracy: 92 },
    { problemId: 'P4', accuracy: 60 },
    { problemId: 'P5', accuracy: 78 },
    { problemId: 'P6', accuracy: 95 },
    { problemId: 'P7', accuracy: 55 },
    { problemId: 'P8', accuracy: 88 },
    { problemId: 'P9', accuracy: 72 },
    { problemId: 'P10', accuracy: 81 },
  ],
  tagAccuracies: {
    '관계형 DB': { correct: 8, total: 10 },
    'NoSQL 특징': { correct: 9, total: 10 },
    'DB 보안': { correct: 3, total: 10 },
    '성능 최적화': { correct: 6, total: 10 },
    '백업/복구': { correct: 7, total: 10 },
  },
  learnerScores: [
    70, 85, 95, 60, 85, 90, 78, 85, 65, 99, 72, 81, 55, 88, 79, 40, 50, 52, 58, 60, 62, 65, 67, 70,
    71, 72, 73, 74, 75, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95,
    96, 98, 99,
  ],
  problemDetails: [
    {
      id: 'P1',
      type: '기본',
      accuracy: 85,
      average: 80,
      myScore: 88,
      difficulty: '하',
      questionText: 'HTML의 주요 특징은 무엇입니까?',
      correctAnswer: '웹 페이지 구조화',
      explanation: 'HTML은 웹 페이지의 뼈대를 구성하는 마크업 언어입니다.',
      tags: ['웹 기본', '프론트엔드', '관계형 DB'],
    },
    {
      id: 'P2',
      type: '추론',
      accuracy: 70,
      average: 75,
      myScore: 65,
      difficulty: '중',
      questionText: 'Vue 컴포넌트의 라이프사이클 훅 중 `mounted`가 호출되는 시점은?',
      correctAnswer: '컴포넌트가 DOM에 마운트된 후',
      explanation: '`mounted` 훅은 컴포넌트가 DOM에 성공적으로 삽입된 후에 호출됩니다.',
      tags: ['Vue.js', '프론트엔드', 'NoSQL 특징'],
    },
    // 나머지 문제들...
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
    // 나머지 학습자들...
  ],
})

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

// 응시자 목록
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

onMounted(() => {
  console.log('TrainerTestStatus component mounted.')
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
