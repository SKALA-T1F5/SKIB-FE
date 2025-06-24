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
  tagAccuracy: {
    type: Object, // { 'TAG1': { correct: 10, total: 20 }, 'TAG2': { correct: 15, total: 20 } }
    required: true,
  },
})

const chartData = computed(() => {
  const labels = Object.keys(props.tagAccuracy)
  const correctData = labels.map((tag) => props.tagAccuracy[tag].correct)
  const totalData = labels.map((tag) => props.tagAccuracy[tag].total)

  // Stacked Bar Chart를 활용하여 100% 배경과 맞춘 문제 수의 비율을 표현
  return {
    labels: labels,
    datasets: [
      {
        label: '맞춘 문제 수',
        data: correctData,
        backgroundColor: '#1e2251', // 맞춘 문제 색상
        borderColor: '#1e2251',
        borderWidth: 1,
        stack: 'Stack 1', // 스택 그룹
      },
      {
        label: '틀린 문제 수',
        data: labels.map((tag, index) => totalData[index] - correctData[index]),
        backgroundColor: '#d6daeb', // #1e2251의 연한 버전
        borderColor: '#d6daeb',
        borderWidth: 1,
        stack: 'Stack 1', // 동일 스택 그룹
      },
    ],
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        color: '#333',
      },
    },
    title: {
      display: true,
      text: 'Tag별 정답률',
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
          if (context.dataset.label === '맞춘 문제 수') {
            label += context.parsed.y + '개'
          } else if (context.dataset.label === '틀린 문제 수') {
            label += context.parsed.y + '개'
          }
          return label
        },
      },
    },
  },
  scales: {
    x: {
      stacked: true, // X축 스택 활성화
      title: {
        display: true,
        text: '태그',
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
      stacked: true, // Y축 스택 활성화
      title: {
        display: true,
        text: '문제 수',
        color: '#555',
      },
      beginAtZero: true,
      ticks: {
        color: '#333',
      },
      grid: {
        color: '#e0e0e0',
      },
    },
  },
}
</script>
