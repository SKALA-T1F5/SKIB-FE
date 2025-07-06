<template>
  <section class="dashboard-card ai-summary-card">
    <div class="card-header">
      <h2 class="card-title">AI 테스트 결과 요약</h2>
      <button @click="$emit('download')" class="download-card-button">
        <v-icon>mdi-download</v-icon>
      </button>
    </div>
    <div class="ai-summary-content">
      <!-- 아이콘과 시험 목표, 종합 평가를 하나의 그리드로 구성 -->
      <div class="exam-overview-grid">
        <!-- 왼쪽 아이콘 영역 -->
        <div class="readiness-emoji-container">
          <span
            class="readiness-emoji-main"
            :title="`프로젝트 준비도: ${aiOutputData.projectReadiness}`"
          >
            {{ getReadinessEmoji(aiOutputData.projectReadiness) }}
          </span>
        </div>

        <!-- 오른쪽 상단: 시험 목표 -->
        <div class="exam-goal-section">
          <h3>시험 목표</h3>
          <p>{{ aiOutputData.examGoal }}</p>
        </div>

        <!-- 오른쪽 하단: 종합 평가 -->
        <div class="overall-evaluation-section">
          <h3>종합 평가</h3>
          <div class="overall-evaluation">
            <div class="evaluation-content">
              <p>{{ aiOutputData.overallEvaluation }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 3. 문서별 정답률 (표 형태) -->
      <div class="ai-summary-item">
        <h3>문서별 정답률</h3>
        <div class="document-table-container">
          <table class="document-table">
            <thead>
              <tr>
                <th class="col-document-name">문서명</th>
                <th class="col-accuracy-rate">정답률</th>
                <th class="col-comment">평가</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(doc, index) in aiOutputData.performanceByDocument" :key="index">
                <td class="document-name">{{ doc.documentName }}</td>
                <td class="accuracy-rate">
                  <span :class="getAccuracyClass(doc.averageCorrectRate)">
                    {{ doc.averageCorrectRate.toFixed(1) }}%
                  </span>
                </td>
                <td class="comment">{{ doc.comment }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 4. 강점 및 약점 (표 형태) -->
      <div class="ai-summary-item">
        <h3>강점 및 약점</h3>
        <div class="insights-table-container">
          <table class="insights-table">
            <thead>
              <tr>
                <th>구분</th>
                <th>내용</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(insight, index) in aiOutputData.insights" :key="index">
                <td class="insight-type">
                  <span :class="insight.type === 'strength' ? 'type-strength' : 'type-weakness'">
                    {{ insight.type === 'strength' ? '강점' : '약점' }}
                  </span>
                </td>
                <td class="insight-content" v-html="formatInsightText(insight.text)"></td>
              </tr>
            </tbody>
          </table>
        </div>
        <!-- 주요 개선점을 강점 및 약점 아래에 텍스트로 추가 -->
        <div v-if="aiOutputData.improvementPoints" class="improvement-points-section">
          <h4>주요 개선점</h4>
          <p>{{ aiOutputData.improvementPoints }}</p>
        </div>
      </div>

      <!-- 5. 제안 주제 (카드 형태) -->
      <div class="ai-summary-item">
        <h3>제안 주제</h3>
        <div class="suggested-topics-cards">
          <div
            class="topic-card"
            v-for="(topic, index) in aiOutputData.suggestedTopics"
            :key="index"
            @click="navigateToTestCreation(topic)"
          >
            <v-icon class="topic-icon" size="19">mdi-lightbulb-on</v-icon>
            <div class="topic-content">{{ topic }}</div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const props = defineProps({
  aiOutputData: {
    type: Object,
    required: true,
  },
})

defineEmits(['download'])

// 데이터 존재 여부 확인
const hasData = computed(() => {
  return (
    props.aiOutputData &&
    (props.aiOutputData.examGoal ||
      props.aiOutputData.performanceByDocument.length > 0 ||
      props.aiOutputData.insights.length > 0 ||
      props.aiOutputData.improvementPoints ||
      props.aiOutputData.suggestedTopics.length > 0 ||
      props.aiOutputData.overallEvaluation ||
      props.aiOutputData.projectReadiness)
  )
})

// 정답률에 따른 클래스 반환
const getAccuracyClass = (rate) => {
  if (rate >= 75) return 'accuracy-high'
  if (rate >= 60) return 'accuracy-medium'
  return 'accuracy-low'
}

// 프로젝트 준비도에 따른 이모지 반환
const getReadinessEmoji = (readiness) => {
  switch (readiness.toUpperCase()) {
    case 'EXCELLENT':
      return '🎉'
    case 'GOOD':
      return '😊'
    case 'FAIR':
      return '😐'
    case 'POOR':
      return '😞'
    case 'FAIL':
      return '😢'
    default:
      return '😐'
  }
}

// 인사이트 텍스트에서 태그 포맷팅 (작은따옴표로 감싸진 태그만 처리)
const formatInsightText = (text) => {
  // 작은따옴표로 감싸진 태그만 처리
  const formatted = text.replace(/'([^']+)'/g, '<span class="tag-highlight">$1</span>')
  return formatted
}

// 현재 프로젝트 ID 가져오기
const getCurrentProjectId = () => {
  // 현재 라우트에서 projectId를 가져오거나, 다른 방법으로 프로젝트 ID를 획득
  return route.params.projectId || route.query.projectId
}

// 테스트 생성 페이지로 이동
const navigateToTestCreation = (topic) => {
  const projectId = getCurrentProjectId()
  
  if (!projectId) {
    console.error('프로젝트 ID를 찾을 수 없습니다.')
    return
  }

  const targetRoute = {
    path: `https://skib-frontend.skala25a.project.skala-ai.com/trainer/project/${projectId}/test`,
    query: { 
      step: 'prompt'
    },
  }
  
  const resolvedRoute = router.resolve(targetRoute)
  console.log('라우팅 주소:', resolvedRoute.href) // 라우팅 주소 콘솔 출력
  
  router.push(targetRoute)
}
</script>

<style scoped>
.dashboard-card {
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  padding: 25px;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  width: 100%;
  min-width: 300px;
  max-width: 100%;
  overflow: hidden;
}

.ai-summary-card {
  height: 100%;
  justify-content: flex-start;
}

.card-header {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #dcdfe6;
  position: relative;
}

.card-title {
  font-size: 22px;
  font-weight: 600;
  color: #1e2251;
  margin: 0;
  text-align: center;
}

.download-card-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  border-radius: 6px;
  transition: background-color 0.2s ease;
  color: #1e2251;
  position: absolute;
  right: 0;
  top: 0;
}

