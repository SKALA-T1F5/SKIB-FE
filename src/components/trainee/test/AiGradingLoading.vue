<template>
  <div class="ai-grading-overlay" v-if="show">
    <div class="ai-grading-card">
      <div class="loading-spinner"></div>
      <p class="loading-text">AI 채점 진행 중...</p>
      <p class="sub-text">잠시만 기다려주세요.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';

const props = defineProps<{
  show: boolean;
}>();
</script>

<style scoped>
.ai-grading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999; /* 다른 모든 요소 위에 표시 */
}

.ai-grading-card {
  background-color: #ffffff;
  border-radius: 12px;
  padding: 40px 50px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.25);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  max-width: 450px;
  width: 90%;
  box-sizing: border-box;
}

.loading-spinner {
  border: 6px solid #f3f3f3;
  border-top: 6px solid #4CAF50; /* 초록색 스피너 */
  border-radius: 50%;
  width: 60px;
  height: 60px;
  animation: spin 1.5s linear infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  font-size: 24px;
  font-weight: 700;
  color: #343a40;
  margin: 0;
}

.sub-text {
  font-size: 16px;
  color: #6c757d;
  margin: 0;
}
</style>