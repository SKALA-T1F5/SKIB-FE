<template>
  <div class="learner-correctness-table-wrapper">
    <table class="learner-correctness-table">
      <thead>
        <tr>
          <th>학습자</th>
          <th v-for="col in problemColumns" :key="col">{{ col }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(learnerData, index) in data" :key="index">
          <td>{{ learnerData.learner }}</td>
          <td
            v-for="col in problemColumns"
            :key="col"
            :class="{
              correct: learnerData[col] === 'O',
              incorrect: learnerData[col] === 'X',
            }"
          >
            {{ learnerData[col] }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  data: {
    type: Array, // Array of objects like { learner: '학습자1', P1: 'O', P2: 'X', ... }
    required: true,
  },
})

// Dynamically get problem columns (P1, P2, ...) from the first data item
const problemColumns = computed(() => {
  if (props.data.length > 0) {
    return Object.keys(props.data[0]).filter((key) => key !== 'learner')
  }
  return []
})
</script>

<style scoped>
.learner-correctness-table-wrapper {
  overflow-x: auto; /* Enable horizontal scrolling */
  max-width: 100%; /* Ensure wrapper fits container */
}

.learner-correctness-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  color: #343a40;
  min-width: 700px; /* Minimum width to prevent excessive squeezing */
}

.learner-correctness-table th,
.learner-correctness-table td {
  padding: 10px 8px;
  text-align: center;
  border: 1px solid #e0e0e0;
}

.learner-correctness-table th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #495057;
  white-space: nowrap; /* Prevent headers from wrapping */
}

.learner-correctness-table td {
  background-color: #ffffff;
  white-space: nowrap; /* Prevent cell content from wrapping */
}

.learner-correctness-table tbody tr:hover {
  background-color: #f5f5f5;
}

.learner-correctness-table td.correct {
  color: #28a745; /* Green for 'O' */
  font-weight: 600;
}

.learner-correctness-table td.incorrect {
  color: #dc3545; /* Red for 'X' */
  font-weight: 600;
}
</style>
