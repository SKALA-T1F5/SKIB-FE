<template>
  <div class="trainee-main">
    <Header />

    <div class="layout-body">
      <TraineeMainSideBar
        :searchQuery="searchQuery"
        :statusFilters="statusFilters"
        :resultFilters="resultFilters"
        @update:searchQuery="searchQuery = $event"
        @update:statusFilters="statusFilters = $event"
        @update:resultFilters="resultFilters = $event"
        @reset-filters="handleResetFilters"
      />

      <div class="content-area">
        <main class="main-content">
          <div class="main-header">
            <h2 class="welcome-message">{{ userName }} 매니저님, 반갑습니다!</h2>
            <button class="add-test-button" @click="showAddTestModal">
              + 테스트 추가
            </button>
          </div>

          <hr class="content-divider" />

          <div class="test-cards-container">
            <TraineeTestCard
              v-for="test in filteredTests"
              :key="test.testId"
              :test="test"
              @retake="handleTestCardAction(test, 'result')"
              @feedback="handleTestCardAction(test, 'feedback')"
              @attend="handleTestCardAction(test, 'attend')"
            />

            <div v-if="filteredTests.length === 0" class="no-tests-message">
              <p>해당 조건에 일치하는 테스트가 없습니다.</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </div>

    <AddTestModal
      :isVisible="addTestModalVisible"
      :invitationLinkError="invitationLinkError"
      @close="hideAddTestModal"
      @addTest="addTestByLink"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/utils/axios'; // axios 인스턴스 경로 확인
import Header from '@/components/layouts/Header.vue';
import Footer from '@/components/layouts/Footer.vue';
import TraineeMainSideBar from '@/components/trainee/main/TraineeMainSideBar.vue';
import TraineeTestCard from '@/components/trainee/main/TraineeTestCard.vue';
import AddTestModal from '@/components/trainee/main/AddTestModal.vue';

const router = useRouter();

// TypeScript interfaces are removed.
// The structure of the 'Test' object will be implicitly understood from its usage
// and the data fetched from the API.

const userName = ref(localStorage.getItem('name') || '사용자');
const tests = ref([]); // Removed <Test[]> type annotation

const searchQuery = ref('');
const statusFilters = ref({
  done: false,
  retry: false, // 재응시 가능 필터
});
const resultFilters = ref({
  pass: false,
  fail: false,
});

const filteredTests = computed(() => {
  let currentTests = tests.value;

  // 1. 검색어 필터링
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    currentTests = currentTests.filter(test =>
      test.name.toLowerCase().includes(query)
    );
  }

  // 2. 응시 여부 필터 (done, retry)
  const isDoneChecked = statusFilters.value.done;
  const isRetryChecked = statusFilters.value.retry;

  if (isDoneChecked || isRetryChecked) {
    currentTests = currentTests.filter(test => {
      let matchStatusFilter = false;

      // 'done'은 응시 여부이므로, 합격/불합격 모두 포함
      if (isDoneChecked && (test.isPassed || !test.isPassed)) {
        matchStatusFilter = true;
      }
      // 'retry'는 재응시 가능하며 불합격인 경우
      if (isRetryChecked && test.retake && !test.isPassed) {
        matchStatusFilter = true;
      }
      return matchStatusFilter;
    });
  }

  // 3. 결과 필터링 (PASS/FAIL)
  const isPassChecked = resultFilters.value.pass;
  const isFailChecked = resultFilters.value.fail;

  if (isPassChecked || isFailChecked) {
    currentTests = currentTests.filter(test => {
      let matchResultFilter = false;
      if (isPassChecked && test.isPassed) {
        matchResultFilter = true;
      }
      if (isFailChecked && !test.isPassed) {
        matchResultFilter = true;
      }
      return matchResultFilter;
    });
  }

  // 모든 필터가 해제된 경우 모든 테스트를 보여줍니다.
  if (!searchQuery.value && !isDoneChecked && !isRetryChecked && !isPassChecked && !isFailChecked) {
    return tests.value;
  }

  return currentTests;
});

const addTestModalVisible = ref(false);
const invitationLink = ref('');
const invitationLinkError = ref('');

