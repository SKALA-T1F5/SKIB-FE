<template>
  <Line :data="chartData" :options="chartOptions" />
</template>

<script setup>
import { computed, defineProps } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

const props = defineProps({
  data: {
    type: Object, // { labels: [], datasets: [] }
    required: true,
  },
})

const chartData = computed(() => {
  return {
    labels: props.data.labels,
    datasets: props.data.datasets.map((dataset) => ({
      ...dataset,
      backgroundColor: '#1e2251', // 점의 배경색
      borderColor: '#1e2251', // 선의 색상
      pointBackgroundColor: '#1e2251', // 각 점의 배경색
      pointBorderColor: '#fff', // 각 점의 테두리 색상
      pointBorderWidth: 1,
      pointRadius: 5, // 점의 크기
      tension: 0.4, // 선의 부드러움 (0 = 직선, 1 = 곡선)
      fill: false, // 선 아래 영역 채우기 여부
    })),
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false, // 단일 데이터셋이므로 범례 숨김
    },
    title: {
      display: true,
      text: '학습자별 점수 분포',
      color: '#333',
      font: {
        size: 16,
      },
    },
    tooltip: {
      callbacks: {
        label: function (context) {
          let label = context.dataset.label || ''
          if (label) {
            label += ': '
          }
          label += context.parsed.y + '명'
          return label
        },
      },
    },
  },
  scales: {
    x: {
      title: {
        display: true,
        text: '점수 구간',
        color: '#555',
      },
      ticks: {
        color: '#333',
      },
      grid: {
        display: false,
      },
    },
    y: {
      title: {
        display: true,
        text: '학습자 수',
        color: '#555',
      },
      beginAtZero: true,
      ticks: {
        color: '#333',
        stepSize: 5, // 필요에 따라 조정
      },
      grid: {
        color: '#e0e0e0',
      },
    },
  },
}
</script>
