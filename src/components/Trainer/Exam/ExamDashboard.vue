<template>
  <v-container style="max-width: 1150px !important;">
    <v-row>
      <v-col cols="12">
        <div class="d-flex align-end mb-4">
          <h2 class="text-h5 font-weight-bold mr-2">테스트 응시 현황</h2>
          <p class="text-body-2 text-medium-emphasis">{{ totalStudents }} 훈련생들의 테스트 응시 결과를 확인하고, AI Report를 생성합니다.</p>
        </div>
        <error-alert v-if="error" :message="error" />
      </v-col>
    </v-row>
    <v-row dense>
      <!-- 왼쪽: AI 테스트 결과 요약, 문항별 분석 -->
      <v-col cols="12" sm="9">
        <v-card elevation="0" style="height: 280px;">
          <v-card-title class="text-body-2" style="color: #757575;">AI Summary</v-card-title>
          <v-divider color="secondary" class="custom-divider"></v-divider>
          <v-card-text>
            <div v-if="aiSummary" class="ai-summary">
              <div class="summary-section">
                <h3 class="text-subtitle-1 font-weight-bold mb-2">테스트 요약</h3>
                <p class="text-body-2">{{ aiSummary.testSummary }}</p>
              </div>
              <div class="summary-section">
                <h3 class="text-subtitle-1 font-weight-bold mb-2">취약 부분 분석</h3>
                <p class="text-body-2">{{ aiSummary.weakPoints }}</p>
              </div>
              <div class="summary-section">
                <h3 class="text-subtitle-1 font-weight-bold mb-2">향후 방향</h3>
                <p class="text-body-2">{{ aiSummary.futureDirection }}</p>
              </div>
            </div>
            <v-progress-circular v-else indeterminate color="primary"></v-progress-circular>
          </v-card-text>
        </v-card>
        <v-card elevation="0" style="height: auto; margin-top: 16px;">
          <v-card-title class="text-body-2" style="color: #757575;">문항별 분석</v-card-title>
          <v-divider color="secondary" class="custom-divider"></v-divider>
          <v-card-text>
            <div v-if="questionAnalysis.length > 0">
              <apexchart
                type="bar"
                height="300"
                :options="questionChartOptions"
                :series="questionChartSeries"
              ></apexchart>
              
              <v-expansion-panels class="mt-4">
                <v-expansion-panel
                  v-for="(question, index) in questionAnalysis"
                  :key="index"
                  class="mb-2"
                >
                  <v-expansion-panel-title>
                    <div class="d-flex align-center">
                      <span class="mr-2">문제 {{ question.questionNo }}</span>
                      <v-chip size="small" class="mr-2" color="primary" variant="outlined">
                        {{ question.documentName }}
                      </v-chip>
                      <v-chip size="small" class="mr-2" :color="getDifficultyColor(question.difficulty)">
                        {{ question.difficulty }}
                      </v-chip>
                      <span class="ml-auto">정답률: {{ question.correctRate }}%</span>
                    </div>
                  </v-expansion-panel-title>
                  <v-expansion-panel-text>
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
            <v-progress-circular v-else indeterminate color="primary"></v-progress-circular>
          </v-card-text>
        </v-card>
      </v-col>
      <!-- 오른쪽: 평균 점수/합격자 수, 학습자별 분석, Tag별 분석 -->
      <v-col cols="12" sm="3">
        <v-card elevation="0" style="height: 180px;">
          <v-card-title class="text-body-2" style="color: #757575;">평균 점수 / 합격자 수</v-card-title>
          <v-divider color="secondary" class="custom-divider"></v-divider>
          <v-card-text>
            <div v-if="scoreStats" class="d-flex flex-column align-center justify-center h-100">
              <div class="text-center mb-4">
                <p class="text-h4 font-weight-bold" style="color: #1976D2;">{{ scoreStats.averageScore }}</p>
                <p class="text-body-2">평균 점수</p>
              </div>
              <div class="text-center">
                <p class="text-h4 font-weight-bold" style="color: #4CAF50;">{{ scoreStats.passCount }}</p>
                <p class="text-body-2">합격자 수</p>
              </div>
            </div>
            <v-progress-circular v-else indeterminate color="primary"></v-progress-circular>
          </v-card-text>
        </v-card>
        <v-card elevation="0" style="height: auto; margin-top: 16px;">
          <v-card-title class="text-body-2" style="color: #757575;">학습자별 분석</v-card-title>
          <v-divider color="secondary" class="custom-divider"></v-divider>
          <v-card-text>
            <div v-if="studentAnalysis.length > 0">
              <apexchart
                type="area"
                height="200"
                :options="studentChartOptions"
                :series="studentChartSeries"
              ></apexchart>
              
              <v-table density="compact" class="mt-4">
                <thead>
                  <tr>
                    <th>학습자</th>
                    <th class="text-right">점수</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(student, index) in studentAnalysis" :key="index">
                    <td>{{ student.name }}</td>
                    <td class="text-right">{{ student.score }}</td>
                  </tr>
                </tbody>
              </v-table>
            </div>
            <v-progress-circular v-else indeterminate color="primary"></v-progress-circular>
          </v-card-text>
        </v-card>
        <v-card elevation="0" style="height: 220px; margin-top: 16px;">
          <v-card-title class="text-body-2" style="color: #757575;">Tag별 분석</v-card-title>
          <v-divider color="secondary" class="custom-divider"></v-divider>
          <v-card-text>
            <div v-if="tagAnalysis.length > 0" class="d-flex justify-center">
              <apexchart
                type="radialBar"
                height="180"
                :options="tagChartOptions"
                :series="tagChartSeries"
              ></apexchart>
            </div>
            <v-progress-circular v-else indeterminate color="primary"></v-progress-circular>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import VueApexCharts from 'vue3-apexcharts';