const showAddTestModal = () => {
  addTestModalVisible.value = true;
  invitationLink.value = '';
  invitationLinkError.value = '';
};

const hideAddTestModal = () => {
  addTestModalVisible.value = false;
};

// --- START: 수정된 addTestByLink 함수 ---
const addTestByLink = async (link) => { // Removed ': string' type annotation
  invitationLinkError.value = '';
  invitationLink.value = link;

  if (!invitationLink.value.trim()) {
    invitationLinkError.value = '초대 링크를 입력해주세요.';
    return;
  }

  // 초대 링크에서 토큰 추출 로직
  // 실제 초대 링크 형식에 맞춰 파싱 로직을 구현해야 합니다.
  // 예시: http://yourdomain.com/invite?token=YOUR_TOKEN_HERE
  let token = null;
  try {
    const url = new URL(invitationLink.value);
    token = url.searchParams.get('token');
  } catch (e) {
    // URL 파싱 실패 시 (예: 유효하지 않은 URL 형식)
    invitationLinkError.value = '유효한 초대 링크 형식이 아닙니다.';
    return;
  }

  if (!token) {
    invitationLinkError.value = '유효한 초대 링크가 아닙니다. 토큰을 찾을 수 없습니다.';
    return;
  }

  const userId = localStorage.getItem('userId');
  if (!userId) {
    alert('사용자 ID를 찾을 수 없습니다. 다시 로그인해주세요.');
    router.push('/login');
    return;
  }

  try {
    const response = await api.post('/test/invite/register', {
      token: token,
      userId: parseInt(userId), // userId는 int 타입이므로 parseInt로 변환
      lang: 'ko', // 기본값 'ko' 사용
    });

    console.log('테스트 추가 성공:', response.data);
    alert('테스트에 성공적으로 참여했습니다!');

    // 서버 응답 데이터 구조에 따라 joinedTestInfo 추출 로직 변경 필요
    // Swagger 정의에 따르면 응답 데이터가 testDetails를 직접 포함하지 않을 수 있습니다.
    // 여기서는 응답으로 받은 테스트 정보를 기반으로 안내 페이지로 리다이렉트합니다.
    const joinedTestInfo = response.data?.resultData?.testDetails || response.data?.testDetails; // 서버 응답 구조에 따라 유연하게 처리

    if (joinedTestInfo && joinedTestInfo.testId) {
      router.push({
        name: 'TraineeTestGuide',
        params: { testId: joinedTestInfo.testId.toString() },
        state: {
          testName: joinedTestInfo.name,
          limitedTimeM: joinedTestInfo.limitedTime,
          difficultyLevel: joinedTestInfo.difficultyLevel,
          isRetake: joinedTestInfo.retake,
        }
      });
    } else {
      // 서버에서 상세 정보를 바로 주지 않으면, 전체 목록을 새로고침하여 반영
      await fetchTests();
      // 또한, 테스트 추가 후 바로 안내 페이지로 이동하는 대신,
      // 메인 페이지에서 추가된 테스트를 확인하도록 사용자에게 안내할 수 있습니다.
      // alert('새로운 테스트가 목록에 추가되었습니다.');
    }
    hideAddTestModal();
  } catch (error) { // Removed ': any' type annotation
    console.error('테스트 추가 실패:', error);
    if (error.response && error.response.data && error.response.data.message) {
      invitationLinkError.value = error.response.data.message;
    } else {
      invitationLinkError.value = '테스트 참여에 실패했습니다. 유효하지 않은 링크이거나 서버 오류입니다.';
    }
  }
};
// --- END: 수정된 addTestByLink 함수 ---

