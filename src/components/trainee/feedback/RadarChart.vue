<template>
  <div class="chart-container-wrapper">
    <Radar
      :data="chartData"
      :options="chartOptions"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
} from 'chart.js';
import { Radar } from 'vue-chartjs';

// ChartJS에 필요한 요소 등록
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

const props = defineProps({
  tagAccuracy: Object // { tag: score } 형태, TypeScript의 { [key: string]: number } 대신 Object로
});

const chartData = computed(() => {
  const labels = Object.keys(props.tagAccuracy);
  const data = Object.values(props.tagAccuracy);

  return {
    labels: labels,
    datasets: [
      {
        label: '정답률 (%)',
        backgroundColor: 'rgba(106, 138, 255, 0.4)', // 채워지는 영역 색상 (밝은 파란색)
        borderColor: 'rgba(106, 138, 255, 1)', // 라인 색상
        pointBackgroundColor: 'rgba(106, 138, 255, 1)', // 포인트 색상
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(106, 138, 255, 1)',
        data: data,
        borderWidth: 2,
        fill: true, // 영역 채우기
      }
    ]
  };
});

const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false, // 부모 컨테이너에 맞춰 크기 조절
  scales: {
    r: {
      angleLines: {
        color: '#e0e0e0' // 각도 선 색상
      },
      grid: {
        color: '#e0e0e0' // 그리드 선 색상
      },
      pointLabels: {
        color: '#495057', // 태그 라벨 색상
        font: {
          size: 14,
          weight: 'bold'
        }
      },
      ticks: {
        stepSize: 10, // 틱 간격
        beginAtZero: true,
        max: 100, // 최대 값은 100%
        color: '#6c757d', // 틱 라벨 색상
        backdropColor: 'rgba(255, 255, 255, 0.7)', // 틱 라벨 배경색
        backdropPadding: 2,
        display: true, // 틱 라벨 표시
        callback: function(value) { // value: any 제거
          return value + '%'; // 틱 라벨에 % 붙이기
        }
      }
    }
  },
  plugins: {
    legend: {
      display: false, // 범례 숨김
    },
    tooltip: {
      callbacks: {
        label: function(context) { // context: any 제거
          let label = context.dataset.label || '';
          if (label) {
            label += ': ';
          }
          if (context.parsed.r !== null) {
            label += context.parsed.r + '%';
          }
          return label;
        }
      }
    }
  }
});

// 데이터 변경 시 차트 옵션 업데이트 (필요시)
watch(() => props.tagAccuracy, () => {
  // 데이터가 변경되면 Chart.js가 자동으로 업데이트
}, { deep: true });

</script>

<style scoped>
.chart-container-wrapper {
  position: relative;
  height: 280px; /* 차트의 고정 높이 */
  width: 100%;
  max-width: 400px; /* 최대 너비 제한 */
  margin: 0 auto;
  padding-top: 10px;
  box-sizing: border-box;
}
</style>