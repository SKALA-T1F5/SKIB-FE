<template>
  <Bar :data="chartData" :options="chartOptions" />
</template>

<script setup>
import { computed, defineProps } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const props = defineProps({
  data: {
    type: Array, // [{ problemId: 'P1', accuracy: 85 }]
    required: true,
  },
})

const chartData = computed(() => {
  return {
    labels: props.data.map((item) => item.problemId),
    datasets: [
      {
        label: '정답률 (%)',
        data: props.data.map((item) => item.accuracy),
        backgroundColor: '#1e2251', // 요청된 색상으로 변경
        borderColor: '#1e2251',
        borderWidth: 1,
      },
    ],
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false, // 단일 데이터셋이므로 범례 숨김
    },
    tooltip: {
      callbacks: {
        label: function (context) {
          let label = context.dataset.label || ''
          if (label) {
            label += ': '
          }
          label += context.parsed.y + '%'
          return label
        },
      },
    },
  },
  scales: {
    x: {
      title: {
        display: true,
        text: '문제 번호',
        color: '#555',
      },
      ticks: {
        color: '#333',
      },
      grid: {
        display: false, // X축 그리드 라인 숨김
      },
    },
    y: {
      title: {
        display: true,
        text: '정답률 (%)',
        color: '#555',
      },
      beginAtZero: true,
      max: 100, // 정답률은 최대 100%
      ticks: {
        color: '#333',
        callback: function (value) {
          return value + '%'
        },
      },
      grid: {
        color: '#e0e0e0', // Y축 그리드 라인 색상
      },
    },
  },
}
</script>
