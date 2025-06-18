<template>
  <MainLayout :show-sidebar="false">
    <template #content>
      <div class="test-guide-content">
        <div class="guide-header">
          <h2 class="guide-title">시험 응시 안내</h2>
          <p class="guide-subtitle">시험을 시작하기 전에 다음 안내 사항을 반드시 확인해주세요.</p>
        </div>

        <hr class="content-divider" />

        <div class="test-info-section">
          <h3>시험 정보</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">시험명:</span>
              <span class="info-value">{{ testName }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">제한 시간:</span>
              <span class="info-value">{{ formatTime(limitedTimeM) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">합격 점수:</span>
              <span class="info-value">{{ passScore }}점</span>
            </div>
            <div class="info-item">
              <span class="info-label">난이도:</span>
              <span class="info-value">{{ difficultyLevel }}</span>
            </div>
          </div>
          <p v-if="isRetake === 1" class="retake-info">* 이 시험은 재응시가 허용된 시험입니다.</p>
        </div>

        <div class="rules-section">
          <h3>응시 규칙 및 유의사항</h3>
          <ul>
            <li>
              <strong>시험 시작:</strong> '시험 시작' 버튼을 누르는 즉시 제한 시간이
              카운트다운됩니다.
            </li>
            <li>
              <strong>응시 중:</strong> 시험 중에는 브라우저 새로고침, 뒤로 가기, 다른 페이지 이동
              등을 삼가주세요. 시험이 강제로 종료될 수 있습니다.
            </li>
            <li>
              <strong>네트워크 환경:</strong> 안정적인 네트워크 환경에서 응시해주세요. 불안정한
              네트워크는 문제 제출 오류의 원인이 될 수 있습니다.
            </li>
            <li><strong>제한 시간:</strong> 제한 시간을 초과하면 자동으로 답안이 제출됩니다.</li>
            <li>
              <strong>부정 행위 금지:</strong> 어떠한 형태의 부정 행위도 엄격히 금지됩니다. 적발 시
              불이익을 받을 수 있습니다.
            </li>
            <li><strong>재응시:</strong> (해당하는 경우) 본 시험은 재응시가 허용됩니다.</li>
          </ul>
        </div>

        <div class="button-area">
          <button class="start-test-button" @click="startTest">시험 시작</button>
        </div>
      </div>
    </template>
  </MainLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MainLayout from '@/components/layouts/MainLayout.vue'

const route = useRoute()
const router = useRouter()

const testId = ref(null)
const testName = ref('로딩 중...')
const projectId = ref(null)
const limitedTimeM = ref(0)
const passScore = ref(0)
const difficultyLevel = ref('NORMAL')
const isRetake = ref(0)

onMounted(() => {
  if (route.params.testId) {
    testId.value = parseInt(route.params.testId)
  }

  if (history.state) {
    testName.value = history.state.testName || '이름 없음'
    projectId.value = history.state.projectId || null
    limitedTimeM.value = history.state.limitedTimeM || 0
    passScore.value = history.state.passScore || 0
    difficultyLevel.value = history.state.difficultyLevel || 'NORMAL'
    isRetake.value = history.state.isRetake !== undefined ? history.state.isRetake : 0
  }
})

const formatTime = (minutes) => {
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return `${String(hours).padStart(2, '0')}:${String(remainingMinutes).padStart(2, '0')}:00`
}

const startTest = () => {
  if (testId.value) {
    router.push({
      name: 'TraineeTest',
      params: { testId: testId.value.toString() },
      state: {
        testName: testName.value,
        projectId: projectId.value,
        limitedTimeM: limitedTimeM.value,
        passScore: passScore.value,
        difficultyLevel: difficultyLevel.value,
        isRetake: isRetake.value,
      },
    })
  } else {
    alert('시험 정보를 불러오지 못했습니다. 다시 시도해주세요.')
  }
}
</script>

<style scoped>
.test-guide-content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  background-color: #ffffff;
  max-width: 900px;
  margin: 20px auto;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.guide-header {
  text-align: center;
  margin-bottom: 20px;
}

.guide-title {
  font-size: 32px;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
}

.guide-subtitle {
  font-size: 16px;
  color: #666;
}

.content-divider {
  border: 0;
  border-top: 1px solid #e0e0e0;
  margin: 25px 0;
}

.test-info-section,
.rules-section {
  margin-bottom: 30px;
  padding: 15px 20px;
  background-color: #f9f9f9;
  border-radius: 6px;
  border: 1px solid #eee;
}

.test-info-section h3,
.rules-section h3 {
  font-size: 22px;
  color: #333;
  margin-bottom: 15px;
  border-bottom: 2px solid #007bff;
  display: inline-block;
  padding-bottom: 5px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
  font-size: 15px;
}

.info-item {
  background-color: #fff;
  padding: 12px 15px;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.info-label {
  font-weight: bold;
  color: #555;
  margin-right: 8px;
}

.info-value {
  color: #333;
}

.retake-info {
  margin-top: 15px;
  font-style: italic;
  color: #007bff;
  font-weight: bold;
}

.rules-section ul {
  list-style-type: disc;
  padding-left: 25px;
  line-height: 1.8;
}

.rules-section li {
  margin-bottom: 10px;
  color: #444;
  font-size: 15px;
}

.rules-section li strong {
  color: #007bff;
}

.button-area {
  text-align: center;
  margin-top: 30px;
}

.start-test-button {
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 15px 30px;
  font-size: 20px;
  font-weight: bold;
  cursor: pointer;
  transition:
    background-color 0.3s ease,
    transform 0.2s ease;
  box-shadow: 0 4px 8px rgba(0, 123, 255, 0.3);
}

.start-test-button:hover {
  background-color: #0056b3;
  transform: translateY(-2px);
}

.start-test-button:active {
  background-color: #004085;
  transform: translateY(0);
}

@media (max-width: 768px) {
  .test-guide-content {
    margin: 10px auto;
    padding: 15px;
  }

  .guide-title {
    font-size: 26px;
  }

  .guide-subtitle {
    font-size: 14px;
  }

  .test-info-section h3,
  .rules-section h3 {
    font-size: 20px;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .start-test-button {
    padding: 12px 25px;
    font-size: 18px;
  }
}
</style>
