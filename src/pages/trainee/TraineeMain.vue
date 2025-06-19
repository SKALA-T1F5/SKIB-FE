<template>
  <MainLayout>
    <template #sidebar-header-content="{ isCollapsed }">
      <SearchInput
        v-if="!isCollapsed"
        :search-query="searchQuery"
        @update:search-query="searchQuery = $event"
        @reset-filters="handleResetFilters"
      />
    </template>

    <template #sidebar="{ isCollapsed }">
      <TraineeMainSideBar
        :searchQuery="searchQuery"
        :statusFilters="statusFilters"
        :resultFilters="resultFilters"
        @update:searchQuery="searchQuery = $event"
        @update:statusFilters="statusFilters = $event"
        @update:resultFilters="resultFilters = $event"
        @reset-filters="handleResetFilters"
        :is-collapsed="isCollapsed"
      />
    </template>

    <template #content>
      <div class="main-header">
        <h2 class="welcome-message">{{ userName }} 매니저님, 반갑습니다!</h2>
        <button class="add-test-button" @click="showAddTestModal">+ 테스트 추가</button>
      </div>

      <hr class="content-divider" />

      <div class="test-cards-container">
        <TraineeTestCard
          v-for="test in filteredTests"
          :key="test.testId"
          :test="test"
          @retake-action="handleTestCardAction(test, 'result')"
          @feedback="handleTestCardAction(test, 'feedback')"
          @attend="handleTestCardAction(test, 'attend')"
        />

        <div v-if="filteredTests.length === 0" class="no-tests-message">
          <p>해당 조건에 일치하는 테스트가 없습니다.</p>
        </div>
      </div>
    </template>
  </MainLayout>

  <AddTestModal
    :isVisible="addTestModalVisible"
    :invitationLinkError="invitationLinkError"
    @close="hideAddTestModal"
    @addTest="addTestByLink"
  />
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/config/axios'

import MainLayout from '@/components/layouts/MainLayout.vue'
import SearchInput from '@/components/layouts/SearchInput.vue'
import TraineeMainSideBar from '@/components/trainee/main/TraineeMainSideBar.vue'
import TraineeTestCard from '@/components/trainee/main/TraineeTestCard.vue'
import AddTestModal from '@/components/trainee/main/AddTestModal.vue'

const router = useRouter()
const userName = ref(localStorage.getItem('name') || '사용자')
const userRole = ref(localStorage.getItem('role') || 'Trainee')
const tests = ref([])
const searchQuery = ref('')
const statusFilters = ref({
  done: false,
  retry: false,
})
const resultFilters = ref({
  pass: false,
  fail: false,
})
const filteredTests = computed(() => {
  let currentTests = tests.value
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    currentTests = currentTests.filter((test) => test.name.toLowerCase().includes(query))
  }
  const isDoneChecked = statusFilters.value.done
  const isRetryChecked = statusFilters.value.retry
  if (isDoneChecked || isRetryChecked) {
    currentTests = currentTests.filter((test) => {
      let matchStatusFilter = false
      if (isDoneChecked && test.score !== null && test.score !== undefined) {
        matchStatusFilter = true
      }
      if (isRetryChecked && test.retake === 0 && test.isRetake) {
        matchStatusFilter = true
      }
      return matchStatusFilter
    })
  }
  const isPassChecked = resultFilters.value.pass
  const isFailChecked = resultFilters.value.fail
  if (isPassChecked || isFailChecked) {
    currentTests = currentTests.filter((test) => {
      let matchResultFilter = false
      if (isPassChecked && test.isPassed) {
        matchResultFilter = true
      }
      if (isFailChecked && !test.isPassed && test.score !== null && test.score !== undefined) {
        matchResultFilter = true
      }
      return matchResultFilter
    })
  }
  if (!searchQuery.value && !isDoneChecked && !isRetryChecked && !isPassChecked && !isFailChecked) {
    return tests.value
  }
  return currentTests
})
const addTestModalVisible = ref(false)
const invitationLink = ref('')
const invitationLinkError = ref('')
const showAddTestModal = () => {
  addTestModalVisible.value = true
  invitationLink.value = ''
  invitationLinkError.value = ''
}
const hideAddTestModal = () => {
  addTestModalVisible.value = false
}
const addTestByLink = async (link) => {
  invitationLinkError.value = ''
  invitationLink.value = link
  if (!invitationLink.value.trim()) {
    invitationLinkError.value = '초대 링크를 입력해주세요.'
    return
  }
  let token = null
  try {
    const url = new URL(invitationLink.value)
    token = url.searchParams.get('token')
  } catch (e) {
    invitationLinkError.value = '유효한 초대 링크 형식이 아닙니다.'
    return
  }
  if (!token) {
    invitationLinkError.value = '유효한 초대 링크가 아닙니다. 토큰을 찾을 수 없습니다.'
    return
  }
  const userId = localStorage.getItem('userId')
  if (!userId) {
    alert('사용자 ID를 찾을 수 없습니다. 다시 로그인해주세요.')
    router.push('/login')
    return
  }
  try {
    const response = await api.post('/test/invite/register', {
      token: token,
      userId: parseInt(userId),
      lang: 'ko',
    })
    console.log('테스트 추가 성공:', response.data)
    alert('테스트에 성공적으로 참여했습니다!')
    const joinedTestInfo = response.data?.resultData?.testDetails || response.data?.testDetails
    if (joinedTestInfo && joinedTestInfo.testId) {
      router.push({
        name: 'TraineeTestGuide',
        params: { testId: joinedTestInfo.testId.toString() },
        state: {
          testName: joinedTestInfo.name,
          limitedTimeM: joinedTestInfo.limitedTime,
          difficultyLevel: joinedTestInfo.difficultyLevel,
          isRetake: joinedTestInfo.isRetake,
        },
      })
    } else {
      await fetchTests()
    }
    hideAddTestModal()
  } catch (error) {
    console.error('테스트 추가 실패:', error)
    if (error.response && error.response.data && error.response.data.message) {
      invitationLinkError.value = error.response.data.message
    } else {
      invitationLinkError.value =
        '테스트 참여에 실패했습니다. 유효하지 않은 링크이거나 서버 오류입니다.'
    }
  }
}
const fetchTests = async () => {
  try {
    const userId = localStorage.getItem('userId')
    if (!userId) {
      alert('사용자 ID를 찾을 수 없습니다. 다시 로그인해주세요.')
      router.push('/login')
      return
    }
    const response = await api.get('/test/getUserTestList', {
      params: {
        userId: userId,
      },
    })
    const fetchedTestData = response.data?.resultData?.tests
    if (Array.isArray(fetchedTestData)) {
      tests.value = fetchedTestData.map((test) => {
        return {
          testId: test.testId,
          name: test.name,
          difficultyLevel: test.difficultyLevel,
          score: test.score,
          limitedTime: test.limitedTime,
          createdAt: test.createdAt,
          isPassed: test.isPassed,
          retake: test.retake,
          isRetake: test.isRetake,
          passScore: test.passScore,
        }
      })
    } else {
      console.error(
        '테스트 데이터를 불러오는 데 실패했습니다: 서버 응답 형식이 예상과 다릅니다.',
        response.data,
      )
      alert('테스트 목록을 불러오는 데 실패했습니다. 서버 응답을 확인해주세요.')
      tests.value = []
    }
    console.log('Fetched tests from API:', tests.value)
  } catch (error) {
    console.error('테스트 데이터를 불러오는 데 실패했습니다:', error)
    alert('테스트 목록을 불러오는 데 실패했습니다. 잠시 후 다시 시도해주세요.')
  }
}
const handleResetFilters = () => {
  searchQuery.value = ''
  statusFilters.value = {
    done: false,
    retry: false,
  }
  resultFilters.value = {
    pass: false,
    fail: false,
  }
  fetchTests()
}

