<template>
  <MainLayout :show-sidebar="false">
    <template #content>
      <div class="trainer-status-main-content">
        <div class="page-header">
          <h1 class="dashboard-title">테스트 응시 현황</h1>
          <button @click="goBack" class="back-button">
            <v-icon>mdi-arrow-left</v-icon>
            <span>이전</span>
          </button>
        </div>
        <p class="dashboard-subtitle">
          응시자들의 응시 현황을 파악하고, AI가 테스트 관리에 도움을 드립니다.
        </p>

        <div class="top-section-grid">
          <section class="dashboard-card ai-summary-card">
            <h2 class="card-title">AI 테스트 결과 요약</h2>
            <div class="ai-summary-content">
              <div class="ai-summary-item">
                <h3>시험 목표</h3>
                <p>{{ aiOutputData.examGoal }}</p>
              </div>

              <div class="ai-summary-item">
                <h3>문서별 성과 분석</h3>
                <div class="chart-container document-performance-chart">
                  <DocumentPerformanceBarChart
                    :data="performanceByDocumentChartData"
                    :chart-options="performanceByDocumentChartOptions"
                  />
                </div>
              </div>

              <div class="ai-summary-item">
                <h3>강점</h3>
                <ul>
                  <li
                    v-for="(insight, index) in aiOutputData.insights.filter(
                      (i) => i.type === 'strength',
                    )"
                    :key="index"
                  >
                    {{ insight.text }}
                  </li>
                </ul>
              </div>

              <div class="ai-summary-item">
                <h3>약점</h3>
                <ul>
                  <li
                    v-for="(insight, index) in aiOutputData.insights.filter(
                      (i) => i.type === 'weakness',
                    )"
                    :key="index"
                  >
                    {{ insight.text }}
                  </li>
                </ul>
              </div>

              <div class="ai-summary-item">
                <h3>주요 개선점</h3>
                <p>{{ aiOutputData.improvementPoints }}</p>
              </div>

              <div class="ai-summary-item">
                <h3>제안 주제</h3>
                <ul>
                  <li v-for="(topic, index) in aiOutputData.suggestedTopics" :key="index">
                    {{ topic }}
                  </li>
                </ul>
              </div>

              <div class="ai-summary-item">
                <h3>종합 평가</h3>
                <p>{{ aiOutputData.overallEvaluation }}</p>
              </div>

              <div class="ai-summary-item">
                <h3>프로젝트 준비도</h3>
                <p>
                  <span
                    :class="{
                      'highlight-success': aiOutputData.projectReadiness === 'Pass',
                      'highlight-fail': aiOutputData.projectReadiness === 'Fail',
                    }"
                  >
                    {{ aiOutputData.projectReadiness }}
                  </span>
                </p>
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
              <div class="chart-container small-doughnut-chart">
                <DoughnutChart :data="passRateData" />
              </div>
            </div>
          </section>
        </div>

        <section class="dashboard-card problem-accuracy-card full-width-section">
          <h2 class="card-title">문항별 분석</h2>
          <div class="controls">
            <label for="sort-problem-accuracy">정렬:</label>
            <select id="sort-problem-accuracy" v-model="problemAccuracySortOrder">
              <option value="asc">정답률 낮은 순</option>
              <option value="desc">정답률 높은 순</option>
            </select>
          </div>
          <div class="chart-container default-bar-chart">
            <ProblemAccuracyBarChart :data="sortedProblemAccuracy" />
          </div>

          <div class="problem-detail-table-container">
            <table class="problem-detail-table">
              <thead>
                <tr>
                  <th>문제</th>
                  <th>유형</th>
                  <th>정답률</th>
                  <th>평균</th>
                  <th>나의 점수</th>
                  <th>난이도</th>
                  <th>상세 정보</th>
                </tr>
              </thead>
              <tbody>
                <template v-for="problem in sortedProblemDetails" :key="problem.id">
                  <tr class="problem-row" @click="toggleProblemDetail(problem.id)">
                    <td>{{ problem.id }}</td>
                    <td>{{ problem.type }}</td>
                    <td :class="{ 'low-accuracy': problem.accuracy < 50 }">
                      {{ problem.accuracy }}%
                    </td>
                    <td>{{ problem.average }}%</td>
                    <td>{{ problem.myScore }}점</td>
                    <td>{{ problem.difficulty }}</td>
                    <td>
                      <v-icon size="18">{{
                        expandedProblems[problem.id] ? 'mdi-chevron-up' : 'mdi-chevron-down'
                      }}</v-icon>
                    </td>
                  </tr>
                  <tr v-if="expandedProblems[problem.id]" class="problem-detail-row">
                    <td colspan="7">
                      <div class="detail-content">
                        <p><strong>문제 내용:</strong> {{ problem.questionText }}</p>
                        <p><strong>정답:</strong> {{ problem.correctAnswer }}</p>
                        <p><strong>해설:</strong> {{ problem.explanation }}</p>
                        <p>
                          <strong>관련 TAG:</strong>
                          <span class="tag-chip" v-for="tag in problem.tags" :key="tag">{{
                            tag
                          }}</span>
                        </p>
                      </div>
                    </td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>
        </section>

        <div class="bottom-section-grid">
          <section class="dashboard-card tag-analysis-card">
            <h2 class="card-title">Tag별 분석</h2>
            <div class="chart-container default-bar-chart">
              <TagAccuracyBarChart :tag-accuracy="aggregatedTagAccuracy" />
            </div>
            <p class="tag-analysis-summary" v-if="lowestAccuracyTag">
              이런 패턴을 보이는 응시자는, 특히
              <span class="highlight-tag">{{ lowestAccuracyTag.name }}</span> 분야가 부족합니다.
              (평균 정답률: {{ lowestAccuracyTag.rate.toFixed(1) }}%) 워크숍 참여를 추천합니다.
            </p>
            <p class="tag-analysis-summary" v-else>태그별 분석 데이터를 불러오는 중입니다.</p>
          </section>

          <section class="dashboard-card score-distribution-card">
            <h2 class="card-title">학습자별 점수 분포</h2>
            <div class="chart-container default-line-chart">
              <ScoreDistributionLineChart
                :data="scoreDistribution"
                :chart-options="scoreDistributionChartOptions"
              />
            </div>
          </section>
        </div>

        <section class="dashboard-card learner-correctness-table-card full-width-section">
          <h2 class="card-title">학습자별 문항 정오표</h2>
          <LearnerProblemCorrectnessTable :data="learnerCorrectnessData" />
        </section>
      </div>
    </template>
  </MainLayout>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import MainLayout from '@/components/layouts/MainLayout.vue'
