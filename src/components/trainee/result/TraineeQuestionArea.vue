<template>
  <div class="question-section">
    <div class="question-content-wrapper">
      <p class="question-text">{{ question.questionText }}</p>

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
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  /* flex 속성 제거 또는 flex-shrink: 0만 유지 (height가 우선) */
  /* flex: 0 0 auto; 와 같이 사용하여 grow/shrink 방지. height가 주요 제어 */

  /* 문제 영역이 차지할 비율 (70%)에서 gap의 절반을 뺌 */
  height: calc(70% - (25px / 2)); /* 25px는 .question-solution-area의 gap */
  min-height: 0; /* 내용물이 길어져도 이 요소가 커지는 것을 방지하고 스크롤을 허용 */
  overflow-y: auto; /* **문제 영역 전체 스크롤** */
  padding-right: 10px; /* 스크롤바 공간 확보 */
}

/* 문제 섹션 내부 스크롤바 */
.question-section::-webkit-scrollbar {
  width: 6px;
}
.question-section::-webkit-scrollbar-track {
  background: transparent;
}
.question-section::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
}
.question-section::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.4);
}

.question-content-wrapper {
  flex-grow: 1; /* 문제 텍스트와 보기를 감싸는 컨테이너가 공간을 채우도록 */
  display: flex;
  flex-direction: column;
}

.question-text {
  font-size: 17px;
  line-height: 1.7;
  margin: 0 0 20px 0; /* 하단 마진 추가 */
  color: #495057;
  flex-shrink: 0; /* 문제 텍스트 자체는 축소되지 않도록 */
}

.options-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
  flex-grow: 1; /* 옵션 컨테이너가 남은 공간을 채우도록 */
  min-height: 0; /* 스크롤 가능하도록 */
  /* overflow-y: auto; 필요 시 여기에도 스크롤을 넣을 수 있지만, 상위 .question-section에서 전체 관리 */
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
  flex-grow: 1; /* 주관식 섹션도 남은 공간을 채우도록 */
  min-height: 0;
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
