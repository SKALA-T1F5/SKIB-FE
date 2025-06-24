<template>
  <Bar :data="chartData" :options="chartOptions" />
</template>

<script setup>
import { defineProps } from 'vue'
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
    type: Object,
    required: true,
  },
  chartOptions: {
    type: Object,
    default: () => ({}),
  },
})

const chartData = props.data
const chartOptions = props.chartOptions
</script>

<style scoped>
/* Chart.js 캔버스가 부모 컨테이너에 맞게 크기가 조정되도록 함 */
div {
  position: relative;
  width: 100%;
  height: 100%; /* 부모에 의해 정의된 높이를 따름 */
}
</style>
