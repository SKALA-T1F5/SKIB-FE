<template>
  <div class="question-analysis-chart">
    <div v-if="loading" class="d-flex justify-center align-center" style="height: 350px;">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </div>
    <div v-else-if="error" class="d-flex justify-center align-center" style="height: 350px;">
      <v-alert type="error" variant="tonal" class="ma-4">
        {{ error }}
      </v-alert>
    </div>
    <div v-else-if="!questions.length" class="d-flex justify-center align-center" style="height: 350px;">
      <v-alert type="info" variant="tonal" class="ma-4">
        데이터가 없습니다.
      </v-alert>
    </div>
    <div v-else>
      <div ref="chartContainer" class="mb-4">
        <apexchart type="bar" height="350" :options="chartOptions" :series="chartData" />
      </div>

      <v-expansion-panels class="question-panels">
        <v-expansion-panel class="panel-header" readonly elevation="0">
          <v-expansion-panel-title class="panel-title header-title">
            <div class="panel-content">
              <div class="panel-cell question-number">문제 번호</div>
              <div class="panel-cell document-name">문서명</div>
              <div class="panel-cell difficulty">난이도</div>
              <div class="panel-cell correct-rate">정답률</div>
            </div>
          </v-expansion-panel-title>
        </v-expansion-panel>

        <v-expansion-panel v-for="(question, index) in questions" :key="index" class="question-panel" elevation="0">
          <v-expansion-panel-title class="panel-title">
            <div class="panel-content">
              <div class="panel-cell question-number">문제 {{ question.questionNo }}</div>
              <div class="panel-cell document-name">{{ question.documentName }}</div>
              <div class="panel-cell difficulty"> {{ question.difficulty }} </div>
              <div class="panel-cell correct-rate">
                <div class="d-flex align-center">
                  <v-progress-linear
                    :model-value="question.correctRate"
                    :color="getCorrectRateColor(question.correctRate)"
                    height="8"
                    class="mr-2"
                    style="width: 60px;"
                  ></v-progress-linear>
                  <span>{{ question.correctRate }}%</span>
                </div>
              </div>
            </div>
          </v-expansion-panel-title>
          <v-expansion-panel-text elevation="0">
            <div class="question-detail pa-2">
              <p class="text-body-1 font-weight-bold mb-2">문제:</p>
              <p class="text-body-2 mb-4">{{ question.questionText }}</p>
              <p class="text-body-1 font-weight-bold mb-2">정답:</p>
              <p class="text-body-2">{{ question.correctAnswer }}</p>
            </div>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import VueApexCharts from 'vue3-apexcharts';
import { useTheme } from 'vuetify';
import axios from 'axios';

defineOptions({
  components: {
    apexchart: VueApexCharts
  }
});

const theme = useTheme();

const props = defineProps({
  examId: {
    type: String,
    required: false
  },
  questions: {
    type: Array,
    required: false
  }
});

const loading = ref(false);
const error = ref(null);
const questions = ref([]);
const chartContainer = ref(null);

// 임시 데이터
const mockQuestions = [
  {
    questionNo: 1,
    documentName: "보안 기초",
    difficulty: "쉬움",
    correctRate: 85,
    questionText: "다음 중 가장 안전한 비밀번호 정책은?",
    correctAnswer: "대소문자, 숫자, 특수문자를 포함한 12자 이상의 비밀번호"
  },
  {
    questionNo: 2,
    documentName: "네트워크 보안",
    difficulty: "보통",
    correctRate: 65,
    questionText: "방화벽의 기본 동작 방식에 대해 설명하시오.",
    correctAnswer: "허용된 트래픽만 통과시키고 나머지는 차단하는 방식"
  },
  {
    questionNo: 3,
    documentName: "시스템 보안",
    difficulty: "어려움",
    correctRate: 45,
    questionText: "SQL Injection 공격을 방어하기 위한 방법을 3가지 이상 설명하시오.",
    correctAnswer: "1. Prepared Statement 사용\n2. 입력값 검증\n3. 에러 메시지 숨기기\n4. 최소 권한 원칙 적용"
  },
  {
    questionNo: 4,
    documentName: "암호화",
    difficulty: "보통",
    correctRate: 70,
    questionText: "대칭키 암호화와 비대칭키 암호화의 차이점은?",
    correctAnswer: "대칭키는 동일한 키로 암호화/복호화, 비대칭키는 공개키/개인키 쌍으로 암호화/복호화"
  },
  {
    questionNo: 5,
    documentName: "보안 정책",
    difficulty: "쉬움",
    correctRate: 90,
    questionText: "보안 정책의 3대 원칙은?",
    correctAnswer: "기밀성, 무결성, 가용성"
  }
];

