<template>
  <div class="trainee-test-result-sidebar-content">
    <div class="sidebar-header-content">
      <div class="sidebar-title">문제</div>
    </div>

    <ul class="question-list">
      <li
        v-for="(item, idx) in questions"
        :key="idx"
        class="question-item"
        :class="{ active: item.isCurrent }"
        @click="goTo(idx)"
      >
        <span class="question-label">Q{{ String(item.questionNum).padStart(2, '0') }}</span>
        <span class="status" :class="item.isCorrect ? 'correct' : 'wrong'">
          {{ item.isCorrect ? 'O' : 'X' }}
        </span>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
// Props와 Emit 타입 정의
interface QuestionStatusItem {
  questionNum: number; // 1부터 시작하는 문제 번호
  isCorrect: boolean;
  isCurrent: boolean;
}

const props = defineProps<{
  questions: QuestionStatusItem[];
  currentIndex: number;
}>();

const emit = defineEmits<{
  (e: 'select', index: number): void;
}>();

const goTo = (index: number) => {
  emit('select', index);
};
</script>

<style scoped>
/* CSS 변수 정의 (필요시 TraineeTestResult.vue 또는 전역 스타일에 맞게 조정) */
:root {
  /* --sidebar-bg-color는 SideBar.vue 또는 TraineeTestResult.vue에서 설정 */
  --sidebar-text-color: #ffffff;
  --sidebar-hover-bg: rgba(255, 255, 255, 0.1);
  --sidebar-active-bg: rgba(255, 255, 255, 0.15);
  --correct-status-bg: #dcfce7; /* 연한 초록색 */
  --correct-status-text: #166534; /* 진한 초록색 */
  --wrong-status-bg: #fee2e2; /* 연한 빨간색 */
  --wrong-status-text: #991b1b; /* 진한 빨간색 */
}

/* 이 컴포넌트의 루트 요소. SideBar.vue의 슬롯으로 들어감 */
.trainee-test-result-sidebar-content {
  display: flex;
  flex-direction: column;
  height: 100%; /* SideBar.vue의 슬롯 공간을 채움 */
  overflow: hidden;
  width: 100%;
}

.sidebar-header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 48px; /* 헤더 높이 */
  padding: 10px 4px 10px 8px;
  /* background-color와 color는 SideBar.vue에서 상위 요소에 의해 결정될 가능성 있음 */
  color: var(--sidebar-text-color);
  font-weight: bold;
  font-size: 24px;
  position: sticky;
  top: 0;
  z-index: 10;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.sidebar-title {
  padding-left: 8px;
}

.question-list {
  flex: 1; /* 남은 공간을 차지하여 스크롤 가능하게 함 */
  overflow-y: auto;
  padding: 8px 0;
  margin: 0;
  width: 100%;
  list-style: none;
}

.question-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  font-size: 14px;
  border-radius: 8px;
  margin: 4px 8px;
  cursor: pointer;
  color: var(--sidebar-text-color);
  transition: background-color 0.2s ease;
}

.question-item.active {
  background-color: var(--sidebar-active-bg);
  font-weight: bold;
}

.question-item:hover {
  background-color: var(--sidebar-hover-bg);
}

.question-label {
  flex-grow: 1;
  margin-right: 10px;
}

.status {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: 24px;
  height: 24px;
  font-size: 13px;
  border-radius: 50%;
  font-weight: bold;
  line-height: 1;
  flex-shrink: 0;
}

.correct {
  background-color: var(--correct-status-bg);
  color: var(--correct-status-text);
}

.wrong {
  background-color: var(--wrong-status-bg);
  color: var(--wrong-status-text);
}
</style>