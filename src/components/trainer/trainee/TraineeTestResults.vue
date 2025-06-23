<template>
  <div class="test-results-container">
    <div v-if="isLoading" class="loading-container">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
      <p class="loading-text">테스트 목록을 불러오는 중입니다...</p>
    </div>

    <div v-else-if="testResults.length === 0" class="no-results-inner">
      <v-icon size="48" color="grey lighten-1">mdi-inbox-remove</v-icon>
      <p class="no-results-text">응시한 테스트가 없습니다.</p>
    </div>

    <v-expansion-panels v-else multiple class="test-results-panels-inner">
      <v-expansion-panel v-for="test in testResults" :key="test.testId" class="mb-3 test-panel">
        <v-expansion-panel-header class="test-header">
          <div class="test-summary-info">
            <strong>{{ test.testName }}</strong>
            <span class="ml-4 text-caption grey--text">({{ test.testDate }})</span>
          </div>
          <v-chip :color="test.passed ? 'success' : 'error'" small class="ml-auto">
            {{ test.passed ? '합격' : '불합격' }}
          </v-chip>
        </v-expansion-panel-header>
        <v-expansion-panel-content class="test-content">
          <TraineeFeedbackComponent :test-id="test.testId" />
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import TraineeFeedbackComponent from '@/components/trainer/trainee/TraineeFeedbackComponent.vue' // 새로 생성할 컴포넌트

const props = defineProps({
  traineeId: {
    type: String,
    required: true,
  },
})

const isLoading = ref(true)
const testResults = ref([])

const fetchTraineeTestList = async (traineeId) => {
  isLoading.value = true
  testResults.value = []
  try {
    // Simulate API call to get a trainee's list of tests
    await new Promise((resolve) => setTimeout(resolve, 600))

    // Mock data for test list
    if (traineeId === 'T-001') {
      testResults.value = [
        {
          testId: 'test-101',
          testName: 'Front-end 기초 평가',
          testDate: '2024-05-10 14:30',
          passed: true,
        },
        {
          testId: 'test-102',
          testName: '자료구조 및 알고리즘',
          testDate: '2024-06-01 10:00',
          passed: false,
        },
      ]
    } else if (traineeId === 'T-002') {
      testResults.value = [
        {
          testId: 'test-201',
          testName: 'Database 기본 이해',
          testDate: '2024-05-15 11:00',
          passed: true,
        },
      ]
    } else if (traineeId === 'T-003') {
      testResults.value = [
        {
          testId: 'test-301',
          testName: '네트워크 기초',
          testDate: '2024-05-20 13:00',
          passed: false,
        },
      ]
    } else {
      testResults.value = [] // No tests for other trainees
    }
  } catch (error) {
    console.error(`Failed to fetch test list for trainee ${traineeId}:`, error)
    testResults.value = []
  } finally {
    isLoading.value = false
  }
}

watch(
  () => props.traineeId,
  (newId) => {
    if (newId) {
      fetchTraineeTestList(newId)
    }
  },
  { immediate: true },
)
</script>

<style scoped>
.test-results-container {
  padding: 20px; /* TraineeTestResults가 확장된 행 안에 있으므로 적절한 내부 패딩 */
}

.loading-container,
.no-results-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 120px;
  background-color: #ffffff; /* 내부 컨텐츠 배경색 */
  border-radius: 8px;
  padding: 20px;
}

.loading-text,
.no-results-text {
  margin-top: 10px;
  font-size: 0.95rem;
  color: #666;
}

.no-results-inner {
  color: #aaa;
}

.test-results-panels-inner {
  box-shadow: none !important; /* 내부 패널이 이중 그림자를 만들지 않도록 */
}

.test-panel {
  margin-bottom: 8px; /* 각 테스트 패널 사이 간격 */
  border-radius: 6px !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05) !important; /* 테스트 패널의 그림자 */
  background-color: #ffffff;
}

.test-header {
  padding: 12px 16px;
  font-weight: bold;
  font-size: 1rem;
  background-color: #f7f9fb; /* 헤더 배경색 */
  border-radius: 6px 6px 0 0;
}

.test-summary-info {
  display: flex;
  align-items: baseline;
}

.test-content {
  padding: 15px;
  border-top: 1px solid #eee;
  border-radius: 0 0 6px 6px;
  background-color: #ffffff;
}
</style>
