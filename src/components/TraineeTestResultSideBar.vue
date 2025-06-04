<template>
  <div class="sidebar-container">
    <!-- 상단: 아이콘 + 제목 -->
    <div class="sidebar-header">
      <div class="sidebar-title">문제</div>
    </div>

    <!-- 문제 목록 -->
    <ul class="question-list">
      <li
        v-for="(item, idx) in questions"
        :key="idx"
        class="question-item"
        :class="{ active: idx === currentIndex }"
        @click="goTo(idx)"
      >
        <span class="question-label">Q{{ String(idx + 1).padStart(2, '0') }}</span>
        <span class="status" :class="item.correct ? 'correct' : 'wrong'">
          {{ item.correct ? 'O' : 'X' }}
        </span>
      </li>
    </ul>
  </div>
</template>

<script setup>
const props = defineProps({
  questions: Array,
  currentIndex: Number,
})

const emit = defineEmits(['select'])

const goTo = (index) => {
  emit('select', index)
}
</script>

<style scoped>
.sidebar-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  width: 100%;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 48px;
  padding: 10px 4px 10px 8px;
  background-color: #1e2251;
  color: white;
  font-weight: bold;
  font-size: 24px;
  position: sticky;
  top: 0;
  z-index: 10;
  border-bottom: none;
}

.sidebar-header::after {
  content: '';
  position: absolute;
  bottom: -7px;
  left: 0;
  right: 0;
  height: 1px;
  background-color: rgba(255, 255, 255, 0.2);
}

.sidebar-title {
  padding-left: 8px;
}

.question-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
  margin: 0;
  width: 100%;
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
  color: white;
  transition: background-color 0.2s;
}

.question-item.active {
  background-color: rgba(255, 255, 255, 0.15);
}

.question-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.status {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: 20px;
  height: 20px;
  font-size: 12px;
  border-radius: 50%;
  font-weight: bold;
  line-height: 1;
}

.correct {
  background-color: #8aff8a;
  color: #000;
}

.wrong {
  background-color: #ff8a8a;
  color: #000;
}

.question-label {
  flex: 1;
}
</style>
