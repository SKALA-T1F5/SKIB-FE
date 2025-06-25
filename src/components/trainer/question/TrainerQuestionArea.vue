<template>
  <div class="question-area">
    <div class="question-header">
      <h4 class="question-title">문제</h4>
      <div class="header-right">
        <span :class="['difficulty-tag', `difficulty-${difficultyLevel.toLowerCase()}`]">
          {{ difficultyLevel }}
        </span>
        <div class="tag-list">
          <span class="tag" v-for="tag in question.tags" :key="tag">{{ tag }}</span>
        </div>
      </div>
    </div>
    <div class="question-content">
      <p class="question-text">{{ question.questionText }}</p>

      <div v-if="questionType === 'OBJECTIVE'" class="options-container">
        <ul class="options-list">
          <li
            v-for="(option, index) in question.options"
            :key="index"
            :class="{ 'correct-answer': option === correctAnswer }"
          >
            <span class="option-label">{{ String.fromCharCode(65 + index) }}.</span>
            <span class="option-text">{{ option }}</span>
          </li>
        </ul>
      </div>

      <div v-if="questionType === 'SUBJECTIVE'" class="subjective-answer-display">
        <p class="answer-label">예시 답안:</p>
        <div class="answer-content">
          <p class="answer-text">{{ correctAnswer }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'

const props = defineProps({
  question: {
    type: Object,
    required: true,
    default: () => ({
      id: '',
      type: 'OBJECTIVE', // 'OBJECTIVE' or 'SUBJECTIVE'
      difficulty_level: 'NORMAL',
      questionText: '',
      options: [], // Only for OBJECTIVE
      tags: [],
    }),
  },
  difficultyLevel: {
    type: String,
    required: true,
    validator: (value) => ['EASY', 'NORMAL', 'HARD'].includes(value.toUpperCase()),
  },
  correctAnswer: {
    type: String,
    required: true,
  },
  questionType: {
    type: String,
    required: true,
    validator: (value) => ['OBJECTIVE', 'SUBJECTIVE'].includes(value),
  },
})
</script>

<style scoped>
.question-area {
  background-color: #ffffff;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  flex: 1; /* 가로 1:1 비율을 위해 flex: 1 설정 */
  display: flex;
  flex-direction: column;
  overflow-y: auto; /* 내용이 넘칠 경우 스크롤 */
  min-height: 0; /* Flex 아이템의 최소 높이 설정 */
  height: 100%; /* 부모 높이만큼 채우도록 설정 */
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  flex-shrink: 0; /* 헤더가 줄어들지 않도록 고정 */
}

.question-title {
  font-size: 22px;
  font-weight: 700;
  color: #343a40;
  margin: 0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.difficulty-tag {
  padding: 5px 10px;
  border-radius: 5px;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
}

.difficulty-easy {
  background-color: #e6ffe6; /* Light Green */
  color: #28a745; /* Dark Green */
}

.difficulty-normal {
  background-color: #fff3cd; /* Light Yellow */
  color: #ffc107; /* Dark Yellow */
}

.difficulty-hard {
  background-color: #f8d7da; /* Light Red */
  color: #dc3545; /* Dark Red */
}

.tag-list {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.tag {
  background-color: #e0f2f7;
  color: #007bb5;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
}

.question-content {
  flex-grow: 1;
  font-size: 16px;
  color: #495057;
  line-height: 1.6;
  overflow-y: auto; /* 문제 내용이 길어질 경우 스크롤 */
  /* min-height: 0; 상위 .question-area에 이미 설정되어 있음 */
}

.question-text {
  margin-bottom: 20px;
  white-space: pre-wrap; /* 줄 바꿈 유지 */
}

/* 객관식 옵션 스타일 */
.options-container {
  margin-top: 15px;
}

.options-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.options-list li {
  padding: 12px 18px;
  margin-bottom: 10px;
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  cursor: default;
  transition: all 0.2s ease-in-out;
  font-weight: 500;
  color: #343a40;
  display: flex;
  align-items: center;
  gap: 10px;
}

.options-list li:last-child {
  margin-bottom: 0;
}

.options-list li .option-label {
  font-weight: bold;
  color: #6c757d;
}

/* 정답 (모든 경우에 표시) */
.options-list li.correct-answer {
  background-color: #e6ffed; /* 밝은 녹색 */
  border-color: #28a745; /* 녹색 테두리 */
  color: #1e7e34; /* 진한 녹색 텍스트 */
  font-weight: bold;
}

/* 서술형 답안 표시 영역 */
.subjective-answer-display {
  background-color: #eef2f7;
  border-left: 5px solid #191d5a;
  padding: 15px 20px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-top: 20px;
}

.answer-label {
  font-weight: bold;
  color: #191d5a;
  font-size: 17px;
  margin-bottom: 5px;
}

.answer-content {
  flex-grow: 1;
}

.answer-text {
  color: #333;
  font-weight: 500;
  font-size: 16px;
  white-space: pre-wrap; /* 줄 바꿈 유지 */
  margin: 0;
}
</style>