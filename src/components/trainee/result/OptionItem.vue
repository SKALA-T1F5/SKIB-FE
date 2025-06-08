<template>
  <div
    :class="[
      'option-item',
      {
        'is-selected': isSelected,
        'is-correct-answer': !isExamMode && isCorrectAnswer,
        'is-wrong-answer': !isExamMode && isSelected && !isCorrectAnswer,
        'is-clickable': isExamMode // 응시 모드일 때 클릭 가능하도록
      }
    ]"
    @click="isExamMode ? $emit('selectOption', option) : null"
  >
    <span class="option-label" :class="{ 'exam-mode-label': isExamMode }">{{ optionLabel }}</span>
    <span class="option-content" :class="{ 'exam-mode-content': isExamMode }">{{ option }}</span>
    <svg-icon v-if="!isExamMode && isCorrectAnswer" :path="mdiCheckCircle" class="answer-icon correct-icon" />
    <svg-icon v-if="!isExamMode && isSelected && !isCorrectAnswer" :path="mdiCloseCircle" class="answer-icon wrong-icon" />
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';
import SvgIcon from '@jamescoyle/vue-icon';
import { mdiCheckCircle, mdiCloseCircle } from '@mdi/js';

defineProps<{
  option: string;
  optionLabel: string;
  isSelected: boolean;
  isCorrectAnswer: boolean;
  isWrongAnswer: boolean;
  isExamMode: boolean; // 응시 모드 여부
}>();

defineEmits(['selectOption']);
</script>

<style scoped>
.option-item {
  display: flex;
  align-items: flex-start;
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 10px;
  padding: 15px 25px;
  font-size: 16px; /* 결과 화면 선지 텍스트 크기 */
  color: #495057;
  cursor: default;
  transition: all 0.2s ease-in-out;
  position: relative;
}

/* 응시 모드일 때 클릭 가능하도록 */
.option-item.is-clickable {
  cursor: pointer;
}
.option-item.is-clickable:hover {
  background-color: #e9ecef;
  border-color: #ced4da;
}

.option-item.is-selected {
  background-color: #e6f7ff;
  border-color: #a8dcf0;
  font-weight: 600;
  color: #2b6cb0;
}

/* 응시 모드 선택 시의 색상 (결과 화면 정답/오답과 구분) */
.option-item.is-selected.is-clickable {
    background-color: #e0f2f7; /* 응시 화면 선택 시의 색상 */
    border-color: #78c0e0;
    color: #0056b3;
}


.option-item.is-correct-answer {
  background-color: #e6ffe6;
  border-color: #a8edb8;
  color: #28a745;
}
.option-item.is-wrong-answer {
  background-color: #ffe6e6;
  border-color: #edb8b8;
  color: #dc3545;
}

.option-label {
  min-width: 30px;
  font-weight: bold;
  margin-right: 15px;
  color: #6c757d;
  flex-shrink: 0;
}
/* 응시 모드일 때의 라벨 크기 */
.option-label.exam-mode-label {
  font-size: 18px; /* 응시 화면 선지 라벨을 더 크게 */
}

.option-item.is-selected .option-label {
    color: #2b6cb0;
}
.option-item.is-correct-answer .option-label {
    color: #28a745;
}
.option-item.is-wrong-answer .option-label {
    color: #dc3545;
}


.option-content {
  flex-grow: 1;
  word-break: break-word;
}

/* 응시 모드일 때의 선지 내용 크기 */
.option-content.exam-mode-content {
  font-size: 17px; /* 응시 화면 선지 내용을 더 크게 */
}

.answer-icon {
  position: absolute;
  right: 20px;
  font-size: 22px;
}

.correct-icon {
  color: #28a745;
}

.wrong-icon {
  color: #dc3545;
}
</style>