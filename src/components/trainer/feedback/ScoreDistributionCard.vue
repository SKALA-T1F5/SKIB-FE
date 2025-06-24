<template>
  <section class="dashboard-card score-distribution-card">
    <div class="card-header">
      <h2 class="card-title">학습자별 점수 분포</h2>
      <button @click="$emit('download')" class="download-card-button">
        <v-icon>mdi-download</v-icon>
      </button>
    </div>
    <div class="chart-container default-line-chart">
      <ScoreDistributionLineChart
        :data="scoreDistribution"
        :chart-options="scoreDistributionChartOptions"
      />
    </div>

    <div class="participants-table-container">
      <table class="participants-table">
        <thead>
          <tr>
            <th>순번</th>
            <th>학습자명</th>
            <th>점수</th>
            <th>합격여부</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(participant, index) in participantsList" :key="index">
            <td>{{ index + 1 }}</td>
            <td>{{ participant.name }}</td>
            <td>{{ participant.score }}점</td>
            <td>
              <span
                :class="{
                  'status-pass': participant.pass,
                  'status-fail': !participant.pass,
                }"
              >
                {{ participant.pass ? '합격' : '불합격' }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup>
import ScoreDistributionLineChart from '@/components/trainer/feedback/ScoreDistributionLineChart.vue'

defineProps({
  scoreDistribution: {
    type: Object,
    required: true,
  },
  scoreDistributionChartOptions: {
    type: Object,
    required: true,
  },
  participantsList: {
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

.score-distribution-card {
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

.chart-container {
  position: relative;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.default-line-chart {
  height: 250px;
}

.participants-table-container {
  margin-top: 25px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  max-height: 300px;
  overflow-y: auto;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.participants-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  color: #343a40;
}

.participants-table th,
.participants-table td {
  padding: 12px 10px;
  text-align: center;
  border-bottom: 1px solid #f0f2f5;
}

.participants-table th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #495057;
  position: sticky;
  top: 0;
  z-index: 1;
  white-space: nowrap;
}

.participants-table td {
  background-color: #ffffff;
  white-space: nowrap;
}

.participants-table tbody tr:hover {
  background-color: #f5f5f5;
}

.status-pass {
  color: #28a745;
  font-weight: 600;
}

.status-fail {
  color: #dc3545;
  font-weight: 600;
}
</style>
