<template>
  <main class="main-content-area">
    <div class="test-result-container-inner">
      <div class="top-nav">
        <h3 class="question-number-top" v-if="currentQuestion">{{ currentQuestion.id }}.</h3>
        <div class="nav-buttons-wrapper">
          <button class="nav-button" @click="$emit('goToPreviousQuestion')" :disabled="!hasPreviousQuestion">
            <svg-icon type="mdi" :path="mdiChevronLeft" class="nav-icon" /> 이전 문제
          </button>
          <button class="nav-button" @click="$emit('goToNextQuestion')" :disabled="!hasNextQuestion">
            다음 문제 <svg-icon type="mdi" :path="mdiChevronRight" class="nav-icon" />
          </button>
        </div>
      </div>

      <div class="question-solution-area" v-if="currentQuestion">
        <QuestionDisplay
          :currentQuestion="currentQuestion"
          :getOptionLabel="getOptionLabel"
          :isExamMode="isExamMode"
          @update:userAnswer="(newValue) => currentQuestion.userAnswer = newValue"
          @selectOption="(selectedOption) => { if (currentQuestion) currentQuestion.userAnswer = selectedOption; }"
        />
        <SolutionSection :currentQuestion="currentQuestion" />
      </div>
      <div v-else class="loading-message">
        <p>시험 결과를 로딩 중입니다...</p>
      </div>

      <div class="exit-button-container">
        <button class="exit-button" @click="$emit('exitTestResult')">나가기</button>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';
import SvgIcon from '@jamescoyle/vue-icon';
import { mdiChevronLeft, mdiChevronRight } from '@mdi/js';
import QuestionDisplay from './QuestionDisplay.vue'; // 새 컴포넌트 임포트
import SolutionSection from './SolutionSection.vue';
import { QuestionData } from '@/pages/trainee/TraineeTestResultLayout.vue';

defineProps<{
  currentQuestion: QuestionData | null;
  hasPreviousQuestion: boolean;
  hasNextQuestion: boolean;
  getOptionLabel: (index: number) => string;
  isExamMode: boolean; // 응시 모드 여부를 prop으로 받음
}>();

defineEmits(['goToPreviousQuestion', 'goToNextQuestion', 'exitTestResult']);
</script>

<style scoped>
.main-content-area {
  grid-area: main-content;
  display: flex;
  flex-direction: column;
  padding: 25px;
  overflow: hidden;
  gap: 25px;
  box-sizing: border-box;
  position: relative;
  min-height: 0;
}

/* Top Navigation */
.top-nav {
  display: flex;
  justify-content: space-between; /* 문제 번호와 버튼 그룹을 양 끝으로 정렬 */
  align-items: center; /* 수직 중앙 정렬 */
  margin-bottom: 25px;
  flex-shrink: 0;
}

.question-number-top {
  font-size: 26px; /* 기존 .question-number와 동일한 크기 */
  font-weight: 700;
  color: #343a40;
  margin: 0; /* 기본 마진 제거 */
  padding-right: 20px; /* 버튼과의 간격 확보 */
}

.nav-buttons-wrapper {
  display: flex;
  gap: 12px;
}

.nav-button {
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 10px 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  font-size: 15px;
  font-weight: 500;
  color: #495057;
  transition: all 0.2s ease-in-out;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.nav-button:hover:not(:disabled) {
  background-color: #f0f0f0;
  border-color: #d0d0d0;
  color: #343a40;
  transform: translateY(-1px);
}

.nav-button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
  background-color: #f8f9fa;
  color: #adb5bd;
}

.nav-icon {
  font-size: 20px;
  margin: 0 5px;
  color: #6c757d;
}
.nav-button:hover:not(:disabled) .nav-icon {
  color: #495057;
}


/* Question and Solution Area */
.question-solution-area {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  gap: 25px;
  min-height: 0;
}

/* Exit Button */
.exit-button-container {
  margin-top: 30px;
  text-align: left;
  flex-shrink: 0;
}

.exit-button {
  background-color: #34495e;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 25px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out, transform 0.1s ease-in-out;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.exit-button:hover {
  background-color: #2c3e50;
  transform: translateY(-1px);
}

.loading-message {
  background-color: #ffffff;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  text-align: center;
  color: #555;
  font-size: 17px;
  height: 250px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>