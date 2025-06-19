<template>
  <div class="question-section">
    <div class="question-text-fixed">
      <p class="question-text">{{ question.questionText }}</p>
    </div>
    <div class="question-content-scrollable">
      <div class="options-container" v-if="question.type === 'OBJECTIVE'">
        <div
          v-for="(option, index) in question.options"
          :key="index"
          :class="[
            'option-item',
            {
              'is-selected': question.userAnswer === option,
              'is-correct-answer': option === question.correctAnswer,
              'is-wrong-answer':
                question.userAnswer === option && option !== question.correctAnswer,
            },
          ]"
        >
          <span class="option-label">{{ getOptionLabel(index) }}</span>
          <span class="option-content">{{ option }}</span>
          <svg-icon
            v-if="option === question.correctAnswer"
            :path="mdiCheckCircle"
            class="answer-icon correct-icon"
          />
          <svg-icon
            v-if="question.userAnswer === option && option !== question.correctAnswer"
            :path="mdiCloseCircle"
            class="answer-icon wrong-icon"
          />
        </div>
      </div>
      <div class="subjective-answer-section" v-else-if="question.type === 'SUBJECTIVE'">
        <div class="answer-group">
          <p class="answer-label">나의 답변</p>
          <div class="answer-box user-answer-box">
            <p>{{ question.userAnswer || '답변 없음' }}</p>
          </div>
        </div>
        <div class="answer-group mt-3">
          <p class="answer-label">예시 답안</p>
          <div class="answer-box example-answer-box">
            <p>{{ question.correctAnswer || '예시 답안 없음' }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import SvgIcon from '@jamescoyle/vue-icon'
import { mdiCheckCircle, mdiCloseCircle } from '@mdi/js'

const props = defineProps({
  question: {
    type: Object,
    required: true,
  },
})

const getOptionLabel = (index) => {
  return String.fromCharCode(65 + index) + ')'
}
</script>

<style scoped>
.question-section {
  background-color: #ffffff;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  flex-shrink: 0;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  min-height: 250px;
  flex-grow: 1;
  overflow: hidden;
}

.question-text-fixed {
  flex-shrink: 0;
  margin-bottom: 20px;
}

.question-text {
  font-size: 17px;
  line-height: 1.7;
  margin: 0;
  color: #495057;
}

.question-content-scrollable {
  flex-grow: 1;
  overflow-y: auto;
  padding-right: 10px;
}

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

.option-item {
  display: flex;
  align-items: flex-start;
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 10px;
  padding: 15px 25px;
  font-size: 16px;
  color: #495057;
  cursor: default;
  transition: all 0.2s ease-in-out;
  position: relative;
}

.option-item.is-selected {
  background-color: #e6f7ff;
  border-color: #a8dcf0;
  font-weight: 600;
  color: #2b6cb0;
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
  font-size: 15px;
  font-weight: 600;
  color: #343a40;
  margin-bottom: 8px;
  align-self: flex-start;
}

.answer-box {
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 10px;
  padding: 15px 20px;
  font-size: 16px;
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
</style>
