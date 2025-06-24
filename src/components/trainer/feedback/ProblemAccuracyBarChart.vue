<template>
  <div class="bar-chart-container">
    <canvas ref="barChart"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

const props = defineProps({
  data: {
    type: Array, // Array of { problemId: string, accuracy: number }
    required: true,
  },
  options: {
    type: Object,
    default: () => ({}),
  },
})

const barChart = ref(null)
let chartInstance = null

const createChart = () => {
  if (chartInstance) {
    chartInstance.destroy()
  }

  const labels = props.data.map((item) => item.problemId)
  const accuracies = props.data.map((item) => item.accuracy)

  const ctx = barChart.value.getContext('2d')
  chartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: '정답률 (%)',
          data: accuracies,
          backgroundColor: '#42A5F5', // Blue color for bars
          borderColor: '#2196F3',
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false, // No legend needed for single dataset
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              return context.dataset.label + ': ' + context.parsed.y + '%'
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
            text: '문제 번호',
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
            text: '정답률 (%)',
            font: {
              family: "'Noto Sans KR', sans-serif",
            },
          },
          beginAtZero: true,
          max: 100,
          ticks: {
            callback: function (value) {
              return value + '%'
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
.bar-chart-container {
  position: relative;
  height: 250px; /* Fixed height for the chart */
  width: 100%;
}
</style>
