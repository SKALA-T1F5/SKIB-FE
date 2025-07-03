<template>
  <section class="dashboard-card learner-correctness-table-card full-width-section">
    <div class="card-header">
      <h2 class="card-title">학습자별 문항 정오표</h2>
      <button @click="$emit('download')" class="download-card-button">
        <v-icon>mdi-download</v-icon>
      </button>
    </div>
    <div class="learner-correctness-table-wrapper">
      <table class="learner-correctness-table">
        <thead>
          <tr>
            <th></th>
            <th v-for="label in questionLabels" :key="label">{{ label }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(learnerData, index) in learnerCorrectnessData" :key="index">
            <td>{{ learnerData.learner }}</td>
            <td
              v-for="label in questionLabels"
              :key="label"
              :class="{
                'cell-correct': learnerData[label] === 'O',
                'cell-incorrect': learnerData[label] === 'X',
              }"
            >
              <template v-if="learnerData[label] === 'O'">✔</template>
              <template v-else-if="learnerData[label] === 'X'">✘</template>
              <template v-else></template>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  questionLabels: {
    type: Array,
    required: true,
  },
  learnerCorrectnessData: {
    type: Array,
    required: true,
  },
})

defineEmits(['download'])
</script>

<style scoped>
.dashboard-card {
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  padding: 25px;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  width: 100%;
  max-width: 100%;
  overflow: hidden;
}

.learner-correctness-table-card.full-width-section {
  grid-column: 1 / -1;
  overflow-x: auto;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.card-header {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #dcdfe6;
  position: relative;
}

.card-title {
  font-size: 22px;
  font-weight: 600;
  color: #1e2251;
  margin: 0;
  text-align: center;
}

.download-card-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  border-radius: 6px;
  transition: background-color 0.2s ease;
  color: #1e2251;
  position: absolute;
  right: 0;
  top: 0;
}

.download-card-button:hover {
  background-color: #f0f2f5;
}

.download-card-button .v-icon {
  font-size: 18px;
  color: #1e2251;
}

.learner-correctness-table-wrapper {
  overflow-x: auto;
  max-width: 100%;
}

.learner-correctness-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  color: #343a40;
  min-width: 800px;
}

.learner-correctness-table th,
.learner-correctness-table td {
  padding: 10px 8px;
  text-align: center; /* 모든 칸 텍스트 가운데 정렬 유지 */
  border: 1px solid #ffffff; /* 테두리 하얀색으로 수정 */
  width: 60px; /* 모든 칸 동일한 너비 유지 */
  min-width: 60px; /* 모든 칸 동일한 최소 너비 유지 */
}

/* 학습자 첫 번째 열에 대한 특정 스타일 재정의 제거 유지 */
.learner-correctness-table th:first-child,
.learner-correctness-table td:first-child {
  /* 이제 일반 th, td 규칙을 따름 (가운데 정렬, 60px 너비) */
}

.learner-correctness-table th {
  background-color: #ffffff; /* 제목 열 배경색 하얀색으로 수정 */
  font-weight: 600;
  color: #495057;
  position: sticky;
  top: 0;
  z-index: 1;
}

.learner-correctness-table td {
  background-color: #ffffff; /* 이외 모든 칸 배경 하얀색 유지 */
}

.learner-correctness-table tbody tr:hover td:first-child {
  background-color: #f5f5f5;
}

.learner-correctness-table td.cell-correct {
  background-color: #bbf7d0 !important; /* 정답 배경색 유지 */
  color: #000000 !important; /* 텍스트 검은색 유지 */
}

.learner-correctness-table td.cell-incorrect {
  background-color: #fecaca !important; /* 오답 배경색 유지 */
  color: #000000 !important; /* 텍스트 검은색 유지 */
}
</style>
