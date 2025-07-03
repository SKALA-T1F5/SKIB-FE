<template>
  <div class="chart-container-wrapper">
    <Line
      :data="chartData"
      :options="chartOptions"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler // 영역 채우기를 위해 필요
} from 'chart.js';
import { Line } from 'vue-chartjs';

// ChartJS에 필요한 요소 등록
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const { t } = useI18n();

const props = defineProps({
  myScore: Number, // 현재 나의 점수 (레벨)
  allParticipantScores: Array, // 전체 응시자 점수 목록 (이제 scoreDistribution으로 대체)
  myUserId: String, // 나의 userId (그래프에 나의 위치를 표시하기 위함)
});

// 점수 분포 데이터(구간별 userCount) 기반으로 차트 데이터 생성
const scoreDistribution = computed(() => {
  // allParticipantScores는 [{userId, score}] 배열이지만, 실제로는 scoreDistribution 구간별 userCount가 필요
  // props.allParticipantScores를 [{userId, score}] 배열로 받는 대신, 점수별 빈도수로 변환
  // 예: [ {score: 10}, {score: 20}, {score: 10} ] => {10: 2, 20: 1}
  const freq = {};
  props.allParticipantScores.forEach((p) => {
    const score = p.score;
    freq[score] = (freq[score] || 0) + 1;
  });
  // x축: 0~100까지 10점 단위 구간, y축: 각 구간별 응시자 수
  const bins = Array.from({ length: 11 }, (_, i) => i * 10); // [0, 10, 20, ..., 100]
  const binCounts = bins.map((bin) => {
    // 해당 구간에 속하는 점수의 응시자 수 합산
    let count = 0;
    for (let s = bin; s < bin + 10 && s <= 100; s++) {
      count += freq[s] || 0;
    }
    return count;
  });
  return { bins, binCounts };
});

const chartData = computed(() => {
  const { bins, binCounts } = scoreDistribution.value;
  // x축: 0, 10, 20, ..., 100
  // y축: 각 구간별 인원수
  const data = bins.map((bin, i) => ({
    x: bin,
    y: binCounts[i]
  }));
  return {
    datasets: [
      {
        label: t('lineAreaChart.participantsLabel'),
        data,
        backgroundColor: 'rgba(106, 138, 255, 0.2)',
        borderColor: 'rgba(106, 138, 255, 1)',
        borderWidth: 2,
        pointRadius: 4,
        pointBackgroundColor: 'rgba(106, 138, 255, 1)',
        pointBorderColor: '#fff',
        pointHoverRadius: 6,
        fill: true,
        tension: 0.4,
        showLine: true,
      },
    ],
  };
});

// Vertical Line 플러그인 정의
const verticalLinePlugin = {
  id: 'verticalLine',
  afterDraw(chart) {
    if (props.myScore == null) return;
    const xAxis = chart.scales.x;
    const yAxis = chart.scales.y;
    if (!xAxis || !yAxis) return;
    // myScore의 정확한 x좌표 계산 (bin index가 아니라 실제 점수값)
    const x = xAxis.getPixelForValue(props.myScore);
    const ctx = chart.ctx;
    // 1. 세로 라인
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x, yAxis.top);
    ctx.lineTo(x, yAxis.bottom);
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#e8b13a';
    ctx.stroke();
    ctx.restore();
    // 2. 내 점수 마커 (원)
    // ctx.save();
    // ctx.beginPath();
    // ctx.arc(x, yAxis.bottom, 7, 0, 2 * Math.PI);
    // ctx.fillStyle = '#e8b13a';
    // ctx.shadowColor = '#fff';
    // ctx.shadowBlur = 2;
    // ctx.fill();
    // ctx.lineWidth = 2;
    // ctx.strokeStyle = '#fff';
    // ctx.stroke();
    // ctx.restore();
    // 3. 'My Score' 라벨 (라인 오른쪽 상단)
    ctx.save();
    ctx.font = '10px sans-serif';
    ctx.fillStyle = '#e8b13a';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('My Score', x + 10, yAxis.top + 6);
    ctx.restore();
  },
};

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      mode: 'index',
      intersect: false,
      callbacks: {
        title: function (context) {
          // linear x축에서는 context[0].parsed.x 사용
          return `${t('lineAreaChart.tooltipTitle')}: ${context[0].parsed.x}${t('lineAreaChart.scoreUnit')}`;
        },
        label: function (context) {
          let label = context.dataset.label || '';
          if (label) {
            label += ': ';
          }
          if (context.parsed.y !== null) {
            label += context.parsed.y + t('lineAreaChart.peopleUnit');
          }
          return label;
        },
      },
    },
    verticalLine: verticalLinePlugin,
  },
  scales: {
    x: {
      type: 'linear',
      min: 0,
      max: 100,
      grid: {
        display: true,
        drawOnChartArea: true,
        drawTicks: false,
        color: '#e0e0e0',
      },
      ticks: {
        stepSize: 10,
        callback: (value) => `${value}${t('lineAreaChart.scoreUnit')}`,
        color: '#6c757d',
        autoSkip: false,
        maxRotation: 0,
        minRotation: 0,
      },
      title: {
        display: true,
        text: t('lineAreaChart.xAxisLabel'),
        color: '#495057',
        font: { size: 14, weight: 'bold' },
      },
    },
    y: {
      beginAtZero: true,
      grid: {
        display: true,
        drawOnChartArea: true,
        drawTicks: false,
        color: '#e0e0e0',
      },
      ticks: {
        stepSize: 1,
        color: '#6c757d',
        callback: function (value) {
          return value + t('lineAreaChart.peopleUnit');
        },
      },
      title: {
        display: true,
        text: t('lineAreaChart.yAxisLabel'),
        color: '#495057',
        font: { size: 14, weight: 'bold' },
      },
    },
  },
}));

// props 변경 감지 (나의 점수가 변경될 경우 등)
watch([() => props.myScore, () => props.allParticipantScores], () => {
    // 실제 백엔드 연동 시, 이 부분에서 새로운 데이터를 기반으로 pastLevels를 다시 fetch하는 로직 필요
    // 지금은 myScore가 변경될 때마다 가상 과거 데이터를 다시 생성
    // pastLevels.value = generatePastLevels();
}, { deep: true });

// Chart.js 플러그인 등록
import { onMounted } from 'vue';
onMounted(() => {
  if (!ChartJS.registry.plugins.get('verticalLine')) {
    ChartJS.register(verticalLinePlugin);
  }
});

</script>

<style scoped>
.chart-container-wrapper {
  position: relative;
  height: 250px; /* 차트의 고정 높이 */
  width: 100%;
  max-width: 800px; /* 최대 너비 제한 */
  margin: 0 auto;
  padding: 10px;
  box-sizing: border-box;
}
</style>