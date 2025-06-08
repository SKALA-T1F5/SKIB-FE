<template>
  <div class="question-display-section" :class="{ 'exam-mode': isExamMode }">
    <div class="question-text-fixed">
      <p class="question-text">{{ currentQuestion.questionText }}</p>
    </div>
    <div class="question-content-scrollable">
      <div class="options-container" v-if="currentQuestion.type === 'OBJECTIVE'">
        <OptionItem
          v-for="(option, index) in currentQuestion.options"
          :key="index"
          :option="option"
          :optionLabel="getOptionLabel(index)"
          :isSelected="currentQuestion.userAnswer === option"
          :isCorrectAnswer="option === currentQuestion.correctAnswer"
          :isWrongAnswer="currentQuestion.userAnswer === option && option !== currentQuestion.correctAnswer"
          :isExamMode="isExamMode"
          @selectOption="$emit('selectOption', option)"
        />
      </div>
      <SubjectiveAnswerInputDisplay
        v-else-if="currentQuestion.type === 'SUBJECTIVE'"
        :userAnswer="currentQuestion.userAnswer"
        :correctAnswer="currentQuestion.correctAnswer"
        :isExamMode="isExamMode"
        @update:userAnswer="(newValue) => $emit('update:userAnswer', newValue)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';
import OptionItem from '@/components/trainee/result/OptionItem.vue'; // 새 컴포넌트 임포트
import SubjectiveAnswerInputDisplay from '@/components/trainee/result/SubjectiveAnswerInputDisplay.vue'; // 새 컴포넌트 임포트
import { QuestionData } from '@/pages/trainee/TraineeTestResult_v2.vue';

defineProps<{
  currentQuestion: QuestionData;
  getOptionLabel: (index: number) => string;
  isExamMode: boolean; // 응시 모드 여부
}>();

// 주관식 답변 업데이트 및 객관식 선택 이벤트 정의
defineEmits(['update:userAnswer', 'selectOption']);
</script>

<style scoped>
.question-display-section {
  background-color: #ffffff;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  flex-shrink: 0;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  height: 350px; /* 결과 화면에서의 고정 높이 */
  overflow: hidden;
}

/* 응시 모드일 때의 스타일 변경 (예시: 높이, 글자 크기 등) */
.question-display-section.exam-mode {
  height: 400px; /* 응시 화면에서는 더 높게 */
  padding: 25px; /* 패딩 조절 */
}

.question-text-fixed {
  flex-shrink: 0;
  margin-bottom: 20px;
}

.question-text {
  font-size: 17px; /* 결과 화면 문제 텍스트 크기 */
  line-height: 1.7;
  margin: 0;
  color: #495057;
}

/* 응시 모드일 때의 문제 텍스트 크기 */
.exam-mode .question-text {
  font-size: 18px; /* 응시 화면에서는 문제 텍스트를 더 크게 */
}

.question-content-scrollable {
  flex-grow: 1;
  overflow-y: auto;
  padding-right: 10px;
}

/* 스크롤바 스타일 */
.question-content-scrollable::-webkit-scrollbar {
  width: 6px;
}
.question-content-scrollable::-webkit-scrollbar-track {
  background: transparent;
}
.question-content-scrollable::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
}
.question-content-scrollable::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.4);
}

.options-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
}
</style>