import TagAccuracyBarChart from '@/components/trainer/feedback/TagAccuracyBarChart.vue'
import DoughnutChart from '@/components/trainer/feedback/DoughnutChart.vue'
import ProblemAccuracyBarChart from '@/components/trainer/feedback/ProblemAccuracyBarChart.vue'
import ScoreDistributionLineChart from '@/components/trainer/feedback/ScoreDistributionLineChart.vue'
import LearnerProblemCorrectnessTable from '@/components/trainer/feedback/TraineeProblemCorrectnessTable.vue'
import DocumentPerformanceBarChart from '@/components/trainer/feedback/DocumentPerformanceBarChart.vue'

const router = useRouter()

const goBack = () => {
  router.back()
}

// 변경된 AI Output 데이터 구조
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
  projectReadiness: 'Fail', // 새롭게 추가된 필드
})

// 문서별 성과를 위한 차트 데이터 (Bar Chart로 시각화 예정)
const performanceByDocumentChartData = computed(() => {
  const documents = aiOutputData.value.performanceByDocument
  return {
    labels: documents.map((doc) => doc.documentName),
    datasets: [
      {
        label: '평균 정답률',
        data: documents.map((doc) => doc.averageCorrectRate),
        backgroundColor: documents.map((doc) =>
          doc.averageCorrectRate < 60
            ? '#e74c3c'
            : doc.averageCorrectRate < 75
              ? '#f39c12'
              : '#28a745',
        ), // 색상 조건부 부여
        borderColor: '#1e2251',
        borderWidth: 1,
        barPercentage: 0.7,
        categoryPercentage: 0.8,
      },
    ],
  }
})

