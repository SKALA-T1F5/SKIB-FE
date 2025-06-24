<template>
  <div class="doughnut-chart-container">
    <canvas ref="doughnutChart"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

const props = defineProps({
  data: {
    type: Object,
    required: true,
    // Example: { labels: ['Red', 'Blue'], datasets: [{ data: [10, 20], backgroundColor: ['#F00', '#00F'] }] }
  },
  options: {
    type: Object,
    default: () => ({}),
  },
})

const doughnutChart = ref(null)
let chartInstance = null

const createChart = () => {
  if (chartInstance) {
    chartInstance.destroy()
  }
  const ctx = doughnutChart.value.getContext('2d')
  chartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: props.data,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            font: {
              size: 14,
              family: "'Noto Sans KR', sans-serif",
            },
          },
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              let label = context.label || ''
              if (label) {
                label += ': '
              }
              if (context.parsed !== null) {
                label += context.parsed + '명' // Customize tooltip
              }
              return label
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
.doughnut-chart-container {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
