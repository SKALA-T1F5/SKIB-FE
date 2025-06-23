<template>
  <div class="test-results-container">
    <div class="test-results-header">
      <h4>응시 테스트 목록 ({{ traineeId }})</h4>
    </div>
    <v-expansion-panels flat>
      <v-expansion-panel v-for="test in tests" :key="test.testId">
        <v-expansion-panel-title>
          <div class="test-title-summary">
            <v-icon small class="mr-2">mdi-text-box-multiple-outline</v-icon>
            <strong>{{ test.testName }}</strong>
            <v-spacer></v-spacer>
            <v-chip
              :color="test.status === 'Passed' ? 'green darken-1' : 'red darken-1'"
              x-small
              label
              text-color="white"
              class="ml-2"
            >
              {{ test.status === 'Passed' ? '합격' : '불합격' }}
            </v-chip>
            <span class="ml-3 text-subtitle-2 font-weight-bold">점수: {{ test.score }}점</span>
          </div>
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <div class="test-detail-content">
            <v-list dense>
              <v-list-item>
                <v-list-item-title>응시일: {{ test.submissionDate }}</v-list-item-title>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>응시 시간: {{ test.timeTaken }}분</v-list-item-title>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>
                  문제 수: 객관식 {{ test.mcqCount }}개, 주관식 {{ test.saqCount }}개
                </v-list-item-title>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>합격 점수: {{ test.passingScore }}점</v-list-item-title>
              </v-list-item>
              <v-list-item>
                <v-list-item-title
                  >재응시 가능: {{ test.retakeable ? '예' : '아니오' }}</v-list-item-title
                >
              </v-list-item>
            </v-list>
            <v-btn small color="primary" class="mt-4">상세 결과 보기</v-btn>
          </div>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
    <div v-if="tests.length === 0" class="no-tests-message">
      <v-icon size="48" color="grey lighten-1">mdi-text-box-remove-outline</v-icon>
      <p>응시한 테스트가 없습니다.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, defineProps } from 'vue'

const props = defineProps({
  traineeId: {
    type: String,
    required: true,
  },
})

const tests = ref([])

const fetchTraineeTests = async () => {
  // traineeId에 따라 해당 연수생의 테스트 목록을 가져오는 목업 데이터
  // 실제 애플리케이션에서는 API 호출을 통해 데이터를 가져옵니다.
  await new Promise((resolve) => setTimeout(resolve, 300)) // 로딩 지연 흉내

  const mockTests = {
    'T-001': [
      {
        testId: 'TEST-001-A',
        testName: '프로젝트 관리 기본 평가',
        score: 85,
        status: 'Passed',
        submissionDate: '2024-05-20',
        timeTaken: 45,
        mcqCount: 10,
        saqCount: 5,
        passingScore: 60,
        retakeable: true,
      },
      {
        testId: 'TEST-001-B',
        testName: 'Vue.js 기초',
        score: 55,
        status: 'Failed',
        submissionDate: '2024-05-25',
        timeTaken: 30,
        mcqCount: 15,
        saqCount: 0,
        passingScore: 70,
        retakeable: true,
      },
    ],
    'T-002': [
      {
        testId: 'TEST-002-A',
        testName: '데이터베이스 기초',
        score: 92,
        status: 'Passed',
        submissionDate: '2024-06-01',
        timeTaken: 60,
        mcqCount: 20,
        saqCount: 3,
        passingScore: 65,
        retakeable: false,
      },
    ],
    'T-003': [], // 테스트 없음
    'T-004': [
      {
        testId: 'TEST-004-A',
        testName: 'Python 프로그래밍 심화',
        score: 70,
        status: 'Passed',
        submissionDate: '2024-06-10',
        timeTaken: 90,
        mcqCount: 25,
        saqCount: 5,
        passingScore: 70,
        retakeable: true,
      },
    ],
  }
  tests.value = mockTests[props.traineeId] || []
}

onMounted(() => {
  fetchTraineeTests()
})
</script>

<style scoped>
.test-results-container {
  padding: 24px;
  background-color: #f7f9fc; /* 상위 expanded-item 배경색과 통일 */
  border-top: 1px solid #e0e0e0;
}

.test-results-header {
  font-size: 1.1rem;
  font-weight: bold;
  margin-bottom: 15px;
  color: #555;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

.v-expansion-panels {
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.v-expansion-panel {
  border-bottom: 1px solid #eee !important;
}

.v-expansion-panel:last-child {
  border-bottom: none !important;
}

.test-title-summary {
  display: flex;
  align-items: center;
  font-weight: 500;
  font-size: 0.95rem;
  color: #333;
}

.test-detail-content {
  padding: 10px 0 10px 20px;
  font-size: 0.9rem;
  color: #555;
}

.v-list-item-title {
  font-size: 0.9rem !important;
}

.no-tests-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px 0;
  color: #aaa;
  font-size: 1rem;
  background-color: #ffffff;
  border-radius: 8px;
  margin-top: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.no-tests-message p {
  margin-top: 10px;
}
</style>
