<template>
  <v-card class="test-card-trainer" elevation="0">
    <div class="test-card-header">
      <h3 class="test-title">{{ test.name }}</h3>
      <v-icon size="18" color="primary" @click.stop="copyLink(test.id)">mdi-link-variant</v-icon>
    </div>

    <p class="test-description">
      난이도: <span class="difficulty-level">{{ test.difficulty }}</span>
    </p>
    <p class="test-description">제한 시간: {{ test.timeLimit }}분</p>
    <p class="test-description">PASS 점수: {{ test.passingScore }}점</p>
    <p class="test-description">생성일: {{ test.createdAt }}</p>
    <p class="test-description">재응시 여부: {{ test.retakeable ? '가능' : '불가능' }}</p>

    <div class="statistics-visual-section">
      <div class="visual-item">
        <div class="doughnut-container">
          <div class="doughnut-chart" :style="doughnutChartStyle">
            <span class="doughnut-text">{{ passRatePercentage }}%</span>
          </div>
        </div>
        <div class="visual-info">
          <span class="visual-label">합격률</span>
          <span class="visual-value">{{ test.passCount }}명 / {{ test.totalApplicants }}명</span>
        </div>
      </div>
      <div class="visual-item">
        <div class="progress-bar-container">
          <div class="progress-bar" :style="{ width: test.averageScore + '%' }"></div>
        </div>
        <div class="visual-info">
          <span class="visual-label">평균 점수</span>
          <span class="visual-value">{{ test.averageScore }}점</span>
        </div>
      </div>
    </div>

    <div class="test-footer-trainer">
      <button class="action-button-trainer" @click="goToQuestions(test.id)">
        <v-icon size="18" class="mr-1">mdi-format-list-bulleted</v-icon> 문제목록
      </button>
      <button class="action-button-trainer primary-button" @click="goToDashboard(test.id)">
        <v-icon size="18" class="mr-1">mdi-chart-line</v-icon> 응시현황
      </button>
    </div>
  </v-card>
</template>

<script setup>
import { defineProps, defineEmits, computed } from 'vue'

const props = defineProps({
  test: {
    type: Object,
    required: true,
    default: () => ({
      id: null,
      name: '새 테스트',
      difficulty: 'NORMAL', // EASY, NORMAL, HARD 중 하나
      timeLimit: 0,
      passingScore: 0,
      createdAt: 'yyyy-mm-dd',
      retakeable: false,
      passCount: 0,
      totalApplicants: 0,
      averageScore: 0,
    }),
  },
})

const emit = defineEmits(['copy-link', 'go-to-questions', 'go-to-dashboard'])

const copyLink = (id) => {
  emit('copy-link', id)
}

const goToQuestions = (id) => {
  emit('go-to-questions', id)
}

const goToDashboard = (id) => {
  emit('go-to-dashboard', id)
}

// 합격률 계산
const passRatePercentage = computed(() => {
  if (props.test.totalApplicants === 0) return 0
  return ((props.test.passCount / props.test.totalApplicants) * 100).toFixed(0)
})

// 도넛 차트 스타일 계산 (CSS conic-gradient 사용)
const doughnutChartStyle = computed(() => {
  const percentage = passRatePercentage.value
  const visualPercentage = percentage > 0 ? percentage : 0.1 // 0%일 때도 시각적으로 표현
  return {
    background: `conic-gradient(#4CAF50 ${visualPercentage}%, #ddd ${visualPercentage}%)`,
  }
})
</script>

<style scoped>
.test-card-trainer {
  background-color: #f8f8f8;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 25px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  min-width: 280px;
  width: 100%;

  height: 100%;
  min-height: var(--test-card-min-height); /* 변수 사용 */
  flex-grow: 1;
  flex-shrink: 1;
  flex-basis: auto;
}

.test-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.test-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: calc(100% - 30px);
}

.test-description {
  font-size: 14px;
  color: #555;
  margin-bottom: 4px;
  white-space: normal;
}

.difficulty-level {
  font-weight: bold;
  color: #191d5a;
}

/* 통계 시각화 섹션 (가로 한 줄) */
.statistics-visual-section {
  display: flex; /* 가로 정렬 */
  flex-direction: row; /* 명시적으로 가로 정렬 */
  justify-content: space-around; /* 요소들을 균등하게 분배 */
  align-items: center; /* 세로 중앙 정렬 */
  gap: 12px;
  padding: 15px;
  background-color: #eef2f7;
  border-radius: 6px;
  margin-top: 15px;
  margin-bottom: 20px;
}

.visual-item {
  display: flex;
  flex-direction: column; /* 아이콘/바 아래로 텍스트 */
  align-items: center; /* 가운데 정렬 */
  gap: 8px;
  text-align: center; /* 텍스트 가운데 정렬 */
  flex: 1; /* 가로 공간 균등 분배 */
}

.visual-info {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  text-align: center; /* 텍스트 가운데 정렬 */
}

.visual-label {
  font-size: 13px;
  color: #777;
  margin-bottom: 2px;
}

.visual-value {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

/* 도넛 차트 (합격률) */
.doughnut-container {
  position: relative;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
}

.doughnut-chart {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.doughnut-chart::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 70%;
  height: 70%;
  border-radius: 50%;
  background-color: #f8f8f8;
  z-index: 1;
}

.doughnut-text {
  position: relative;
  font-size: 12px;
  font-weight: bold;
  color: #333;
  z-index: 2;
}

/* 진행 바 (평균 점수) */
.progress-bar-container {
  width: 60px;
  height: 8px;
  background-color: #ddd;
  border-radius: 4px;
  overflow: hidden;
  flex-shrink: 0;
}

.progress-bar {
  height: 100%;
  background-color: #2196f3;
  border-radius: 4px;
  transition: width 0.5s ease-out;
}

.test-footer-trainer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  gap: 8px;
  flex-wrap: wrap;
}

.action-button-trainer {
  flex: 1 1 48%;
  min-width: 100px;
  background-color: #e0e0e0;
  color: #555;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 8px 10px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
}

.action-button-trainer:hover {
  background-color: #d0d0d0;
  border-color: #b0b0b0;
}

.action-button-trainer.primary-button {
  background-color: #191d5a;
  color: white;
  border-color: #191d5a;
}

.action-button-trainer.primary-button:hover {
  background-color: #0c0f3c;
  border-color: #0c0f3c;
}

.action-button-trainer .v-icon {
  margin-right: 5px;
}
</style>
