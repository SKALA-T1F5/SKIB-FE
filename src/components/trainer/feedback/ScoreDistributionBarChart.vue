<template>
  <div class="score-distribution-chart-container">
    <canvas ref="scoreBarChart"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

const props = defineProps({
  data: {
    type: Object, // { labels: [], datasets: [] } format
    required: true,
  },
  options: {
    type: Object,
    default: () => ({}),
  },
})

const scoreBarChart = ref(null)
let chartInstance = null

const createChart = () => {
  if (chartInstance) {
    chartInstance.destroy()
  }

  const ctx = scoreBarChart.value.getContext('2d')
  chartInstance = new Chart(ctx, {
    type: 'bar',
    data: props.data,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              return context.dataset.label + ': ' + context.parsed.y + '명'
            },
          },
          titleFont: {
            family: "'Noto Sans KR', sans-serif",
          },
          bodyFont: {
            family: "'Noto Sans KR', sans-serif",
          },
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: '점수 구간',
            font: {
              family: "'Noto Sans KR', sans-serif",
            },
          },
          ticks: {
            font: {
              family: "'Noto Sans KR', sans-serif",
            },
          },
        },
        y: {
          title: {
            display: true,
            text: '학습자 수 (명)',
            font: {
              family: "'Noto Sans KR', sans-serif",
            },
          },
          beginAtZero: true,
          ticks: {
            stepSize: 1,
            callback: function (value) {
              if (Number.isInteger(value)) {
                return value + '명'
              }
              return ''
            },
            font: {
              family: "'Noto Sans KR', sans-serif",
            },
          },
        },
      },
      ...props.options,
    },
  })
}

onMounted(() => {
  createChart()
})

watch(
  () => props.data,
  () => {
    createChart()
  },
  { deep: true },
)
</script>

<style scoped>
.score-distribution-chart-container {
  position: relative;
  height: 300px; /* Fixed height for the chart */
  width: 100%;
}
</style>
