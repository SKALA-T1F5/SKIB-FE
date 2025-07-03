<template>
  <section class="dashboard-card average-score-card">
    <div class="card-header">
      <h2 class="card-title">평균 점수 및 합격자 수</h2>
      <button @click="$emit('download')" class="download-card-button">
        <v-icon>mdi-download</v-icon>
      </button>
    </div>
    <div class="average-score-content">
      <div class="chart-container score-chart">
        <PassRateBarChart :data="passRateChartData" />
      </div>
      <div class="score-metrics">
        <div class="score-item">
          <span class="label">평균 점수</span>
          <span class="value">{{ averageScore }}점</span>
        </div>
        <div class="score-item">
          <span class="label">합격자 수</span>
          <span class="value">{{ passersCount }}명</span>
        </div>
        <div class="score-item">
          <span class="label">전체 응시자</span>
          <span class="value">{{ totalParticipants }}명</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import PassRateBarChart from '@/components/trainer/feedback/PassRateBarChart.vue'

const props = defineProps({
  averageScore: {
    type: Number,
    required: true,
  },
  passersCount: {
    type: Number,
    required: true,
  },
  totalParticipants: {
    type: Number,
    required: true,
  },
})

defineEmits(['download'])

const passRateChartData = computed(() => {
  const passRate = ((props.passersCount / props.totalParticipants) * 100).toFixed(1)
  const failRate = (100 - passRate).toFixed(1)

  return {
    labels: ['합격률', '불합격률'],
    datasets: [
      {
        label: '비율 (%)',
        data: [passRate, failRate],
        backgroundColor: ['#bbf7d0', '#fecaca'],
        // borderColor: ['#28a745', '#dc3545'],
        // borderWidth: 1,
      },
    ],
  }
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
  min-width: 300px;
  max-width: 500px;
  overflow: hidden;
}

.average-score-card {
  flex: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
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

.average-score-content {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.score-metrics {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 20px;
}

.score-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  color: #495057;
  padding: 6px 0;
  border-bottom: 1px solid #f0f2f5;
}

.score-item:last-child {
  border-bottom: none;
}

.score-item .label {
  font-weight: 500;
}

.score-item .value {
  font-weight: 700;
  color: #1e2251;
}

.chart-container {
  position: relative;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.score-chart {
  height: 250px;
  margin-bottom: 20px;
}
</style>
