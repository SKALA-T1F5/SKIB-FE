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

const props = defineProps({
  myScore: Number, // 현재 나의 점수 (레벨)
  allParticipantScores: Array, // 전체 응시자 점수 목록
  myUserId: String, // 나의 userId (그래프에 나의 위치를 표시하기 위함)
});

// 가상의 과거 레벨 데이터를 생성합니다.
// 실제로는 백엔드에서 나의 과거 시험 점수 이력을 받아와야 합니다.
const generatePastLevels = () => {
  const levels = [];
  const today = new Date();
  for (let i = 20; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - (i * 7)); // 1주 간격으로 과거 데이터
    const monthDay = `${date.getMonth() + 1}/${date.getDate()}`;

    // 나의 현재 점수를 기반으로 과거 점수를 무작위로 생성 (실제 데이터로 대체 필요)
    let score = props.myScore + (Math.random() * 20 - 10); // +/- 10점 범위
    score = Math.max(0, Math.min(100, Math.round(score))); // 0-100 범위 유지
    levels.push({ date: monthDay, score: score });
  }
  // 마지막 데이터는 나의 현재 점수로 정확히 설정
  levels[levels.length - 1].score = props.myScore;
  return levels;
};

const pastLevels = ref(generatePastLevels());

// Chart.js 데이터 설정
const chartData = computed(() => {
  const labels = pastLevels.value.map(level => level.date);
  const data = pastLevels.value.map(level => level.score);

  // 현재 나의 위치를 위한 데이터셋 (점으로 표시)
  // 가장 오른쪽 마지막 데이터 포인트에만 마커를 표시
  const myPositionData = Array(data.length).fill(null);
  myPositionData[data.length - 1] = props.myScore;

  return {
    labels: labels,
    datasets: [
      {
        label: '나의 레벨',
        backgroundColor: 'rgba(106, 138, 255, 0.2)', // 영역 채우기 색상
        borderColor: 'rgba(106, 138, 255, 1)', // 라인 색상
        borderWidth: 2,
        pointRadius: 4, // 기본 포인트 크기
        pointBackgroundColor: 'rgba(106, 138, 255, 1)',
        pointBorderColor: '#fff',
        pointHoverRadius: 6,
        data: data,
        fill: true, // 영역 채우기 활성화
        tension: 0.4, // 라인 곡선 설정 (꺾은선 효과)
      },
      {
        label: '현재 나의 위치', // 이 데이터셋은 마커만 표시
        backgroundColor: 'rgba(255, 193, 7, 1)', // 마커 색상
        borderColor: 'rgba(255, 193, 7, 1)',
        pointRadius: 8, // 현재 위치 마커 크기 강조
        pointBackgroundColor: 'rgba(255, 193, 7, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointHoverRadius: 10,
        data: myPositionData, // 마지막 데이터 포인트에만 값
        showLine: false, // 선은 그리지 않음
        tooltip: {
            callbacks: {
                label: function(context) { // context: any 제거
                    return `현재 레벨: ${context.parsed.y}%`;
                }
            }
        }
      }
    ]
  };
});

// Chart.js 옵션 설정
const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false, // 범례 숨김
    },
    tooltip: {
        mode: 'index', // 'as const' 제거
        intersect: false, // 툴팁이 겹쳐도 표시
        callbacks: {
            title: function(context) { // context: any 제거
                return `날짜: ${context[0].label}`;
            },
            label: function(context) { // context: any 제거
                let label = context.dataset.label || '';
                if (label) {
                    label += ': ';
                }
                if (context.parsed.y !== null) {
                    label += context.parsed.y + '%';
                }
                return label;
            }
        }
    }
  },
  scales: {
    x: {
      grid: {
        display: true, // 그리드 라인 표시 (세로선)
        drawOnChartArea: true,
        drawTicks: false,
        color: '#e0e0e0', // 그리드 라인 색상
      },
      ticks: {
        display: true, // X축 틱 라벨 표시
        color: '#6c757d',
        autoSkip: true, // 라벨이 많을 경우 자동으로 건너뛰기
        maxRotation: 0,
        minRotation: 0,
      }
    },
    y: {
      beginAtZero: true,
      max: 100, // Y축 최대값 100%
      grid: {
        display: true, // 그리드 라인 표시 (가로선)
        drawOnChartArea: true,
        drawTicks: false,
        color: '#e0e0e0', // 그리드 라인 색상
      },
      ticks: {
        stepSize: 10, // 틱 간격 10
        color: '#6c757d',
        callback: function(value) { // value: any 제거
          return value + '%'; // Y축 라벨에 % 붙이기
        }
      }
    }
  }
});

// props 변경 감지 (나의 점수가 변경될 경우 등)
watch([() => props.myScore, () => props.allParticipantScores], () => {
    // 실제 백엔드 연동 시, 이 부분에서 새로운 데이터를 기반으로 pastLevels를 다시 fetch하는 로직 필요
    // 지금은 myScore가 변경될 때마다 가상 과거 데이터를 다시 생성
    pastLevels.value = generatePastLevels();
}, { deep: true });

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