.download-card-button:hover {
  background-color: #f0f2f5;
}

.download-card-button .v-icon {
  font-size: 18px;
  color: #1e2251;
}

.ai-summary-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
  font-size: 14px;
  color: #495057;
  flex-grow: 1;
  overflow-y: auto;
}

/* 로딩 상태 스타일 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-grow: 1;
  padding: 60px 20px;
  min-height: 300px;
}

.loading-gif {
  width: 80px;
  height: 80px;
  margin-bottom: 20px;
  object-fit: contain;
}

.loading-text {
  font-size: 16px;
  color: #1e2251;
  font-weight: 500;
  text-align: center;
  margin: 0;
  line-height: 1.5;
}

.ai-summary-item {
  margin-bottom: 5px;
}

/* 시험 개요 그리드 레이아웃 */
.exam-overview-grid {
  display: grid;
  grid-template-columns: 80px 1fr;
  grid-template-rows: auto auto;
  gap: 20px;
  margin-bottom: 25px;
}

.readiness-emoji-container {
  grid-row: 1 / 3;
  display: flex;
  align-items: center;
  justify-content: center;
}

.readiness-emoji-main {
  font-size: 40px;
  cursor: help;
  transition: transform 0.2s ease;
}

.readiness-emoji-main:hover {
  transform: scale(1.1);
}

.exam-goal-section,
.overall-evaluation-section {
  margin-bottom: 5px;
}

.exam-goal-section h3,
.overall-evaluation-section h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1e2251;
  margin-bottom: 12px;
  padding-bottom: 5px;
  border-bottom: 2px solid #e9ecef;
}

.exam-goal-section p,
.overall-evaluation-section p {
  font-size: 14px;
  line-height: 1.6;
  color: #555;
  margin: 0;
}

/* 일반 ai-summary-item의 h3 스타일 */
.ai-summary-item h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1e2251;
  margin-bottom: 12px;
  padding-bottom: 5px;
  border-bottom: 2px solid #e9ecef;
}

.ai-summary-item p {
  font-size: 14px;
  line-height: 1.6;
  color: #555;
  margin: 0;
}

/* 문서별 정답률 표 - 4:1:5 비율 적용 */
.document-table-container {
  overflow-x: auto;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin-top: 8px;
}

.document-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  table-layout: fixed;
}

