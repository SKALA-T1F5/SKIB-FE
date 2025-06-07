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
              <p>해당 조건에 맞는 테스트가 없습니다.</p>
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

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/utils/axios';
import Header from '@/components/layouts/Header.vue';
import Footer from '@/components/layouts/Footer.vue';
import TraineeMainSideBar from '@/components/layouts/sidebar/TraineeMainSideBar.vue';
import TraineeTestCard from '@/components/trainee/main/TraineeTestCard.vue';
import AddTestModal from '@/components/trainee/main/AddTestModal.vue';

const router = useRouter();

export interface Test {
  testId: number;
  projectId: number;
  name: string;
  difficultyLevel: 'EASY' | 'NORMAL' | 'HARD';
  limitedTimeM: number;
  passScore: number;
  isRetake: 0 | 1; // 재응시 가능 여부 (0: 불가, 1: 가능)
  createdDate: string;
  modifiedDate: string;
  isDeleted: 0 | 1;
  actualScore: number; // 응시자의 실제 점수 (필수)
  status: 'PASS' | 'FAIL'; // 상태는 PASS 또는 FAIL만. 'RETRY'는 계산된 상태이며 버튼 유무에 영향을 줌
}

const userName = ref(localStorage.getItem('name') || '사용자');
const tests = ref<Test[]>([]); // API에서 불러올 실제 테스트 데이터

const searchQuery = ref('');
const statusFilters = ref({
  done: false,
  retry: false, // 재응시 가능 필터
});
const resultFilters = ref({
  pass: false,
  fail: false,
});

