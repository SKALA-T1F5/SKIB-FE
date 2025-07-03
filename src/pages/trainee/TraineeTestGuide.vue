<template>
  <MainLayout :show-sidebar="false">
    <template #content>
      <AddTestModalLang
        v-if="showLangModal"
        :is-visible="showLangModal"
        :hide-invite-link="true"
        @close="showLangModal = false"
        @lang-selected="handleLangSelected"
      />
      <div v-else class="test-guide-content">
        <div class="guide-header">
          <h2 class="guide-title">{{ $t('testGuideTitle') }}</h2>
          <p class="guide-subtitle">{{ $t('testGuideSubtitle') }}</p>
        </div>

        <hr class="content-divider" />

        <div class="test-info-section">
          <h3>{{ $t('testInfo') }}</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">{{ $t('testName') }}</span>
              <span class="info-value">{{ testName }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">{{ $t('limitedTime') }}</span>
              <span class="info-value">{{ formatTime(limitedTimeM) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">{{ $t('passScore') }}</span>
              <span class="info-value">{{ passScore }}{{ $t('scoreUnit') }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">{{ $t('createdAt') }}</span>
              <span class="info-value">{{ formatCreatedAt(createdAt) }}</span>
            </div>
          </div>
          <p v-if="isRetake === 1" class="retake-info">{{ $t('retakeAllowed') }}</p>
        </div>

        <div class="rules-section">
          <h3>{{ $t('testRules') }}</h3>
          <ul>
            <li>
              <strong>{{ $t('testStart') }}</strong> {{ $t('testStartDesc') }}
            </li>
            <li>
              <strong>{{ $t('duringTest') }}</strong> {{ $t('duringTestDesc') }}
            </li>
            <li>
              <strong>{{ $t('network') }}</strong> {{ $t('networkDesc') }}
            </li>
            <li><strong>{{ $t('limitedTime') }}</strong> {{ $t('limitedTimeDesc') }}</li>
            <li>
              <strong>{{ $t('noCheating') }}</strong> {{ $t('noCheatingDesc') }}
            </li>
            <li><strong>{{ $t('retake') }}</strong> {{ $t('retakeDesc') }}</li>
          </ul>
        </div>

        <div class="button-area">
          <button class="start-test-button" @click="startTest" :disabled="!testId || isLoading">
            {{ isLoading ? $t('loadingTestInfo') : $t('startTest') }}
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
import axios from '@/config/axios'
import { isAxiosError } from 'axios'
import { useI18n } from 'vue-i18n'
import AddTestModalLang from '@/components/trainee/main/AddTestModalLang.vue'

const { t } = useI18n()

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
const showLangModal = ref(false)

const fetchTestGuideData = async () => {
  // 1. userId를 Local Storage에서 가져오기
  const storedUserId = localStorage.getItem('userId')
  if (!storedUserId) {
    alert(t('userNotFound'))
    router.push({ name: 'Login' }) // 예: 로그인 페이지로 리다이렉트
    return
  }
  userId.value = storedUserId

  // 2. testId를 URL 파라미터에서 가져오기
  if (!route.params.testId) {
    alert(t('testIdNotProvided'))
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
      alert(t('failedToLoadTestInfo') + ': ' + resultMsg)
      router.back()
    }
  } catch (error) {
    console.error('시험 가이드 데이터를 로드하는 데 실패했습니다:', error)
    if (isAxiosError(error) && error.response) {
      // axios.isAxiosError 대신 isAxiosError 사용
      alert(
        t('errorOccurred') + ': ' +
        (error.response.data.message || t('unknownError')),
      )
    } else {
      alert(t('networkErrorOccurred') + '. 잠시 후 다시 시도해주세요.')
    }
    router.back()
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  // 진입 시 lang(localStorage.lang)이 없으면 모달 오픈
  if (!localStorage.getItem('lang')) {
    showLangModal.value = true
  } else {
    fetchTestGuideData()
  }
})

function handleLangSelected(lang) {
  localStorage.setItem('lang', lang)
  showLangModal.value = false
  fetchTestGuideData()
}

const formatTime = (totalMinutes) => {
  if (totalMinutes === undefined || totalMinutes === null) return t('infoNotAvailable')

  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  const seconds = 0 // 현재 limitedTimeM이 분 단위이므로 초는 0으로 가정합니다.

  let timeString = ''
  if (hours > 0) {
    timeString += `${hours} hr `
  }
  if (minutes > 0) {
    timeString += `${minutes} min `
  }
  if (seconds > 0) {
    timeString += `${seconds} sec `
  }

  if (timeString === '') {
    return t('zeroMinutes') // 제한 시간이 0분일 경우
  }

  return timeString.trim() // 마지막 공백 제거
}

const formatCreatedAt = (dateTimeString) => {
  if (!dateTimeString) return t('infoNotAvailable')
  // '2025-06-10T10:00:00' 형태의 문자열을 Date 객체로 변환
  const date = new Date(dateTimeString)
  // 유효한 Date 객체인지 확인
  if (isNaN(date.getTime())) {
    return t('invalidDate')
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
    alert(t('failedToLoadTestInfo'))
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
