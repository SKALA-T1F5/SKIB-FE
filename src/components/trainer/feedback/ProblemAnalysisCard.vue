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
      <select id="sort-problem-accuracy" v-model="sortOrder" @change="emitSortOrder">
        <option value="desc">정답률 높은 순</option>
        <option value="asc">정답률 낮은 순</option>
      </select>
    </div>
    <div class="chart-container default-bar-chart">
      <ProblemAccuracyBarChart :data="sortedProblemAccuracyForChart" />
    </div>

    <div class="problem-detail-table-container">
      <table class="problem-detail-table">
        <thead>
          <tr>
            <th>문항 번호</th>
            <th class="text-left-align">문제</th>
            <th>문제 유형</th>
            <th>난이도</th>
            <th>정답률</th>
            <th class="toggle-column"></th>
          </tr>
        </thead>
        <tbody>
          <template v-for="problem in sortedProblemDetails" :key="problem.id">
            <tr class="problem-row" @click="toggleProblemDetail(problem.id)">
              <td>{{ problem.id }}</td>
              <td class="text-left-align problem-text-cell">{{ problem.questionText }}</td>
              <td>{{ problem.type }}</td>
              <td>{{ problem.difficulty }}</td>
              <td :class="{ 'low-accuracy': problem.accuracy < 60 }">
                {{ problem.accuracy ? problem.accuracy.toFixed(1) + '%' : 'N/A' }}
              </td>
              <td class="toggle-column">
                <v-icon>{{
                  expandedProblemId === problem.id ? 'mdi-chevron-up' : 'mdi-chevron-down'
                }}</v-icon>
              </td>
            </tr>
            <tr v-if="expandedProblemId === problem.id" class="problem-detail-row">
              <td :colspan="tableColumnsCount">
                <div class="detail-content">
                  <div class="detail-group">
                    <div class="detail-item">
                      <strong>출처 문서:</strong>
                      <span>{{ problem.documentName || 'N/A' }}</span>
                    </div>
                  </div>
                  <div class="detail-group">
                    <div class="detail-item">
                      <strong>정답:</strong>
                      <span>{{ problem.correctAnswer || 'N/A' }}</span>
                    </div>
                    <div class="detail-item">
                      <strong>해설:</strong>
                      <span>{{ problem.explanation || '해설 준비 중' }}</span>
                    </div>
                  </div>
                  <div class="detail-group">
                    <div class="detail-item">
                      <strong>관련 태그:</strong>
                      <div class="tag-list">
                        <span v-for="(tag, i) in problem.tags" :key="i" class="tag-chip">
                          {{ tag }}
                        </span>
                        <span v-if="!problem.tags || problem.tags.length === 0">N/A</span>
                      </div>
                    </div>
                  </div>
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
import { ref, computed, watch } from 'vue'
import ProblemAccuracyBarChart from '@/components/trainer/feedback/ProblemAccuracyBarChart.vue'

const props = defineProps({
  problemAccuracies: {
    type: Array,
    default: () => [],
  },
  problemDetails: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['download', 'sort-order-changed'])

const sortOrder = ref('desc') // 'desc' for highest accuracy, 'asc' for lowest accuracy
const expandedProblemId = ref(null)

// 차트 데이터 (정렬 순서에 따라 변경)
const sortedProblemAccuracyForChart = computed(() => {
  return [...props.problemAccuracies].sort((a, b) => {
    if (sortOrder.value === 'desc') {
      return b.accuracy - a.accuracy
    } else {
      return a.accuracy - b.accuracy
    }
  })
})

// 테이블 상세 데이터 (정렬 순서에 따라 변경)
const sortedProblemDetails = computed(() => {
  return [...props.problemDetails].sort((a, b) => {
    if (sortOrder.value === 'desc') {
      return b.accuracy - a.accuracy
    } else {
      return a.accuracy - b.accuracy
    }
  })
})

// 정렬 순서 변경 시 부모 컴포넌트로 이벤트 emit
const emitSortOrder = () => {
  emit('sort-order-changed', sortOrder.value)
}

// 문제 상세 내용 토글
const toggleProblemDetail = (problemId) => {
  if (expandedProblemId.value === problemId) {
    expandedProblemId.value = null
  } else {
    expandedProblemId.value = problemId
  }
}

// 테이블 컬럼 수 계산 (colspan에 사용)
const tableColumnsCount = computed(() => {
  // '문항 번호', '문제 텍스트', '문제 유형', '난이도', '정답률', '토글' 6개
  return 6
})

// problemAccuracies 또는 problemDetails가 변경될 때마다 expandedProblemId 초기화
watch(
  () => props.problemDetails,
  () => {
    expandedProblemId.value = null
  },
)
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
}

.problem-accuracy-card.full-width-section {
  grid-column: 1 / -1;
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
  align-items: center;
  justify-content: flex-end;
  margin-bottom: 20px;
  gap: 10px;
}

.controls label {
  font-size: 15px;
  color: #343a40;
  font-weight: 500;
}

.controls select {
  padding: 8px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  background-color: #f8f9fa;
  font-size: 14px;
  color: #343a40;
  cursor: pointer;
  outline: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background-image: url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%20viewBox%3D%220%200%20292.4%20292.4%22%3E%3Cpath%20fill%3D%22%23343a40%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-6.5%200-12.3%203.2-16%208.7-3.6%205.4-4.5%2011.8-2.6%2017.9l139%20139.2c3.2%203.2%207.6%204.9%2012.2%204.9s9.1-1.7%2012.2-4.9L289.8%2093.5c1.9-6.1%201-12.5-2.6-17.9z%22%2F%3E%3C%2Fsvg%3E');
  background-repeat: no-repeat;
  background-position: right 8px center;
  background-size: 12px;
  padding-right: 30px;
}

.chart-container {
  margin-bottom: 25px;
  background-color: #f8f9fa;
  border-radius: 10px;
  padding: 20px;
  height: 250px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.default-bar-chart {
  max-width: 100%;
}

.problem-detail-table-container {
  overflow-x: auto;
  max-width: 100%;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
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

/* 문제 텍스트 부분 왼쪽 정렬 */
.problem-detail-table th.text-left-align,
.problem-detail-table td.text-left-align {
  text-align: center;
}

.problem-detail-table .problem-text-cell {
  max-width: 300px; /* Adjust as needed */
  overflow: hidden;
  text-overflow: ellipsis;
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
}

.detail-group {
  margin-bottom: 15px;
}

.detail-item {
  margin-bottom: 8px;
  line-height: 1.6;
}

.detail-item strong {
  color: #1e2251;
  margin-right: 8px;
  display: inline-block;
  min-width: 70px;
}

.detail-item span,
.detail-item div {
  color: #343a40;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 5px;
}

.tag-chip {
  background-color: #e9ecef;
  border-radius: 5px;
  padding: 4px 8px;
  font-size: 12px;
  color: #495057;
  white-space: nowrap;
}

.toggle-column {
  width: 50px; /* Adjust width for the toggle icon column */
}
</style>