// 샘플 테스트 데이터 정의 (status는 isRetake와 actualScore/passScore를 기반으로 계산)
const rawSampleTestsData = [
  {
    testId: 999901,
    projectId: 101,
    name: "Vue.js 기초 테스트",
    difficultyLevel: "EASY",
    limitedTimeM: 60,
    passScore: 70,
    isRetake: 0, // 재응시 불가
    createdDate: "2024-01-15T10:00:00Z",
    modifiedDate: "2024-01-15T11:30:00Z",
    isDeleted: 0,
    actualScore: 85, // 합격 점수 70점 이상
  },
  {
    testId: 999902,
    projectId: 102,
    name: "JavaScript 심화 테스트",
    difficultyLevel: "NORMAL",
    limitedTimeM: 90,
    passScore: 60,
    isRetake: 1, // 재응시 가능
    createdDate: "2024-02-01T14:00:00Z",
    modifiedDate: "2024-02-01T15:45:00Z",
    isDeleted: 0,
    actualScore: 55, // 합격 점수 60점 미만
  },
  {
    testId: 999903,
    projectId: 103,
    name: "HTML/CSS 기본",
    difficultyLevel: "EASY",
    limitedTimeM: 45,
    passScore: 60,
    isRetake: 0, // 재응시 불가
    createdDate: "2024-03-01T09:00:00Z",
    modifiedDate: "2024-03-01T09:00:00Z",
    isDeleted: 0,
    actualScore: 70, // 합격 점수 60점 이상
  },
  {
    testId: 999904,
    projectId: 104,
    name: "React 고급 주제",
    difficultyLevel: "HARD",
    limitedTimeM: 120,
    passScore: 80,
    isRetake: 0, // 재응시 불가
    createdDate: "2024-04-10T11:00:00Z",
    modifiedDate: "2024-04-10T12:00:00Z",
    isDeleted: 0,
    actualScore: 75, // 합격 점수 80점 미만
  },
  {
    testId: 999905,
    projectId: 105,
    name: "Python 알고리즘",
    difficultyLevel: "HARD",
    limitedTimeM: 90,
    passScore: 75,
    isRetake: 1, // 재응시 가능
    createdDate: "2024-05-01T10:00:00Z",
    modifiedDate: "2024-05-01T11:00:00Z",
    isDeleted: 0,
    actualScore: 70, // 합격 점수 75점 미만
  }
];

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

      // '응시 완료' 필터: PASS 또는 FAIL인 경우 (재응시 가능 여부와 상관 없음)
      if (isDoneChecked && (test.status === 'PASS' || test.status === 'FAIL')) {
        matchStatusFilter = true;
      }
      // '재응시' 필터: FAIL 상태이고 재응시가 허용된 경우
      if (isRetryChecked && test.status === 'FAIL' && test.isRetake === 1) {
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
      if (isPassChecked && test.status === 'PASS') {
        matchResultFilter = true;
      }
      if (isFailChecked && test.status === 'FAIL') {
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

const addTestByLink = async (link: string) => {
  invitationLinkError.value = '';
  invitationLink.value = link;

  if (!invitationLink.value.trim()) {
    invitationLinkError.value = '초대 링크를 입력해주세요.';
    return;
  }

  try {
    const response = await api.post('/trainee/join-test', { invitationLink: invitationLink.value });
    console.log('테스트 추가 성공:', response.data);
    alert('테스트에 성공적으로 참여했습니다!');
    await fetchTests();
    hideAddTestModal();
  } catch (error: any) {
    console.error('테스트 추가 실패:', error);
    if (error.response && error.response.data && error.response.data.message) {
      invitationLinkError.value = error.response.data.message;
    } else {
      invitationLinkError.value = '테스트 참여에 실패했습니다. 유효하지 않은 링크이거나 서버 오류입니다.';
    }
  }
};

const fetchTests = async () => {
  try {
    // 실제 API에서 데이터를 불러오는 대신, 샘플 데이터에 status를 계산하여 적용
    tests.value = rawSampleTestsData.map(test => ({
        ...test,
        // actualScore와 passScore를 기반으로 status 계산
        status: test.actualScore >= test.passScore ? 'PASS' : 'FAIL',
    }));

    // const response = await api.get<Omit<Test, 'status'>[]>('/trainee/tests');
    // tests.value = response.data.map(test => {
    //   // 서버에서 받은 데이터에 실제 점수와 합격 점수가 있다고 가정하고 status 계산
    //   const calculatedStatus: Test['status'] = test.actualScore >= test.passScore ? 'PASS' : 'FAIL';
    //   return { ...test, status: calculatedStatus };
    // });

    console.log("Fetched tests (or using samples):", tests.value);
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
};

// 테스트 카드에서 발생하는 액션을 통합 처리하는 함수
const handleTestCardAction = (test: Test, actionType: 'result' | 'feedback' | 'attend') => {
  console.log(`'${test.name}' ${actionType} 요청 (Test ID: ${test.testId})`);

  if (actionType === 'result') {
    router.push({
      name: 'TraineeTestResult',
      params: { testId: test.testId.toString() },
      state: { testName: test.name, projectId: test.projectId, actualScore: test.actualScore, passScore: test.passScore }
    });
  } else if (actionType === 'feedback') {
    router.push({
      name: 'TraineeTestFeedback',
      params: { testId: test.testId.toString() },
      state: { testName: test.name, projectId: test.projectId, actualScore: test.actualScore, passScore: test.passScore }
    });
  } else if (actionType === 'attend') {
    // 재응시 조건: 테스트 자체가 재응시 가능하고, 응시자가 실패했을 때만 재응시 버튼이 보입니다.
    if (test.isRetake === 1 && test.status === 'FAIL') {
      router.push({
        name: 'TraineeTest', // 실제 테스트 응시 페이지
        params: { testId: test.testId.toString() },
        state: { testName: test.name, projectId: test.projectId, isRetake: test.isRetake }
      });
    } else {
      alert('이 테스트는 재응시할 수 없습니다.');
      // 재응시 불가능한 경우 결과 페이지로 이동시키거나 다른 처리
      router.push({
        name: 'TraineeTestResult',
        params: { testId: test.testId.toString() },
        state: { testName: test.name, projectId: test.projectId, actualScore: test.actualScore, passScore: test.passScore }
      });
    }
  }
};


onMounted(() => {
  fetchTests(); // 컴포넌트 마운트 시 테스트 데이터 로드 (현재는 샘플 데이터)
});
</script>

<style scoped>
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

/* 본문 구분을 위한 선 추가 - 수정된 부분 */
.content-divider {
  border: 0;
  border-top: 1px solid black;
  margin: -30px 0px 10px 0px;
}

.test-cards-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); /* 최소 너비 320px */
  gap: 24px; /* 카드 간 간격 조정 (기존 70px은 너무 넓을 수 있음) */
  justify-content: start;
  align-items: start;
}

@media (max-width: 1200px) {
  .test-cards-container {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  }
}

@media (max-width: 900px) {
  .test-cards-container {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
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
  font-size: 18px;
}
</style>