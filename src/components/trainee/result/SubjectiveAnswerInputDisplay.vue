<template>
  <div class="subjective-answer-section">
    <div class="answer-group">
      <p class="answer-label">나의 답변</p>
      <div v-if="isExamMode" class="answer-box user-answer-box exam-mode-input">
        <textarea
          :value="userAnswer"
          @input="$emit('update:userAnswer', ($event.target as HTMLTextAreaElement).value)"
          placeholder="여기에 답변을 입력하세요."
          class="subjective-input"
        ></textarea>
      </div>
      <div v-else class="answer-box user-answer-box display-mode">
        <p>{{ userAnswer || '답변 없음' }}</p>
      </div>
    </div>
    <div v-if="!isExamMode" class="answer-group mt-3">
      <p class="answer-label">예시 답안</p>
      <div class="answer-box example-answer-box display-mode">
        <p>{{ correctAnswer || '예시 답안 없음' }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';

defineProps<{
  userAnswer: string;
  correctAnswer: string;
  isExamMode: boolean; // 응시 모드 여부
}>();

defineEmits(['update:userAnswer']);
</script>

<style scoped>
.subjective-answer-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-bottom: 5px;
}

.answer-group {
  display: flex;
  flex-direction: column;
}

.answer-label {
  font-size: 15px; /* 결과 화면 라벨 크기 */
  font-weight: 600;
  color: #343a40;
  margin-bottom: 8px;
  align-self: flex-start;
}

/* 응시 모드일 때의 라벨 크기 */
.exam-mode-input + .answer-label { /* input 바로 위에 있는 라벨은 더 크게 */
  font-size: 16px;
}


.answer-box {
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 10px;
  padding: 15px 20px;
  font-size: 16px; /* 결과 화면 답변 텍스트 크기 */
  line-height: 1.6;
  word-break: break-word;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.user-answer-box {
  color: #495057;
  background-color: #f0f4f7;
  border-color: #d1e2ed;
}

.example-answer-box {
  color: #28a745;
  background-color: #e6ffe6;
  border-color: #a8edb8;
  font-weight: 500;
}

.answer-box p {
  margin: 0;
}

/* 응시 모드 주관식 입력 필드 */
.subjective-input {
  width: 100%;
  min-height: 120px; /* 응시 화면에서 입력 필드의 최소 높이 */
  border: 1px solid #ced4da;
  border-radius: 8px;
  padding: 15px;
  font-size: 17px; /* 응시 화면 입력 필드 텍스트 크기 */
  line-height: 1.5;
  resize: vertical; /* 세로 크기 조절 가능 */
  box-sizing: border-box;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.subjective-input:focus {
  border-color: #80bdff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

/* 응시 모드에서 주관식 답변 표시 */
.exam-mode-input.user-answer-box {
  padding: 0; /* textarea가 자체 패딩을 가짐 */
  border: none; /* textarea가 자체 테두리를 가짐 */
  box-shadow: none; /* textarea가 자체 그림자를 가짐 */
  background-color: transparent; /* 배경색 제거 */
}

/* 결과 화면에서 주관식 답변 표시 */
.display-mode {
  font-size: 16px; /* 결과 화면에서의 답변 텍스트 크기 */
}
</style>