const fetchTests = async () => {
  try {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      alert('사용자 ID를 찾을 수 없습니다. 다시 로그인해주세요.');
      router.push('/login');
      return;
    }

    const response = await api.get('/test/getUserTestList', { // Removed <any> type annotation
      params: {
        userId: userId
      }
    });

    // 서버 응답에서 resultData.tests 배열을 추출합니다.
    const fetchedTestData = response.data?.resultData?.tests;

    if (Array.isArray(fetchedTestData)) {
      tests.value = fetchedTestData.map((test) => { // Removed ': SimpleTestApiResponse' type annotation
        return {
          testId: test.testId,
          name: test.name,
          difficultyLevel: test.difficultyLevel,
          score: test.score,
          limitedTime: test.limitedTime,
          createdAt: test.createdAt,
          isPassed: test.isPassed,
          retake: test.retake,
        };
      });
    } else {
      console.error('테스트 데이터를 불러오는 데 실패했습니다: 서버 응답 형식이 예상과 다릅니다.', response.data);
      alert('테스트 목록을 불러오는 데 실패했습니다. 서버 응답을 확인해주세요.');
      tests.value = []; // 오류 시 빈 배열로 설정
    }

    console.log("Fetched tests from API:", tests.value);
  } catch (error) {
    console.error('테스트 데이터를 불러오는 데 실패했습니다:', error);
    alert('테스트 목록을 불러오는 데 실패했습니다. 잠시 후 다시 시도해주세요.');
  }
};

const handleResetFilters = () => {
  searchQuery.value = '';
  statusFilters.value = {
    done: false,
    retry: false,
  };
  resultFilters.value = {
    pass: false,
    fail: false,
  };
  fetchTests();
};

const handleTestCardAction = (test, actionType) => { // Removed type annotations for test and actionType
  console.log(`'${test.name}' ${actionType} 요청 (Test ID: ${test.testId})`);

  if (actionType === 'result') {
    router.push({
      name: 'TraineeTestResult',
      params: { testId: test.testId.toString() },
      state: { testName: test.name, actualScore: test.score, isPassed: test.isPassed }
    });
  } else if (actionType === 'feedback') {
    router.push({
      name: 'TraineeTestFeedback',
      params: { testId: test.testId.toString() },
      state: { testName: test.name, actualScore: test.score, isPassed: test.isPassed }
    });
  } else if (actionType === 'attend') {
    if (test.retake && !test.isPassed) {
      router.push({
        name: 'TraineeTestGuide',
        params: { testId: test.testId.toString() },
        state: {
          testName: test.name,
          limitedTimeM: test.limitedTime,
          difficultyLevel: test.difficultyLevel,
          isRetake: test.retake,
        }
      });
    } else {
      alert('이 테스트는 재응시할 수 없습니다.');
      router.push({
        name: 'TraineeTestResult',
        params: { testId: test.testId.toString() },
        state: { testName: test.name, actualScore: test.score, isPassed: test.isPassed }
      });
    }
  }
};


onMounted(() => {
  fetchTests(); // 컴포넌트 마운트 시 테스트 데이터 로드
});
</script>

<style scoped>
/* CSS 스타일은 변경 없이 그대로 유지됩니다. */
.trainee-main {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.layout-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.layout-body > :deep(.trainee-main-sidebar) {
  width: 250px;
  background-color: #2c3e50;
  color: white;
  flex-shrink: 0;
  padding: 20px;
  box-sizing: border-box;
  overflow-y: auto;
}

.content-area {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
}

.main-content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  background-color: #ffffff;
}

.main-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
  margin-top: -32px;
}

.welcome-message {
  font-size: 30px;
  font-weight: bold;
  color: #333;
}

.add-test-button {
  background-color: #e0e0e0;
  color: #666;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s ease;
}

.add-test-button:hover {
  background-color: #d0d0d0;
}

/* 본문 구분을 위한 선 추가 */
.content-divider {
  border: 0;
  border-top: 1px solid black;
  margin: -30px 0px 10px 0px;
}

.test-cards-container {
  display: grid;
  /* 변경: auto-fill을 사용하여 사용 가능한 공간을 채우고, 필요에 따라 열을 추가/제거 */
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
  /* 기존 유지: flex-start는 그리드 아이템이 시작부터 정렬되도록 합니다. */
  justify-content: flex-start;
  align-items: flex-start;
  /* 추가: 행의 높이를 콘텐츠에 따라 자동으로 조절합니다. */
  grid-auto-rows: minmax(auto, auto); /* 카드의 내용 길이에 따라 유연하게 높이 조절 */
}

/* 미디어 쿼리는 그대로 유지하셔도 좋습니다. */
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