.document-table th,
.document-table td {
  padding: 10px 12px;
  text-align: left;
  border-bottom: 1px solid #f0f2f5;
}

.document-table th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #495057;
  white-space: nowrap;
  position: sticky;
  top: 0;
  z-index: 1;
  text-align: center;
}

.col-document-name {
  width: 33.33%;
}

.col-accuracy-rate {
  width: 11.11%;
}

.col-comment {
  width: 55.56%;
}

.document-table .document-name {
  font-weight: 500;
  word-break: break-word;
}

.document-table .accuracy-rate {
  text-align: center;
  white-space: nowrap;
}

.accuracy-high {
  color: #28a745;
  font-weight: 600;
}

.accuracy-medium {
  color: #f39c12;
  font-weight: 600;
}

.accuracy-low {
  color: #dc3545;
  font-weight: 600;
}

.document-table .comment {
  font-size: 12px;
  line-height: 1.4;
  color: #666;
  word-break: break-word;
}

@media (max-width: 1024px) {
  .exam-overview-grid {
    gap: 15px;
  }
}

@media (max-width: 768px) {
  .exam-overview-grid {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto auto;
    gap: 15px;
  }

  .readiness-emoji-container {
    grid-row: 1 / 2;
    grid-column: 1 / 2;
    align-self: center;
    justify-self: center;
  }

  .readiness-emoji-main {
    font-size: 32px;
  }

  .document-table th,
  .document-table td {
    padding: 8px;
    font-size: 12px;
  }

  .document-table .comment {
    font-size: 11px;
  }
}

/* 강점 및 약점 표 - 반응형 개선 */
.insights-table-container {
  overflow-x: auto;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin-top: 8px;
}

.insights-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.insights-table th,
.insights-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #f0f2f5;
  vertical-align: top;
}

.insights-table th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #495057;
  white-space: nowrap;
}

.insight-type {
  width: 80px;
  text-align: center;
}

.type-strength {
  background-color: #d4edda;
  color: #155724;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.type-weakness {
  background-color: #f8d7da;
  color: #721c24;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.insight-content {
  line-height: 1.5;
  color: #555;
  word-break: break-word;
}

.insight-content :deep(.tag-highlight) {
  background-color: #f8f9fa;
  color: #495057;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  margin: 0 2px;
  display: inline-block;
  white-space: nowrap;
}

@media (max-width: 768px) {
  .insights-table th,
  .insights-table td {
    padding: 8px;
    font-size: 12px;
  }

  .insight-type {
    width: 60px;
  }

  .type-strength,
  .type-weakness {
    font-size: 10px;
    padding: 3px 6px;
  }
}

/* 제안 주제 카드 - 반응형 디자인 적용 */
.suggested-topics-cards {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 8px;
}

.topic-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #f9f9f9;
  transition: all 0.2s ease-in-out;
  flex: 1;
  min-width: 250px;
  max-width: calc(33.333% - 10.666px);
  min-height: 120px;
  cursor: pointer;
  box-shadow: none;
  position: relative;
  overflow: hidden;
}

.topic-card:hover {
  background-color: #f0f0f0;
  border-color: #1e2251;
  box-shadow: 0 4px 12px rgba(30, 34, 81, 0.15);
  transform: translateY(-2px);
}

.topic-card:focus-within {
  outline: 2px solid #1e2251;
  outline-offset: 2px;
}

.topic-icon {
  color: #1e2251;
  margin-bottom: 6px;
  flex-shrink: 0;
}

.topic-content {
  flex: 1;
  font-size: 13px;
  line-height: 1.5;
  color: #555;
  font-weight: 500;
  word-break: break-word;
  hyphens: auto;
}

/* 주요 개선점 섹션 스타일 */
.improvement-points-section {
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid #e9ecef;
}

.improvement-points-section h4 {
  font-size: 16px;
  font-weight: 600;
  color: #1e2251;
  margin-bottom: 10px;
}

.improvement-points-section p {
  font-size: 14px;
  line-height: 1.6;
  color: #555;
  margin: 0;
}

/* 반응형 디자인 */
@media (max-width: 1200px) {
  .topic-card {
    max-width: calc(50% - 8px);
    min-width: 200px;
  }
}

@media (max-width: 768px) {
  .suggested-topics-cards {
    gap: 12px;
  }

  .topic-card {
    max-width: 100%;
    min-width: 100%;
    min-height: 100px;
  }
}

@media (max-width: 480px) {
  .topic-card {
    padding: 12px;
    min-height: 90px;
  }

  .topic-content {
    font-size: 12px;
  }
}
</style>