const fetchData = async () => {
  if (props.questions) {
    questions.value = props.questions;
    return;
  }

  if (!props.examId) {
    questions.value = mockQuestions;
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    // 실제 API 연동 시 주석 해제
    // const response = await axios.get(`/api/exam/${props.examId}/questions`);
    // questions.value = response.data;

    // 임시 데이터 사용
    questions.value = mockQuestions;
  } catch (err) {
    console.error('문항 데이터를 가져오는 중 오류가 발생했습니다:', err);
    error.value = err instanceof Error ? err.message : '데이터를 불러오는 중 오류가 발생했습니다.';
  } finally {
    loading.value = false;
  }
};

const chartData = computed(() => [{
  name: '정답률',
  data: questions.value.map(question => question.correctRate)
}]);

const getDifficultyColor = (difficulty) => {
  switch (difficulty) {
    case '쉬움':
      return theme.current.value.colors.success;
    case '보통':
      return theme.current.value.colors.warning;
    case '어려움':
      return theme.current.value.colors.error;
    default:
      return theme.current.value.colors.primary;
  }
};

const getCorrectRateColor = (rate) => {
  const opacity = rate / 100;
  return `rgba(var(--v-theme-primary), ${opacity})`;
};

const chartOptions = computed(() => ({
  chart: {
    type: 'bar',
    height: 350,
    toolbar: {
      show: true,
      tools: {
        download: true,
        selection: true,
        zoom: true,
        zoomin: true,
        zoomout: true,
        pan: true,
        reset: true
      },
      autoSelected: 'zoom'
    }
  },
  colors: questions.value.map(question => getCorrectRateColor(question.correctRate)),
  plotOptions: {
    bar: {
      borderRadius: 4,
      horizontal: false,
      columnWidth: '55%',
      distributed: true
    }
  },
  dataLabels: {
    enabled: false
  },
  legend: {
    show: false
  },
  grid: {
    show: false
  },
  xaxis: {
    categories: questions.value.map(question => `문항 ${question.questionNo}`),
    axisBorder: {
      show: true,
      color: theme.current.value.colors.surfaceVariant
    },
    axisTicks: {
      show: false
    },
    labels: {
      show: true,
      style: {
        colors: theme.current.value.colors.onSurface,
        fontSize: '12px'
      }
    }
  },
  yaxis: {
    show: false
  }
}));

// props.questions가 변경될 때마다 데이터 업데이트
watch(() => props.questions, (newQuestions) => {
  if (newQuestions) {
    questions.value = newQuestions;
  }
}, { immediate: true });

// examId가 변경될 때마다 데이터 다시 가져오기
watch(() => props.examId, () => {
  if (!props.questions) {
    fetchData();
  }
}, { immediate: true });

onMounted(() => {
  if (!props.questions) {
    fetchData();
  }
});
</script>

<style scoped>
.question-analysis-chart {
  width: 100%;
  min-height: 350px;
  position: relative;
}

.question-panels {
  border: 1px solid rgb(var(--v-theme-secondary));
  border-radius: 8px;
  overflow: hidden;
}

.panel-header {
  background-color: rgb(var(--v-theme-secondary));
  border-bottom: 1px solid rgb(var(--v-theme-secondary));
  padding-right:20px
}

.panel-header ::v-deep(.v-expansion-panel-title__icon) {
  display: none !important;
}

.question-panel {
  border-bottom: 1px solid rgba(var(--v-theme-secondary), 0.12);
}

.question-panel:last-child {
  border-bottom: none;
}

.panel-title {
  background-color: rgb(var(--v-theme-surface));
  min-height: 48px !important;
}

.question-panel ::v-deep(.v-expansion-panel-text) {
  padding: 0;
  background-color: rgb(var(--v-theme-surface));
  border-top: 1px solid rgba(var(--v-theme-secondary), 0.12);
}

.question-detail {
  background-color: rgb(var(--v-theme-surface));
  border-radius: 0;
  border: none;
  margin: 0;
}

.panel-content {
  display: grid;
  grid-template-columns: 80px 1fr 100px 120px;
  gap: 16px;
  width: 100%;
  align-items: center;
}

.panel-cell {
  display: flex;
  align-items: center;
}

.question-number {
  font-weight: 500;
}

.document-name {
  min-width: 120px;
}

.difficulty {
  justify-content: center;
}

.correct-rate {
  justify-content: flex-end;
  font-weight: 500;
}

.header-title {
  color: rgb(var(--v-theme-on-secondary));
  font-weight: 500;
}

.header-title .panel-content {
  font-weight: 500;
}

@media (max-width: 600px) {
  .question-analysis-chart {
    min-height: 300px;
  }

  .panel-content {
    grid-template-columns: 60px 1fr 80px 100px;
    gap: 8px;
  }

  .v-chip {
    font-size: 11px;
  }

  .question-panel ::v-deep(.v-expansion-panel-text) {
    padding: 0;
  }

  .text-body-1 {
    font-size: 14px !important;
  }

  .text-body-2 {
    font-size: 13px !important;
  }
}
</style>