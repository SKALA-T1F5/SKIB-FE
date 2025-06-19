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
              <span class="info-label">시험 생성일:</span>
              <span class="info-value">{{ formatCreatedAt(createdAt) }}</span>
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
          <button class="start-test-button" @click="startTest" :disabled="!testId || isLoading">
            {{ isLoading ? '시험 정보 로딩 중...' : '시험 시작' }}
          </button>
        </div>
      </div>
    </template>
  </MainLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MainLayout from '@/components/layouts/MainLayout.vue'
import axios from '@/config/axios' // axios import 추가
import { isAxiosError } from 'axios' // isAxiosError 함수를 axios 패키지에서 직접 임포트

const route = useRoute()
const router = useRouter()

const testId = ref(null) // URL 파라미터에서 testId 가져옴
const userId = ref('') // Local Storage에서 userId 가져올 예정

const testName = ref('로딩 중...')
const limitedTimeM = ref(0) // 분 단위
const passScore = ref(0)
const createdAt = ref('')
const difficultyLevel = ref('NORMAL') // API 응답에 difficultyLevel이 없으므로 기본값 유지
const isRetake = ref(0) // API 응답에 isRetake가 없으므로 기본값 유지

const isLoading = ref(true)

const fetchTestGuideData = async () => {
  // 1. userId를 Local Storage에서 가져오기
  const storedUserId = localStorage.getItem('userId')
  if (!storedUserId) {
    alert('사용자 ID를 찾을 수 없습니다. 로그인 후 다시 시도해주세요.')
    router.push({ name: 'Login' }) // 예: 로그인 페이지로 리다이렉트
    return
  }
  userId.value = storedUserId

  // 2. testId를 URL 파라미터에서 가져오기
  if (!route.params.testId) {
    alert('시험 ID가 제공되지 않았습니다.')
    router.back()
    return
  }
  testId.value = parseInt(route.params.testId)
  isLoading.value = true

  try {
    // 3. API 호출 주소 변경: /api/test/getUserTest
    // axios baseURL이 /api로 설정되어 있다고 가정하고, /test/getUserTest로 변경합니다.
    const response = await axios.get(
      `/test/getUserTest?userId=${userId.value}&testId=${testId.value}`,
    )
    const { statusCode, resultMsg, resultData } = response.data

    if (statusCode === 'OK' && resultData) {
      testName.value = resultData.name || '이름 없음'
      limitedTimeM.value = resultData.limitedTime || 0
      passScore.value = resultData.passScore || 0
      createdAt.value = resultData.createdAt || ''
      // difficultyLevel 및 isRetake는 현재 제공된 API 응답에 없으므로 기존 기본값 유지
      // 만약 API에서 해당 정보를 제공한다면, 여기에 추가하여 바인딩할 수 있습니다.
    } else {
      alert(`시험 정보를 불러오는 데 실패했습니다: ${resultMsg}`)
      router.back()
    }
  } catch (error) {
    console.error('시험 가이드 데이터를 로드하는 데 실패했습니다:', error)
    if (isAxiosError(error) && error.response) {
      // axios.isAxiosError 대신 isAxiosError 사용
      alert(
        `시험 정보를 불러오는 중 오류가 발생했습니다: ${
          error.response.data.message || '알 수 없는 오류'
        }`,
      )
    } else {
      alert('시험 정보를 불러오는 중 네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
    }
    router.back()
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchTestGuideData()
})

const formatTime = (totalMinutes) => {
  if (totalMinutes === undefined || totalMinutes === null) return '정보 없음'

  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  const seconds = 0 // 현재 limitedTimeM이 분 단위이므로 초는 0으로 가정합니다.

  let timeString = ''
  if (hours > 0) {
    timeString += `${hours}시간 `
  }
  if (minutes > 0) {
    timeString += `${minutes}분 `
  }
  if (seconds > 0) {
    timeString += `${seconds}초 `
  }

  if (timeString === '') {
    return '0분' // 제한 시간이 0분일 경우
  }

  return timeString.trim() // 마지막 공백 제거
}

const formatCreatedAt = (dateTimeString) => {
  if (!dateTimeString) return '정보 없음'
  // '2025-06-10T10:00:00' 형태의 문자열을 Date 객체로 변환
  const date = new Date(dateTimeString)
  // 유효한 Date 객체인지 확인
  if (isNaN(date.getTime())) {
    return '유효하지 않은 날짜'
  }
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const startTest = () => {
  if (testId.value && userId.value && !isLoading.value) {
    router.push({
      name: 'TraineeTest',
      params: { testId: testId.value.toString() },
      // TraineeTest에서 다시 API 호출을 하므로, 필수적인 testId와 userId만 넘겨줍니다.
      state: {
        userId: userId.value, // userId를 TraineeTest로 넘겨줍니다.
      },
    })
  } else if (!testId.value || !userId.value) {
    alert('시험 정보를 불러오지 못했습니다. 다시 시도해주세요.')
  }
}
</script>

<style scoped>
/* 기존 스타일 유지 */
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

.start-test-button:hover:not(:disabled) {
  background-color: #0056b3;
  transform: translateY(-2px);
}

.start-test-button:active:not(:disabled) {
  background-color: #004085;
  transform: translateY(0);
}

.start-test-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background-color: #a0cffc;
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
