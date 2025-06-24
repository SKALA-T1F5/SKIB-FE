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
            <th>학습자</th>
            <th v-for="col in problemColumns" :key="col">{{ col }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(learnerData, index) in learnerCorrectnessData" :key="index">
            <td>{{ learnerData.learner }}</td>
            <td
              v-for="col in problemColumns"
              :key="col"
              :class="{
                'cell-correct': learnerData[col] === 'O',
                'cell-incorrect': learnerData[col] === 'X',
              }"
            ></td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  learnerCorrectnessData: {
    type: Array,
    required: true,
  },
})

defineEmits(['download'])

// 문제 컬럼 동적 생성
const problemColumns = computed(() => {
  if (props.learnerCorrectnessData.length > 0) {
    return Object.keys(props.learnerCorrectnessData[0]).filter((key) => key !== 'learner')
  }
  return []
})
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
  text-align: center;
  border: 1px solid #e0e0e0;
  width: 60px;
  min-width: 60px;
}

.learner-correctness-table th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #495057;
  position: sticky;
  top: 0;
  z-index: 1;
}

.learner-correctness-table th:first-child,
.learner-correctness-table td:first-child {
  width: 100px;
  min-width: 100px;
  text-align: left;
  padding-left: 15px;
}

.learner-correctness-table td {
  background-color: #ffffff;
}

.learner-correctness-table tbody tr:hover td:first-child {
  background-color: #f5f5f5;
}

.learner-correctness-table td.cell-correct {
  background-color: #28a745 !important;
  color: #28a745;
}

.learner-correctness-table td.cell-incorrect {
  background-color: #dc3545 !important;
  color: #dc3545;
}
</style>