import axios from 'axios';

// 임시 데이터
const mockData = {
  totalStudents: 25,
  aiSummary: {
    testSummary: "전체적으로 기본적인 개념 이해도는 양호하나, 실무 적용 부분에서 다소 부족한 점이 발견되었습니다. 특히 보안 관련 문항에서 낮은 정답률을 보였습니다.",
    weakPoints: "1. 보안 개념 이해도 부족\n2. 실무 적용 능력 미흡\n3. 문제 해결 과정에서의 논리적 접근 부족",
    futureDirection: "1. 보안 관련 실습 강화\n2. 실무 사례 기반 학습 강화\n3. 문제 해결 능력 향상을 위한 훈련 필요"
  },
  questionAnalysis: [
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
  ],
  scoreStats: {
    averageScore: 75.5,
    passCount: 18
  },
  studentAnalysis: [
    { name: "김철수", score: 85 },
    { name: "이영희", score: 92 },
    { name: "박지민", score: 78 },
    { name: "최수진", score: 65 },
    { name: "정민호", score: 88 },
    { name: "강다은", score: 72 },
    { name: "윤서연", score: 95 },
    { name: "임재현", score: 68 },
    { name: "한미영", score: 82 },
    { name: "송태호", score: 75 }
  ],
  tagAnalysis: [
    { name: "보안 기초", score: 85 },
    { name: "네트워크", score: 70 },
    { name: "시스템", score: 65 },
    { name: "암호화", score: 75 },
    { name: "정책", score: 90 }
  ]
};

// 데이터 상태 관리
const totalStudents = ref(mockData.totalStudents);
const aiSummary = ref(mockData.aiSummary);
const questionAnalysis = ref(mockData.questionAnalysis);
const scoreStats = ref(mockData.scoreStats);
const studentAnalysis = ref(mockData.studentAnalysis);
const tagAnalysis = ref(mockData.tagAnalysis);
const loading = ref(false);
const error = ref(null);

// 공통 차트 옵션
const commonChartOptions = {
  chart: {
    toolbar: { show: false },
    animations: {
      enabled: true,
      easing: 'easeinout',
      speed: 800
    },
    fontFamily: 'Roboto, sans-serif'
  },
  tooltip: {
    theme: 'light',
    x: {
      show: true
    }
  },
  responsive: [{
    breakpoint: 480,
    options: {
      chart: {
        height: 200
      }
    }
  }]
};

// 차트 옵션 및 시리즈
const questionChartOptions = computed(() => ({
  ...commonChartOptions,
  chart: {
    ...commonChartOptions.chart,
    type: 'bar'
  },
  plotOptions: {
    bar: {
      horizontal: false,
      columnWidth: '55%',
      borderRadius: 4
    }
  },
  dataLabels: { enabled: false },
  stroke: {
    show: true,
    width: 2,
    colors: ['transparent']
  },
  xaxis: {
    categories: questionAnalysis.value.map(q => `문제 ${q.questionNo}`),
    title: { text: '문제 번호' }
  },
  yaxis: {
    title: { text: '정답률 (%)' },
    min: 0,
    max: 100
  },
  fill: {
    opacity: 0.8,
    colors: ['#1976D2']
  },
  tooltip: {
    ...commonChartOptions.tooltip,
    y: { formatter: (val) => `${val}%` }
  }
}));

const questionChartSeries = computed(() => [{
  name: '정답률',
  data: questionAnalysis.value.map(q => q.correctRate)
}]);

