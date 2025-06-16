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
        <v-card elevation="0" class="ai-summary-card">
          <v-card-title class="card-title">AI Summary</v-card-title>
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
        <v-card elevation="0" class="mt-4">
          <v-card-title class="card-title">문항별 분석</v-card-title>
          <v-divider color="secondary" class="custom-divider"></v-divider>
          <v-card-text>
            <QuestionAnalysisChart :exam-id="examId" />
          </v-card-text>
        </v-card>
      </v-col>
      <!-- 오른쪽: 평균 점수/합격자 수, 학습자별 분석, Tag별 분석 -->
      <v-col cols="12" sm="3">
        <v-card elevation="0" class="score-stats-card">
          <v-card-title class="card-title">평균 점수 / 합격자 수</v-card-title>
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
        <v-card elevation="0" class="mt-4">
          <v-card-title class="card-title">학습자별 분석</v-card-title>
          <v-divider color="secondary" class="custom-divider"></v-divider>
          <v-card-text>
            <StudentAnalysisChart :exam-id="examId" />
          </v-card-text>
        </v-card>
        <v-card elevation="0" class="mt-4">
          <v-card-title class="card-title">Tag별 분석</v-card-title>
          <v-divider color="secondary" class="custom-divider"></v-divider>
          <v-card-text>
            <TagAnalysisChart :exam-id="examId" />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import QuestionAnalysisChart from '../../chart/QuestionAnalysisChart.vue';
import StudentAnalysisChart from '../../chart/StudentAnalysisChart.vue';
import TagAnalysisChart from '../../chart/TagAnalysisChart.vue';

// Props 정의
const props = defineProps({
  examId: {
    type: String,
    required: true
  }
});

// 데이터 상태 관리
const totalStudents = ref(0);
const aiSummary = ref(null);
const scoreStats = ref(null);
const loading = ref(false);
const error = ref(null);

// 임시 데이터
const mockData = {
  totalStudents: 25,
  aiSummary: {
    testSummary: "전체적으로 기본적인 개념 이해도는 양호하나, 실무 적용 부분에서 다소 부족한 점이 발견되었습니다. 특히 보안 관련 문항에서 낮은 정답률을 보였습니다.",
    weakPoints: "1. 보안 개념 이해도 부족\n2. 실무 적용 능력 미흡\n3. 문제 해결 과정에서의 논리적 접근 부족",
    futureDirection: "1. 보안 관련 실습 강화\n2. 실무 사례 기반 학습 강화\n3. 문제 해결 능력 향상을 위한 훈련 필요"
  },
  scoreStats: {
    averageScore: 75.5,
    passCount: 18
  }
};

// 데이터 가져오기
const fetchData = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    // 실제 API 연동 시 주석 해제
    // const response = await axios.get(`/api/exam/${props.examId}/summary`);
    // const data = response.data;
    
    // 임시 데이터 사용
    const data = mockData;
    
    // 데이터 유효성 검사
    if (!data || typeof data !== 'object') {
      throw new Error('유효하지 않은 데이터 형식입니다.');
    }
    
    // 필수 데이터 필드 검사
    const requiredFields = ['totalStudents', 'aiSummary', 'scoreStats'];
    for (const field of requiredFields) {
      if (!(field in data)) {
        throw new Error(`필수 데이터 필드가 누락되었습니다: ${field}`);
      }
    }
    
    // 데이터 할당
    totalStudents.value = data.totalStudents;
    aiSummary.value = data.aiSummary;
    scoreStats.value = data.scoreStats;
  } catch (err) {
    console.error('데이터를 가져오는 중 오류가 발생했습니다:', err);
    error.value = err instanceof Error ? err.message : '데이터를 불러오는 중 오류가 발생했습니다.';
  } finally {
    loading.value = false;
  }
};

// 에러 메시지 표시 컴포넌트
const ErrorAlert = {
  props: {
    message: {
      type: String,
      required: true
    }
  },
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

<style scoped>
.custom-divider {
  height: 3px !important;
  border-radius: 2px;
}

.ai-summary-card {
  height: 280px;
}

.ai-summary {
  height: 100%;
  overflow-y: auto;
  padding-right: 8px;
}

.ai-summary::-webkit-scrollbar {
  width: 6px;
}

.ai-summary::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.ai-summary::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

.ai-summary::-webkit-scrollbar-thumb:hover {
  background: #555;
}

.summary-section {
  margin-bottom: 16px;
}

.summary-section:last-child {
  margin-bottom: 0;
}

.score-stats-card {
  height: 180px;
}

/* 반응형 스타일 */
@media (max-width: 600px) {
  .v-card {
    margin-bottom: 16px;
  }
  
  .text-h4 {
    font-size: 1.5rem !important;
  }

  .ai-summary-card {
    height: auto;
    min-height: 280px;
  }

  .score-stats-card {
    height: auto;
    min-height: 180px;
  }
}

.card-title {
  color: #757575 !important;
  font-size: 0.875rem !important;
  font-weight: 500 !important;
  padding: 16px !important;
  line-height: 1.5 !important;
}
</style>