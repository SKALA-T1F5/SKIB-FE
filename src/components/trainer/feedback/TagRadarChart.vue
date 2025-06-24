## 2. TagRadarChart.vue ```vue
<template>
  <Radar :data="chartData" :options="chartOptions" />
</template>

<script setup>
import { computed, defineProps } from 'vue'
import { Radar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend)

const props = defineProps({
  tagAccuracy: {
    type: Object,
    required: true,
    default: () => ({
      labels: [],
      datasets: [],
    }),
  },
})

const chartData = computed(() => {
  return {
    labels: props.tagAccuracy.labels,
    datasets: props.tagAccuracy.datasets.map((dataset) => ({
      ...dataset,
      backgroundColor: 'rgba(30, 34, 81, 0.2)',
      borderColor: '#1e2251',
      borderWidth: 2,
      pointBackgroundColor: '#1e2251',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 5,
      pointHoverRadius: 7,
    })),
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      callbacks: {
        label: function (context) {
          let label = context.dataset.label || ''
          if (label) {
            label += ': '
          }
          label += context.parsed.r.toFixed(1) + '%'
          return label
        },
      },
    },
  },
  scales: {
    r: {
      angleLines: {
        color: '#e0e0e0',
        lineWidth: 1,
      },
      grid: {
        color: '#f0f0f0',
        lineWidth: 1,
      },
      pointLabels: {
        color: '#333',
        font: {
          size: 12,
          weight: '500',
        },
      },
      ticks: {
        beginAtZero: true,
        max: 100,
        stepSize: 20,
        color: '#666',
        font: {
          size: 10,
        },
        callback: function (value) {
          return value + '%'
        },
        backdropColor: 'rgba(255, 255, 255, 0.8)',
        backdropPadding: 2,
      },
    },
  },
}
</script>
