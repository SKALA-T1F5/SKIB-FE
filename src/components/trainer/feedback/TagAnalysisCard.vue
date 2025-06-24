<template>
  <section class="dashboard-card tag-analysis-card">
    <button @click="$emit('download')" class="download-card-button">
      <v-icon>mdi-download</v-icon>
    </button>
    <div class="card-header">
      <h2 class="card-title">Tag별 분석</h2>
    </div>
    <div class="chart-container radar-chart">
      <TagRadarChart :tag-accuracy="tagRadarData" />
    </div>
    <div class="tag-metrics">
      <div class="tag-item" v-for="(tag, index) in tagAccuracyList" :key="index">
        <span class="label">{{ tag.name }}</span>
        <span class="value">{{ tag.rate.toFixed(1) }}%</span>
      </div>
    </div>
  </section>
</template>

<script setup>
import TagRadarChart from '@/components/trainer/feedback/TagRadarChart.vue'

defineProps({
  tagRadarData: {
    type: Object,
    required: true,
  },
  tagAccuracyList: {
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
  min-width: 300px;
  max-width: 500px;
  overflow: hidden;
}

.tag-analysis-card {
  flex: 1;
  min-height: 400px;
  position: relative;
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
  top: 25px;
  right: 25px;
  z-index: 10;
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

.radar-chart {
  height: 220px;
  margin-bottom: 20px;
  flex-shrink: 0;
}

.tag-metrics {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 20px;
  flex-grow: 1;
  justify-content: flex-start;
}

.tag-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  color: #495057;
  padding: 6px 0;
  border-bottom: 1px solid #f0f2f5;
}

.tag-item:last-child {
  border-bottom: none;
}

.tag-item .label {
  font-weight: 500;
}

.tag-item .value {
  font-weight: 700;
  color: #1e2251;
}
</style>