// 문서별 성과 차트 옵션
const performanceByDocumentChartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  indexAxis: 'y', // 가로 막대 차트
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      callbacks: {
        label: function (context) {
          return `${context.dataset.label}: ${context.parsed.x.toFixed(2)}%`
        },
        afterBody: function (context) {
          const index = context[0].dataIndex
          return aiOutputData.value.performanceByDocument[index].comment
        },
      },
    },
  },
  scales: {
    x: {
      beginAtZero: true,
      max: 100,
      title: {
        display: true,
        text: '정답률 (%)',
        color: '#343a40',
      },
      ticks: {
        callback: function (value) {
          return value + '%'
        },
        color: '#495057',
      },
    },
    y: {
      title: {
        display: true,
        text: '문서명',
        color: '#343a40',
      },
      ticks: {
        color: '#495057',
      },
      grid: {
        display: false,
      },
    },
  },
}))

// 기존 목업 데이터 (AI Output과 별개로 유지)
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
  // Tag 정확도 데이터는 이제 계산된 정답률을 포함할 것입니다.
  tagAccuracies: {
    '관계형 DB': { correct: 8, total: 10 },
    'NoSQL 특징': { correct: 9, total: 10 },
    'DB 보안': { correct: 3, total: 10 }, // 낮게 설정
    'SQL Injection': { correct: 2, total: 5 },
    'DB 암호화': { correct: 1, total: 5 },
    '키 보관': { correct: 2, total: 5 },
    복제: { correct: 9, total: 10 },
    샤딩: { correct: 8, total: 10 },
    'DB 백업': { correct: 6, total: 10 },
    '성능 조정': { correct: 5, total: 10 },
    '장애 조치': { correct: 6, total: 10 },
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
    {
      id: 'P3',
      type: '응용',
      accuracy: 92,
      average: 85,
      myScore: 90,
      difficulty: '하',
      questionText: 'SQL에서 데이터를 조작하는 DML 명령어는 무엇입니까?',
      correctAnswer: 'SELECT, INSERT, UPDATE, DELETE',
      explanation:
        'DML(Data Manipulation Language)은 데이터를 조회, 삽입, 수정, 삭제하는 명령어입니다.',
      tags: ['데이터베이스', 'SQL', '관계형 DB'],
    },
    {
      id: 'P4',
      type: '분석',
      accuracy: 60,
      average: 65,
      myScore: 40,
      difficulty: '상',
      questionText: '쿠버네티스(Kubernetes)에서 파드(Pod)의 스케줄링 정책에 대해 설명하시오.',
      correctAnswer:
        '스케줄러는 노드의 리소스 가용성, 요구사항, 제약 조건 등을 고려하여 파드를 적절한 노드에 배치합니다.',
      explanation: '쿠버네티스 스케줄러는 워크로드 배포를 최적화하기 위한 핵심 구성 요소입니다.',
      tags: ['클라우드', 'DevOps', '복제'],
    },
    {
      id: 'P5',
      type: '기본',
      accuracy: 78,
      average: 70,
      myScore: 75,
      difficulty: '중',
      questionText: '객체 지향 프로그래밍의 4가지 주요 특징은?',
      correctAnswer: '캡슐화, 상속, 다형성, 추상화',
      explanation: 'OOP의 주요 개념들은 코드의 재사용성과 유지보수성을 높입니다.',
      tags: ['프로그래밍', 'OOP', '샤딩'],
    },
    {
      id: 'P6',
      type: '응용',
      accuracy: 95,
      average: 90,
      myScore: 98,
      difficulty: '하',
      questionText: 'Git에서 브랜치를 병합하는 명령어는 무엇입니까?',
      correctAnswer: 'git merge',
      explanation: '`git merge` 명령어는 두 개 이상의 브랜치를 하나로 합치는 데 사용됩니다.',
      tags: ['Git', '버전 관리', 'DB 백업'],
    },
    {
      id: 'P7',
      type: '추론',
      accuracy: 55,
      average: 60,
      myScore: 50,
      difficulty: '상',
      questionText:
        'RESTful API 설계 시 idempotency(멱등성)의 의미와 이를 보장해야 하는 HTTP 메서드는 무엇입니까?',
      correctAnswer:
        '동일한 요청을 여러 번 수행해도 결과가 동일한 속성. PUT, DELETE 메서드가 멱등성을 보장해야 합니다.',
      explanation:
        '멱등성은 네트워크 환경에서 요청 재시도시 데이터 일관성을 유지하는 데 중요합니다.',
      tags: ['네트워크', 'API', 'DB 보안', 'SQL Injection'],
    },
    {
      id: 'P8',
      type: '기본',
      accuracy: 88,
      average: 85,
      myScore: 92,
      difficulty: '하',
      questionText:
        'CSS에서 레이아웃을 잡을 때 주로 사용되는 두 가지 속성 (Flexbox, Grid) 중 하나를 설명하시오.',
      correctAnswer:
        'Flexbox는 1차원 레이아웃(행 또는 열)에 적합하며, Grid는 2차원 레이아웃(행과 열)에 적합합니다.',
      explanation: 'CSS Flexbox와 Grid는 현대 웹 레이아웃을 위한 강력한 도구입니다.',
      tags: ['CSS', '프론트엔드', 'DB 암호화'],
    },
    {
      id: 'P9',
      type: '분석',
      accuracy: 72,
      average: 70,
      myScore: 70,
      difficulty: '중',
      questionText: 'CI/CD 파이프라인 구축 시 자주 사용되는 도구 2가지를 들고 설명하시오.',
      correctAnswer: 'Jenkins (자동화 서버), GitLab CI/CD (GitLab 통합 CI/CD)',
      explanation: 'CI/CD는 소프트웨어 개발 및 배포 과정을 자동화하여 효율성을 높입니다.',
      tags: ['DevOps', 'CI/CD', '키 보관'],
    },
    {
      id: 'P10',
      type: '응용',
      accuracy: 81,
      average: 80,
      myScore: 85,
      difficulty: '중',
      questionText: '자바스크립트 비동기 처리 방식 중 Promise와 async/await의 차이점을 설명하시오.',
      correctAnswer:
        'Promise는 콜백 지옥을 해결하기 위해 도입되었으며, async/await는 Promise를 기반으로 비동기 코드를 동기 코드처럼 작성할 수 있게 합니다.',
      explanation:
        'ES6 이후 도입된 Promise와 async/await는 복잡한 비동기 로직을 보다 쉽게 관리할 수 있게 합니다.',
      tags: ['JavaScript', '비동기', '성능 조정', '장애 조치'],
    },
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
      backgroundColor: ['#1e2251', '#a2a6d4'],
      hoverOffset: 4,
    },
  ],
}))

