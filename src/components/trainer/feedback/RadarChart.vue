<template>
  <div class="radar-chart-container">
    <canvas ref="radarChart"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

const props = defineProps({
  tagAccuracy: {
    type: Object,
    required: true,
    // Example: { '추론력': 88, '문제해결력': 80, '이해력': 92, '논리력': 75, '분석력': 60 }
  },
})

const radarChart = ref(null)
let chartInstance = null

const createChart = () => {
  if (chartInstance) {
    chartInstance.destroy()
  }

  const labels = Object.keys(props.tagAccuracy)
  const dataValues = Object.values(props.tagAccuracy)

  const ctx = radarChart.value.getContext('2d')
  chartInstance = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: labels,
      datasets: [
        {
          label: '내 역량', // Changed label to be more generic for trainer's view
          data: dataValues,
          backgroundColor: 'rgba(0, 123, 255, 0.4)', // Blue
          borderColor: 'rgba(0, 123, 255, 1)',
          borderWidth: 2,
          pointBackgroundColor: 'rgba(0, 123, 255, 1)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgba(0, 123, 255, 1)',
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      elements: {
        line: {
          borderWidth: 3,
        },
      },
      scales: {
        r: {
          angleLines: {
            display: true,
          },
          suggestedMin: 0,
          suggestedMax: 100,
          ticks: {
            backdropColor: 'rgba(255, 255, 255, 0.8)',
            stepSize: 20,
            callback: function (value) {
              return value + '%'
            },
            font: {
              family: "'Noto Sans KR', sans-serif",
            },
          },
          pointLabels: {
            font: {
              size: 14,
              family: "'Noto Sans KR', sans-serif",
            },
            color: '#34495e',
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.1)',
          },
        },
      },
      plugins: {
        legend: {
          display: false, // Hide legend for cleaner look, as it's just '내 역량'
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              return context.label + ': ' + context.parsed.r + '%'
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
    },
  })
}

onMounted(() => {
  createChart()
})

watch(
  () => props.tagAccuracy,
  () => {
    createChart()
  },
  { deep: true },
)
</script>

<style scoped>
.radar-chart-container {
  position: relative;
  height: 250px; /* Adjust height as needed */
  width: 100%;
}
</style>