const studentChartOptions = computed(() => ({
  ...commonChartOptions,
  chart: {
    ...commonChartOptions.chart,
    type: 'area'
  },
  dataLabels: { enabled: false },
  stroke: {
    curve: 'smooth',
    width: 2
  },
  xaxis: {
    type: 'category',
    categories: studentAnalysis.value.map(s => s.name),
    labels: { 
      rotate: -45, 
      rotateAlways: true,
      style: {
        fontSize: '12px'
      }
    }
  },
  yaxis: {
    title: { text: '점수' },
    min: 0,
    max: 100
  },
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.7,
      opacityTo: 0.3,
      stops: [0, 90, 100]
    },
    colors: ['#4CAF50']
  },
  tooltip: {
    ...commonChartOptions.tooltip,
    y: { formatter: (val) => `${val}점` }
  }
}));

const studentChartSeries = computed(() => [{
  name: '점수',
  data: studentAnalysis.value.map(s => s.score)
}]);

const tagChartOptions = computed(() => ({
  ...commonChartOptions,
  chart: {
    ...commonChartOptions.chart,
    type: 'radialBar'
  },
  plotOptions: {
    radialBar: {
      startAngle: -135,
      endAngle: 135,
      hollow: {
        margin: 15,
        size: '70%',
      },
      dataLabels: {
        name: {
          show: true,
          fontSize: '13px',
          fontWeight: 600,
          offsetY: 10
        },
        value: {
          show: true,
          fontSize: '20px',
          fontWeight: 600,
          offsetY: -10,
          formatter: (val) => `${val}%`
        }
      }
    }
  },
  fill: {
    type: 'gradient',
    gradient: {
      shade: 'dark',
      shadeIntensity: 0.15,
      inverseColors: false,
      opacityFrom: 1,
      opacityTo: 1,
      stops: [0, 50, 65, 91]
    },
    colors: ['#FF9800', '#F44336', '#2196F3', '#4CAF50', '#9C27B0']
  },
  stroke: { dashArray: 4 },
  labels: tagAnalysis.value.map(t => t.name)
}));

const tagChartSeries = computed(() => tagAnalysis.value.map(t => t.score));

// 난이도에 따른 색상 반환 함수
const getDifficultyColor = (difficulty) => {
  const colors = {
    '쉬움': 'success',
    '보통': 'primary',
    '어려움': 'error'
  };
  return colors[difficulty] || 'primary';
};

// 데이터 가져오기
const fetchData = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    // 실제 API 연동 시 주석 해제
    // const response = await axios.get('/api/exam/dashboard');
    // const data = response.data;
    
    // 임시 데이터 사용
    const data = mockData;
    
    // 데이터 유효성 검사
    if (!data || typeof data !== 'object') {
      throw new Error('유효하지 않은 데이터 형식입니다.');
    }
    
    // 필수 데이터 필드 검사
    const requiredFields = ['totalStudents', 'aiSummary', 'questionAnalysis', 'scoreStats', 'studentAnalysis', 'tagAnalysis'];
    for (const field of requiredFields) {
      if (!(field in data)) {
        throw new Error(`필수 데이터 필드가 누락되었습니다: ${field}`);
      }
    }
    
    // 데이터 할당
    totalStudents.value = data.totalStudents;
    aiSummary.value = data.aiSummary;
    questionAnalysis.value = data.questionAnalysis;
    scoreStats.value = data.scoreStats;
    studentAnalysis.value = data.studentAnalysis;
    tagAnalysis.value = data.tagAnalysis;
  } catch (err) {
    console.error('데이터를 가져오는 중 오류가 발생했습니다:', err);
    error.value = err.message || '데이터를 불러오는 중 오류가 발생했습니다.';
  } finally {
    loading.value = false;
  }
};

// 에러 메시지 표시 컴포넌트
const ErrorAlert = {
  props: ['message'],
  template: `
    <v-alert
      type="error"
      variant="tonal"
      class="mb-4"
      closable
    >
      {{ message }}
    </v-alert>
  `
};

onMounted(() => {
  fetchData();
});
</script>

<script>
export default {
  components: {
    apexchart: VueApexCharts
  }
}
</script>

<style scoped>
.custom-divider {
  height: 3px !important;
  border-radius: 2px;
}

.ai-summary {
  height: 100%;
  overflow-y: auto;
}

.summary-section {
  margin-bottom: 16px;
}

.question-detail {
  background-color: #f5f5f5;
  border-radius: 4px;
}

.v-expansion-panel {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  margin-bottom: 8px;
}

.v-expansion-panel-title {
  font-size: 14px;
}

.v-table {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}

/* 반응형 스타일 추가 */
@media (max-width: 600px) {
  .v-card {
    margin-bottom: 16px;
  }
  
  .v-expansion-panel-title {
    font-size: 12px;
  }
  
  .v-chip {
    font-size: 11px;
  }
  
  .text-h4 {
    font-size: 1.5rem !important;
  }
}
</style>