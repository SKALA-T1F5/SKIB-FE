<template>
  <div class="solution-section">
    <h4 class="solution-title">풀이</h4>
    <div v-if="explanation" class="solution-text-scrollable">
      {{ explanation }}
    </div>
    <div
      v-else-if="gradingCriteria && gradingCriteria.length > 0"
      class="grading-criteria-scrollable"
    >
      <h4 class="criteria-title">채점 기준:</h4>
      <ul>
        <li v-for="(criterion, index) in gradingCriteria" :key="index">
          <strong>점수: {{ criterion.score }}점</strong> - {{ criterion.criteria }}
          <p v-if="criterion.example" class="criteria-sub-text">예시: {{ criterion.example }}</p>
          <p v-if="criterion.note" class="criteria-sub-text">참고: {{ criterion.note }}</p>
        </li>
      </ul>
    </div>
    <div v-else class="no-solution">
      <p>이 문제에 대한 풀이 또는 채점 기준이 없습니다.</p>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  explanation: {
    type: String,
    default: '',
  },
  gradingCriteria: {
    type: Array,
    default: () => [],
  },
})
</script>

<style scoped>
.solution-section {
  background-color: #ffffff;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  /* flex 속성 제거 또는 flex-shrink: 0만 유지 (height가 우선) */
  /* height는 25px의 gap을 고려하여 나머지 공간을 채움 (30%) */
  height: calc(30% - (25px / 2)); /* 25px는 .question-solution-area의 gap */
  min-height: 0; /* 내용물이 길어져도 이 요소가 커지는 것을 방지하고 스크롤을 허용 */
  overflow-y: auto; /* 내용이 넘칠 때 스크롤바 생성 */
  padding-right: 10px; /* 스크롤바 공간 확보 */
}

/* 풀이 섹션 내부 스크롤바 */
.solution-section::-webkit-scrollbar {
  width: 6px;
}
.solution-section::-webkit-scrollbar-track {
  background: transparent;
}
.solution-section::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
}
.solution-section::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.4);
}

.solution-title,
.criteria-title {
  font-size: 20px;
  font-weight: 700;
  color: #343a40;
  margin-bottom: 15px;
  flex-shrink: 0;
}

.solution-text-scrollable,
.grading-criteria-scrollable {
  flex-grow: 1;
  font-size: 16px;
  line-height: 1.7;
  color: #495057;
  min-height: 0; /* Flexbox 아이템이 내용물에 의해 커지는 것을 방지 */
}

.grading-criteria ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.grading-criteria li {
  margin-bottom: 12px;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 15px 20px;
  background-color: #fcfdfe;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.criteria-sub-text {
  font-size: 14px;
  color: #777;
  margin-top: 8px;
  margin-bottom: 0;
  line-height: 1.5;
}

.no-solution {
  color: #777;
  font-style: italic;
  padding: 15px 0;
  text-align: center;
  flex-grow: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