const handleTestCardAction = (test, actionType) => {
  console.log(`'${test.name}' ${actionType} 요청 (Test ID: ${test.testId})`)
  if (actionType === 'result') {
    router.push({
      name: 'TraineeTestResult',
      params: { testId: test.testId.toString() },
      state: {
        testName: test.name,
        actualScore: test.score,
        isPassed: test.isPassed,
        passScore: test.passScore,
      },
    })
  } else if (actionType === 'feedback') {
    router.push({
      name: 'TraineeTestFeedback',
      params: { testId: test.testId.toString() },
      state: {
        testName: test.name,
        actualScore: test.score,
        isPassed: test.isPassed,
        passScore: test.passScore,
      },
    })
  } else if (actionType === 'attend') {
    // This 'attend' action is used for both initial test taking and retaking (via the "재응시" button).
    // The key here is to always push to TraineeTestGuide if the action is 'attend'
    // and the button is enabled (which is handled by :disabled on the button itself).
    router.push({
      name: 'TraineeTestGuide',
      params: { testId: test.testId.toString() },
      state: {
        testName: test.name,
        limitedTimeM: test.limitedTime,
        difficultyLevel: test.difficultyLevel,
        isRetake: test.isRetake, // Pass the isRetake status of the test itself
      },
    })
  }
  // The 'retake' action type was removed here because the '재응시' button now directly emits 'attend'.
  // This simplifies the logic by routing all test-taking/retaking attempts through 'attend'.
}

onMounted(() => {
  fetchTests()
})
</script>

<style scoped>
/* MainLayout.vue에 전반적인 레이아웃 스타일이 정의되었으므로,
   여기서는 콘텐츠 영역에 특화된 스타일만 유지합니다. */
.main-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
  margin-top: 0px;
}

.welcome-message {
  font-size: 28px;
  font-weight: bold;
  color: #333;
}

.add-test-button {
  background-color: #e0e0e0;
  color: #666;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 6px 8px;
  cursor: pointer;
  font-size: 12px;
  transition: background-color 0.2s ease;
}

.add-test-button:hover {
  background-color: #d0d0d0;
}

.content-divider {
  border: 0;
  border-top: 1px solid black;
  margin: -13px 0px 10px 0px;
}

.test-cards-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
  justify-content: flex-start;
  align-items: flex-start;
  grid-auto-rows: minmax(auto, auto);
}

@media (max-width: 1200px) {
  .test-cards-container {
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  }
}

@media (max-width: 900px) {
  .test-cards-container {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  }
}

@media (max-width: 600px) {
  .test-cards-container {
    grid-template-columns: 1fr;
  }
}

.no-tests-message {
  width: 100%;
  text-align: center;
  padding: 50px;
  color: #777;
  font-size: 16px;
}
</style>
