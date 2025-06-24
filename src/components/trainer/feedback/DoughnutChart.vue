<template>
  <Doughnut :data="chartData" :options="chartOptions" />
</template>

<script setup>
import { computed, defineProps } from 'vue'
import { Doughnut } from 'vue-chartjs'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

const props = defineProps({
  data: {
    type: Object,
    required: true,
    default: () => ({
      labels: [],
      datasets: [],
    }),
  },
})

const chartData = computed(() => {
  // props.data의 datasets에 backgroundColor와 borderColor를 적용
  return {
    labels: props.data.labels,
    datasets: props.data.datasets.map((dataset) => ({
      ...dataset,
      // 요청된 색상 #1e2251 계열로 변경
      backgroundColor: ['#1e2251', '#4a507f', '#7e83af', '#b0b4de'], // 어두운 계열 색상
      borderColor: '#ffffff',
      borderWidth: 1,
    })),
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        color: '#333', // 범례 텍스트 색상
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
            label += context.parsed
          }
          return label
        },
      },
    },
  },
  // 중앙 텍스트를 위한 플러그인 (필요하다면 추가)
  // plugins: [
  //   {
  //     id: 'centerText',
  //     beforeDraw: (chart) => {
  //       const { width, height, ctx } = chart;
  //       ctx.restore();
  //       const fontSize = (height / 114).toFixed(2);
  //       ctx.font = `${fontSize}em sans-serif`;
  //       ctx.textBaseline = 'middle';
  //       const text = '70%'; // 예시 텍스트, 실제 데이터에 따라 변경
  //       const textX = Math.round((width - ctx.measureText(text).width) / 2);
  //       const textY = height / 2;
  //       ctx.fillText(text, textX, textY);
  //       ctx.save();
  //     }
  //   }
  // ]
}
</script>