const problemAccuracySortOrder = ref('desc')

// 그래프 데이터 정렬 (기존과 동일)
const sortedProblemAccuracy = computed(() => {
  const data = [...trainerStatusData.value.problemAccuracies]
  if (problemAccuracySortOrder.value === 'asc') {
    return data.sort((a, b) => a.accuracy - b.accuracy)
  } else {
    return data.sort((a, b) => b.accuracy - a.accuracy)
  }
})

// 테이블 데이터 정렬 (문제 상세 정보)
const sortedProblemDetails = computed(() => {
  const data = [...trainerStatusData.value.problemDetails] // 원본 배열 복사
  if (problemAccuracySortOrder.value === 'asc') {
    return data.sort((a, b) => a.accuracy - b.accuracy)
  } else {
    return data.sort((a, b) => b.accuracy - a.accuracy)
  }
})

const expandedProblems = ref({})

const toggleProblemDetail = (problemId) => {
  expandedProblems.value[problemId] = !expandedProblems.value[problemId]
}

// TAG별 분석 데이터 계산
const aggregatedTagAccuracy = computed(() => {
  const tagStats = {} // { tagName: { correct: X, total: Y, averageCorrectRate: Z } }

  // trainerStatusData.value.tagAccuracies를 기반으로 순회하며 정답률 계산
  for (const tag in trainerStatusData.value.tagAccuracies) {
    const { correct, total } = trainerStatusData.value.tagAccuracies[tag]
    const averageCorrectRate = total > 0 ? (correct / total) * 100 : 0
    tagStats[tag] = {
      correct: correct,
      total: total,
      averageCorrectRate: parseFloat(averageCorrectRate.toFixed(2)), // 소수점 두 자리까지
    }
  }
  return tagStats
})

// 가장 낮은 정답률을 가진 태그 찾기 (요약 문구용)
const lowestAccuracyTag = computed(() => {
  let lowestRate = 101 // 100%를 초과하는 값으로 초기화
  let lowestTag = null

  for (const tag in aggregatedTagAccuracy.value) {
    const tagData = aggregatedTagAccuracy.value[tag]
    if (tagData.averageCorrectRate < lowestRate) {
      lowestRate = tagData.averageCorrectRate
      lowestTag = { name: tag, rate: tagData.averageCorrectRate }
    }
  }
  return lowestTag
})

