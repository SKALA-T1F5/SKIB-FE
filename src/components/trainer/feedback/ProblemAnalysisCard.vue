<template>
  <section class="dashboard-card problem-accuracy-card full-width-section">
    <div class="card-header">
      <h2 class="card-title">문항별 분석</h2>
      <button @click="$emit('download')" class="download-card-button">
        <v-icon>mdi-download</v-icon>
      </button>
    </div>
    <div class="controls">
      <label for="sort-problem-accuracy">정렬:</label>
      <select id="sort-problem-accuracy" v-model="sortOrder">
        <option value="asc">정답률 낮은 순</option>
        <option value="desc">정답률 높은 순</option>
      </select>
    </div>
    <div class="chart-container default-bar-chart">
      <ProblemAccuracyBarChart :data="sortedProblemAccuracy" />
    </div>

    <div class="problem-detail-table-container">
      <table class="problem-detail-table">
        <thead>
          <tr>
            <th>문제</th>
            <th>유형</th>
            <th>정답률</th>
            <th>평균</th>
            <th>나의 점수</th>
            <th>난이도</th>
            <th>상세 정보</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="problem in sortedProblemDetails" :key="problem.id">
            <tr class="problem-row" @click="toggleProblemDetail(problem.id)">
              <td>{{ problem.id }}</td>
              <td>{{ problem.type }}</td>
              <td :class="{ 'low-accuracy': problem.accuracy < 50 }">{{ problem.accuracy }}%</td>
              <td>{{ problem.average }}%</td>
              <td>{{ problem.myScore }}점</td>
              <td>{{ problem.difficulty }}</td>
              <td>
                <v-icon size="18">{{
                  expandedProblems[problem.id] ? 'mdi-chevron-up' : 'mdi-chevron-down'
                }}</v-icon>
              </td>
            </tr>
            <tr v-if="expandedProblems[problem.id]" class="problem-detail-row">
              <td colspan="7">
                <div class="detail-content">
                  <p><strong>문제 내용:</strong> {{ problem.questionText }}</p>
                  <p><strong>정답:</strong> {{ problem.correctAnswer }}</p>
                  <p><strong>해설:</strong> {{ problem.explanation }}</p>
                  <p>
                    <strong>관련 TAG:</strong>
                    <span class="tag-chip" v-for="tag in problem.tags" :key="tag">{{ tag }}</span>
                  </p>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import ProblemAccuracyBarChart from '@/components/trainer/feedback/ProblemAccuracyBarChart.vue'

const props = defineProps({
  problemAccuracies: {
    type: Array,
    required: true,
  },
  problemDetails: {
    type: Array,
    required: true,
  },
})

defineEmits(['download'])

const sortOrder = ref('desc')
const expandedProblems = ref({})

const sortedProblemAccuracy = computed(() => {
  const data = [...props.problemAccuracies]
  return sortOrder.value === 'asc'
    ? data.sort((a, b) => a.accuracy - b.accuracy)
    : data.sort((a, b) => b.accuracy - a.accuracy)
})

const sortedProblemDetails = computed(() => {
  const data = [...props.problemDetails]
  return sortOrder.value === 'asc'
    ? data.sort((a, b) => a.accuracy - b.accuracy)
    : data.sort((a, b) => b.accuracy - a.accuracy)
})

const toggleProblemDetail = (problemId) => {
  expandedProblems.value[problemId] = !expandedProblems.value[problemId]
}

onMounted(() => {
  props.problemDetails.forEach((p) => {
    expandedProblems.value[p.id] = false
  })
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

.problem-accuracy-card.full-width-section {
  grid-column: 1 / -1;
  margin-bottom: 25px;
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

.controls {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 15px;
  gap: 10px;
  font-size: 14px;
}

.controls label {
  color: #555;
}

.controls select {
  padding: 8px 10px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 14px;
  background-color: #fff;
  cursor: pointer;
  outline: none;
}

.controls select:focus {
  border-color: #1e2251;
  box-shadow: 0 0 0 0.2rem rgba(30, 34, 81, 0.25);
}

.chart-container {
  position: relative;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.default-bar-chart {
  height: 250px;
}

.problem-detail-table-container {
  margin-top: 30px;
  overflow-x: auto;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.problem-detail-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  color: #343a40;
}

.problem-detail-table th,
.problem-detail-table td {
  padding: 12px 10px;
  text-align: center;
  border-bottom: 1px solid #f0f2f5;
}

.problem-detail-table th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #495057;
  white-space: nowrap;
}

.problem-detail-table .problem-row {
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.problem-detail-table .problem-row:hover {
  background-color: #f5f5f5;
}

.problem-detail-table td {
  background-color: #ffffff;
  white-space: nowrap;
}

.problem-detail-table .low-accuracy {
  color: #dc3545;
  font-weight: 600;
}

.problem-detail-row td {
  background-color: #fcfcfc;
  padding: 15px;
  text-align: left;
}

.detail-content {
  padding: 10px 0;
  border-top: 1px dashed #e0e0e0;
  margin-top: 10px;
  font-size: 13px;
  line-height: 1.6;
  color: #666;
}

.detail-content p {
  margin-bottom: 8px;
}

.detail-content strong {
  color: #333;
}

.tag-chip {
  display: inline-block;
  background-color: #e0e4f0;
  color: #1e2251;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  margin-right: 5px;
  margin-bottom: 3px;
  white-space: nowrap;
}
</style>
