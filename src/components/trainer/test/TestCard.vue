<template>
  <v-card class="test-card-trainer" elevation="0">
    <div class="test-card-header">
      <h3 class="test-title">{{ test.name }}</h3>
      <v-icon size="18" color="#191d5a" @click.stop="copyLink(test.id)">mdi-link-variant</v-icon>
    </div>

    <p class="test-description">
      난이도: <span class="difficulty-level">{{ test.difficulty }}</span>
    </p>
    <p class="test-description">제한 시간: {{ test.timeLimit }}분</p>
    <p class="test-description">합격 기준 점수: {{ test.passingScore }}점</p>
    <p class="test-description">생성일: {{ formattedCreatedAt }}</p>
    <p class="test-description">재응시 여부: {{ test.retakeable ? '가능' : '불가능' }}</p>

    <div class="statistics-visual-section">
      <div class="visual-item">
        <div class="progress-bar-label">
          <span class="visual-label">합격률</span>
          <span class="visual-value"
            >{{ test.passCount }}명 / {{ test.totalApplicants }}명 ({{ passRatePercentage }}%)</span
          >
        </div>
        <div class="progress-bar-container">
          <div class="progress-bar primary-bar" :style="{ width: passRatePercentage + '%' }"></div>
        </div>
      </div>
      <div class="visual-item">
        <div class="progress-bar-label">
          <span class="visual-label">평균 점수</span>
          <span class="visual-value">{{ test.averageScore }}점</span>
        </div>
        <div class="progress-bar-container">
          <div class="progress-bar primary-bar" :style="{ width: test.averageScore + '%' }"></div>
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
      <button class="action-button-trainer delete-button" @click="confirmDelete(test.id)">
        <v-icon size="18" class="mr-1">mdi-delete</v-icon> 삭제
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
      createdAt: 'yyyy-mm-dd', // 이 형식으로 들어올 것을 가정합니다.
      retakeable: false,
      passCount: 0,
      totalApplicants: 0,
      averageScore: 0,
    }),
  },
})

// 'delete-test' 이벤트 추가
const emit = defineEmits(['copy-link', 'go-to-questions', 'go-to-dashboard', 'delete-test'])

const copyLink = (id) => {
  emit('copy-link', id)
}

const goToQuestions = (id) => {
  emit('go-to-questions', id)
}

const goToDashboard = (id) => {
  emit('go-to-dashboard', id)
}

// 삭제 확인 및 이벤트 발생 함수
const confirmDelete = (id) => {
  if (confirm('정말로 이 테스트를 삭제하시겠습니까? 관련 데이터도 함께 삭제됩니다.')) {
    emit('delete-test', id)
  }
}

// 합격률 계산
const passRatePercentage = computed(() => {
  if (props.test.totalApplicants === 0) return 0
  return ((props.test.passCount / props.test.totalApplicants) * 100).toFixed(0)
})

// formattedCreatedAt computed 속성 추가
const formattedCreatedAt = computed(() => {
  if (!props.test.createdAt) {
    return '' // test.createdAt이 없을 경우 빈 문자열 반환
  }
  const dateParts = props.test.createdAt.split('-') // "YYYY-MM-DD"를 "-" 기준으로 분리
  if (dateParts.length === 3) {
    const year = dateParts[0]
    const month = dateParts[1]
    const day = dateParts[2]
    return `${year}년 ${month}월 ${day}일`
  }
  return props.test.createdAt // 형식이 맞지 않을 경우 원본 반환
})
</script>

<style scoped>
/* 기존 스타일 유지 */
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

  width: 100%;
  height: 100%;
  min-height: 380px;
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
  color: #191d5a; /* 강조 색상 적용 */
}

.statistics-visual-section {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 15px;
  padding: 15px;
  background-color: #eef2f7;
  border-radius: 6px;
  margin-top: 15px;
  margin-bottom: 20px;
}

.visual-item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  gap: 8px;
}

.progress-bar-label {
  display: flex;
  justify-content: space-between;
  width: 100%;
  align-items: flex-end;
}

.visual-label {
  font-size: 13px;
  color: #777;
  margin-bottom: 0;
}

.visual-value {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.progress-bar-container {
  width: 100%;
  height: 8px;
  background-color: #ddd;
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  border-radius: 4px;
  transition: width 0.5s ease-out;
}

.progress-bar.primary-bar {
  /* 모든 프로그레스 바에 강조 색상 적용 */
  background-color: #191d5a;
}
/* 기존 .green-bar, .blue-bar는 제거하거나 .primary-bar로 대체 */

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
  background-color: #191d5a; /* 강조 색상 적용 */
  color: white;
  border-color: #191d5a; /* 강조 색상 적용 */
}

.action-button-trainer.primary-button:hover {
  background-color: #0c0f3c; /* 강조 색상에 맞춘 호버 색상 */
  border-color: #0c0f3c; /* 강조 색상에 맞춘 호버 색상 */
}

/* 삭제 버튼 스타일 추가 */
.action-button-trainer.delete-button {
  background-color: #ef5350; /* 붉은색 계열 */
  color: white;
  border-color: #ef5350;
}

.action-button-trainer.delete-button:hover {
  background-color: #c62828; /* 더 진한 붉은색 */
  border-color: #c62828;
}

.action-button-trainer .v-icon {
  margin-right: 5px;
}
</style>