const learnerCorrectnessData = computed(() => trainerStatusData.value.learnerCorrectnessData)

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

  const totalLearners = scores.length
  const percentages = Object.values(bins).map((count) => ((count / totalLearners) * 100).toFixed(1))

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
        _percentages: percentages,
      },
    ],
  }
})

const scoreDistributionChartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  animation: { duration: 500 },
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: function (context) {
          const label = context.dataset.label || ''
          const rawValue = context.parsed.y
          const percentage = context.dataset._percentages[context.dataIndex]
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
      title: { display: true, text: '비율 (%)', color: '#343a40' },
      beginAtZero: true,
      max: 100,
      ticks: {
        callback: function (value, index, values) {
          const totalLearners = trainerStatusData.value.learnerScores.length
          if (totalLearners === 0) return '0%'
          return `${((value / totalLearners) * 100).toFixed(0)}%`
        },
        color: '#495057',
      },
      grid: { color: 'rgba(0, 0, 0, 0.05)' },
    },
  },
}))

onMounted(() => {
  trainerStatusData.value.problemDetails.forEach((p) => {
    expandedProblems.value[p.id] = false
  })
  console.log('TrainerTestStatus component mounted.')
})
</script>

<style scoped>
/* MainLayout handles general layout and sidebar */
.trainer-status-main-content {
  flex-grow: 1;
  max-width: 1400px; /* 전체 컨테이너 최대 너비 */
  margin: 0 auto;
  padding: 30px;
  width: 100%;
  box-sizing: border-box;
}

.page-header {
  display: flex;
  justify-content: space-between; /* 양 끝 정렬 */
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e0e0e0;
}

.back-button {
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 16px;
  color: #1e2251;
  font-weight: 600;
  padding: 8px 12px;
  border-radius: 8px;
  transition: background-color 0.2s ease;
}

.back-button:hover {
  background-color: #f0f2f5;
}

.back-button .v-icon {
  font-size: 20px;
  color: #1e2251;
}

.dashboard-title {
  font-size: 36px;
  font-weight: 700;
  color: #1e2251;
  margin: 0; /* flexbox 사용 시 auto margin 제거 */
  text-align: center;
  flex-grow: 1; /* 남은 공간을 차지하여 중앙 정렬을 돕습니다 */
}

.dashboard-subtitle {
  font-size: 18px;
  color: #4a507f;
  text-align: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e0e0e0;
}

/* Grid Layouts */
.top-section-grid {
  display: grid;
  grid-template-columns: 2fr 1fr; /* AI Summary (2) : Avg Score (1) */
  gap: 25px;
  margin-bottom: 25px;
}

.bottom-section-grid {
  /* 새로 추가된 그리드 컨테이너 */
  display: grid;
  grid-template-columns: 1fr 1fr; /* Tag 분석 (1) : 점수 분포 (1) */
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
  color: #1e2251;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #dcdfe6;
  text-align: center;
}

/* AI Summary Card */
.ai-summary-card .card-title {
  text-align: left;
  border-bottom: none;
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

.ai-summary-item {
  margin-bottom: 5px; /* 각 AI 요약 항목 간 간격 */
}

.ai-summary-item h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1e2251;
  margin-bottom: 8px;
}

.ai-summary-item p {
  font-size: 15px;
  line-height: 1.6;
  color: #555;
}

.ai-summary-item ul {
  list-style: disc;
  padding-left: 20px;
  margin: 0;
  font-size: 14px;
  color: #555;
}

.ai-summary-item ul li {
  margin-bottom: 5px;
}

.highlight-success {
  font-weight: bold;
  color: #28a745; /* Green */
}

.highlight-fail {
  font-weight: bold;
  color: #dc3545; /* Red */
}

.highlight-text {
  font-weight: bold;
  color: #1e2251;
}

.highlight-text-weakness {
  font-weight: bold;
  color: #e74c3c;
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
  color: #1e2251;
}

/* Chart Container Heights */
.chart-container {
  position: relative;
  width: 100%;
  display: flex; /* 그래프 중앙 정렬을 위해 추가 */
  justify-content: center; /* 그래프 중앙 정렬을 위해 추가 */
  align-items: center; /* 그래프 중앙 정렬을 위해 추가 */
}

