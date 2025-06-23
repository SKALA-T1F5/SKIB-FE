<template>
  <div class="solution-area">
    <h4 class="solution-title">풀이</h4>
    <div class="solution-content">
      <p class="explanation-text">{{ explanation }}</p>

      <div v-if="questionType === 'SUBJECTIVE'">
        <div v-if="gradingCriteria && gradingCriteria.length > 0">
          <h5 class="grading-criteria-title">채점 기준</h5>
          <ul class="grading-criteria-list">
            <li v-for="(criterion, index) in gradingCriteria" :key="index" class="criterion-item">
              <span class="criterion-score">({{ criterion.score }}점)</span>
              <span class="criterion-text">{{ criterion.criteria }}</span>
              <p class="criterion-example" v-if="criterion.example">
                예시: "{{ criterion.example }}"
              </p>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'

const props = defineProps({
  explanation: {
    type: String,
    default: '제공된 풀이가 없습니다.',
  },
  gradingCriteria: {
    type: Array,
    default: () => [], // 주관식 문제의 채점 기준
  },
  questionType: {
    type: String,
    required: true,
    validator: (value) => ['OBJECTIVE', 'SUBJECTIVE'].includes(value),
  },
  // correctAnswer prop은 더 이상 이 컴포넌트에서 사용되지 않으므로 제거
})
</script>

<style scoped>
.solution-area {
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

.solution-title {
  font-size: 22px;
  font-weight: 700;
  color: #343a40;
  margin-bottom: 20px;
  flex-shrink: 0; /* 제목이 줄어들지 않도록 고정 */
}

.solution-content {
  flex-grow: 1;
  font-size: 16px;
  color: #495057;
  line-height: 1.6;
  overflow-y: auto; /* 풀이 내용이 길어질 경우 스크롤 */
  /* min-height: 0; 상위 .solution-area에 이미 설정되어 있음 */
}

.explanation-text {
  margin-bottom: 20px;
  white-space: pre-wrap;
}

.grading-criteria-title {
  font-size: 18px;
  font-weight: 600;
  color: #343a40;
  margin-top: 25px;
  margin-bottom: 15px;
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 10px;
}

.grading-criteria-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.criterion-item {
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 15px 20px;
  margin-bottom: 12px;
  font-size: 15px;
  color: #343a40;
  line-height: 1.5;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.criterion-item:last-child {
  margin-bottom: 0;
}

.criterion-score {
  font-weight: bold;
  color: #191d5a;
  margin-right: 8px;
}

.criterion-text {
  flex-grow: 1;
}

.criterion-example {
  font-style: italic;
  color: #6c757d;
  margin-top: 5px;
  margin-bottom: 0;
  padding-left: 10px;
  border-left: 3px solid #dee2e6;
  white-space: pre-wrap;
}
</style>