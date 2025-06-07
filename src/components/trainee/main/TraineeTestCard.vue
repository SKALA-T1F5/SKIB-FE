<template>
  <div class="test-card">
    <div :class="['status-tag', test.status.toLowerCase()]">
      {{ test.status }}
    </div>
    <h3 class="test-title">{{ test.name }}</h3>
    <p class="project-name">Project ID: {{ test.projectId }}</p>
    <p class="test-description">난이도: {{ test.difficultyLevel }}</p>
    <p class="test-score">점수: {{ test.actualScore }}점 / 합격: {{ test.passScore }}점</p>
    <div class="test-footer">
      <span class="test-time">제한 시간: {{ formatTime(test.limitedTimeM) }}</span>
      <div class="test-actions">
        <button
          class="action-button"
          @click="$emit('retake', test.testId)"
        >
          채점 결과
        </button>
        <button
          class="action-button"
          @click="$emit('feedback', test.testId)"
        >
          피드백
        </button>
        <button
          v-if="test.isRetake === 1 && test.status === 'FAIL'"
          class="action-button primary"
          @click="$emit('attend', test.testId)"
        >
          재응시
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Test } from '@/views/TraineeMain.vue';

const props = defineProps<{
  test: Test;
}>();

// emit 이벤트에 'attend' 다시 추가
const emit = defineEmits(['retake', 'feedback', 'attend']);

const formatTime = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  // 불필요한 Markdown 수식 태그를 제거하고 순수하게 시간 형식만 반환하도록 수정
  return `${String(hours).padStart(2, '0')}:${String(remainingMinutes).padStart(2, '0')}:00`;
};
</script>

<style scoped>
.test-card {
  background-color: #f8f8f8;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 25px; /* 패딩 증가 */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 350px; /* 기본 가로 크기 증가 */
  min-height: 220px; /* 세로 크기 증가 */
}

/* 상태 태그 (PASS/FAIL) */
.status-tag {
  position: absolute;
  top: 18px; /* 패딩에 맞춰 상단 위치 조정 */
  right: 18px; /* 패딩에 맞춰 우측 위치 조정 */
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
  color: white;
  text-transform: uppercase;
  min-width: 60px;
  text-align: center;
}

.status-tag.pass {
  background-color: #4CAF50; /* 초록색 */
}

.status-tag.fail {
  background-color: #F44336; /* 빨간색 */
}

/* 추가된 점수 정보 스타일 */
.test-score {
  font-size: 14px;
  color: #555;
  margin-bottom: 10px; /* 푸터와의 간격을 위해 조정 */
}

.test-title {
  font-size: 18px;
  font-weight: bold;
  margin-top: 20px; /* status-tag와의 간격 확보 */
  margin-bottom: 8px;
  color: #333;
}

.project-name {
  font-size: 14px;
  color: #777;
  margin-bottom: 4px;
}

.test-description {
  font-size: 14px;
  color: #555;
  margin-bottom: 10px; /* 점수 정보가 추가되면서 간격 조정 */
}

.test-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.test-time {
  font-size: 12px;
  color: #999;
}

.test-actions {
  display: flex;
  gap: 8px;
}

.action-button {
  background-color: #e0e0e0;
  color: #555;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 6px 12px;
  cursor: pointer;
  font-size: 12px;
  transition: background-color 0.2s ease;
  white-space: nowrap;
}

.action-button:hover {
  background-color: #d0d0d0;
}

.action-button.primary {
  background-color: #007bff;
  color: white;
  border-color: #007bff;
}

.action-button.primary:hover {
  background-color: #0056b3;
}
</style>