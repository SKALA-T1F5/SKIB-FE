<template>
  <div class="test-card">
    <div :class="['status-tag', test.isPassed ? 'pass' : 'fail']">
      {{ test.isPassed ? 'PASS' : 'FAIL' }}
    </div>
    <h3 class="test-title">{{ test.name }}</h3>
    <p class="test-description">난이도: {{ test.difficultyLevel }}</p>
    <p class="test-score">점수: {{ test.score }}점</p>
    <div class="test-footer">
      <span class="test-time">제한 시간: {{ formatTime(test.limitedTime) }}</span>
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
          v-if="test.retake && !test.isPassed"
          class="action-button primary"
          @click="$emit('attend', test.testId)"
        >
          재응시
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
// import type { Test } from '@/views/TraineeMain.vue'; // TypeScript 타입 정의 제거

const props = defineProps({
  // Test 인터페이스 대신 런타임 속성 검사 또는 단순히 Object로 선언
  test: Object, // Prop `test`는 객체여야 합니다.
});

const emit = defineEmits(['retake', 'feedback', 'attend']);

const formatTime = (minutes) => { // minutes: number 제거
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(remainingMinutes).padStart(2, '0')}:00`;
};
</script>

<style scoped>
.test-card {
  background-color: #f8f8f8;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 25px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  /* 기존 width 고정값을 제거하고 유동적인 크기 속성으로 변경 */
  min-width: 280px; /* 카드의 최소 너비 (너무 작아지지 않게) */
  max-width: 100%; /* 부모 컨테이너에 맞춰 최대 너비 100% */
  height: auto; /* 내용에 따라 높이 자동 조절 */
  min-height: 220px; /* 최소 높이 유지 */
  /* Grid 아이템으로서의 유연성을 위해 flex 속성 추가 (선택 사항이지만 일관성 유지에 좋음) */
  flex-grow: 1;
  flex-shrink: 1;
  flex-basis: auto;
}

/* 상태 태그 (PASS/FAIL) */
.status-tag {
  position: absolute;
  top: 18px;
  right: 18px;
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
  margin-bottom: 10px;
}

.test-title {
  font-size: 18px;
  font-weight: bold;
  margin-top: 20px;
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
  margin-bottom: 10px;
}

.test-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  /* 버튼들이 너무 많아지면 다음 줄로 넘어가도록 설정 */
  flex-wrap: wrap;
  /* 버튼 영역이 한 줄에 들어가지 않을 때 정렬 */
  gap: 8px;
}

.test-time {
  font-size: 12px;
  color: #999;
  white-space: nowrap; /* 시간 정보가 한 줄에 있도록 */
}

.test-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap; /* 버튼들이 공간이 부족할 때 다음 줄로 넘어가도록 */
  justify-content: flex-end; /* 버튼들을 오른쪽으로 정렬 */
  margin-left: auto; /* 왼쪽의 시간 정보와 간격을 벌리기 위해 */
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