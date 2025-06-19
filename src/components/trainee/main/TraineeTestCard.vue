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
        <button class="action-button" @click="$emit('retake-action', test.testId)">
          채점 결과
        </button>
        <button class="action-button" @click="$emit('feedback', test.testId)">피드백</button>
        <button
          v-if="test.isRetake"
          :class="['action-button', 'retake-button', { 'disabled-retake': test.retake === 1 }]"
          :disabled="test.retake === 1"
          @click="$emit('attend', test.testId)"
        >
          재응시
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
// No changes to script setup needed beyond the click handler.

const props = defineProps({
  test: Object,
})

// 'retake' 이벤트를 'retake-action'으로 변경하여 이름 충돌 방지 및 명확성 부여
const emit = defineEmits(['retake-action', 'feedback', 'attend'])

const formatTime = (minutes) => {
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return `${String(hours).padStart(2, '0')}:${String(remainingMinutes).padStart(2, '0')}:00`
}

// handleRetakeClick is no longer needed as we're directly emitting 'attend'
// const handleRetakeClick = () => {
//   if (props.test.isRetake && props.test.retake === 0) {
//     emit('attend', props.test.testId);
//   }
// };
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
  min-width: 280px;
  max-width: 100%;
  height: auto;
  min-height: 220px;
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
  background-color: #4caf50; /* 초록색 */
}

.status-tag.fail {
  background-color: #f44336; /* 빨간색 */
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
  flex-wrap: wrap;
  gap: 8px;
}

.test-time {
  font-size: 12px;
  color: #999;
  white-space: nowrap;
}

.test-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
  margin-left: auto;
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

/* 재응시 버튼 스타일 */
.action-button.retake-button {
  background-color: #191d5a; /* 활성화 시 색상 */
  color: white;
  border-color: #191d5a;
}

.action-button.retake-button:hover:not(:disabled) {
  background-color: #0c0f3c; /* 활성화 버튼 호버 시 더 진한 색상 */
  border-color: #0c0f3c;
}

.action-button.disabled-retake {
  background-color: #cccccc; /* 비활성화 시 회색 */
  color: #666666;
  border-color: #cccccc;
  cursor: not-allowed;
  opacity: 0.7;
}

/* 기존 primary 스타일은 재응시 버튼에 적용되지 않도록 주의 */
.action-button.primary {
  background-color: #007bff;
  color: white;
  border-color: #007bff;
}

.action-button.primary:hover {
  background-color: #0056b3;
}
</style>