/* 특정 차트의 높이 제어 */
.small-doughnut-chart {
  height: 180px; /* 도넛 차트의 높이 명시 */
  max-width: 180px; /* 도넛 차트의 최대 너비 */
  margin-top: 20px;
}

.default-bar-chart {
  height: 250px; /* 막대 차트의 높이 명시 */
}

.default-line-chart {
  height: 250px; /* 라인 차트의 높이 명시 */
}

/* 문서별 성과 차트 높이 */
.document-performance-chart {
  height: 200px; /* 문서 개수에 따라 적절히 조절 */
  margin-top: 10px;
}

/* Problem Accuracy Card (full width) */
.problem-accuracy-card.full-width-section {
  grid-column: 1 / -1; /* 전체 너비 차지 */
  margin-bottom: 25px; /* 하단 여백 추가 */
}

.problem-accuracy-card .controls {
  display: flex;
  justify-content: flex-end;
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
  border-color: #1e2251;
  box-shadow: 0 0 0 0.2rem rgba(30, 34, 81, 0.25);
}

/* Problem Detail Table (문항별 상세 분석 표) */
.problem-detail-table-container {
  margin-top: 30px;
  overflow-x: auto;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
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
  white-space: nowrap;
}

.problem-detail-table .problem-row {
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.problem-detail-table .problem-row:hover {
  background-color: #f5f5f5;
}

.problem-detail-table td {
  background-color: #ffffff;
  white-space: nowrap;
}

.problem-detail-table .low-accuracy {
  color: #dc3545;
  font-weight: 600;
}

.problem-detail-row td {
  background-color: #fcfcfc;
  padding: 15px;
  text-align: left;
}

.detail-content {
  padding: 10px 0;
  border-top: 1px dashed #e0e0e0;
  margin-top: 10px;
  font-size: 13px;
  line-height: 1.6;
  color: #666;
}

.detail-content p {
  margin-bottom: 8px;
}

.detail-content strong {
  color: #333;
}

.tag-chip {
  display: inline-block;
  background-color: #e0e4f0;
  color: #1e2251;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  margin-right: 5px;
  margin-bottom: 3px;
  white-space: nowrap;
}

/* Tag Analysis Card */
.tag-analysis-card {
  align-items: center;
}

.tag-analysis-summary {
  font-size: 16px;
  color: #495057;
  text-align: center;
  line-height: 1.6;
  margin-top: 20px;
}

.tag-analysis-summary .highlight-tag {
  font-weight: 700;
  color: #1e2251;
}

/* Learner Correctness Table Card */
.learner-correctness-table-card.full-width-section {
  grid-column: 1 / -1; /* 전체 너비 차지 */
  overflow-x: auto; /* 테이블이 넘칠 경우 스크롤 허용 */
}

.learner-correctness-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  color: #343a40;
  min-width: 800px; /* 테이블 최소 너비 설정, 내용이 많아지면 유용 */
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
  z-index: 1;
}

.learner-correctness-table td {
  background-color: #ffffff;
}

.learner-correctness-table tbody tr:hover {
  background-color: #f5f5f5;
}

.learner-correctness-table td.correct {
  color: #28a745;
  font-weight: 600;
}

.learner-correctness-table td.incorrect {
  color: #dc3545;
  font-weight: 600;
}

/* Responsive Design */
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
    grid-template-columns: 1fr; /* 상단 섹션도 한 줄로 쌓이도록 */
  }
  .bottom-section-grid {
    grid-template-columns: 1fr; /* 하단 섹션도 한 줄로 쌓이도록 */
  }
  .dashboard-card {
    padding: 20px;
  }
  .card-title {
    font-size: 18px;
  }

  /* 테이블은 모바일에서 스크롤되도록 유지 */
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
    flex-direction: column; /* 제목과 버튼이 세로로 쌓이도록 */
    align-items: flex-start; /* 왼쪽 정렬 */
  }
  .back-button {
    align-self: flex-end; /* 버튼만 오른쪽으로 */
    margin-top: 10px; /* 제목과의 간격 */
  }
  .dashboard-title {
    text-align: left;
    margin: 0;
  }
}
</style>
