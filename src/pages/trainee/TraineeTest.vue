<template>
  <div id="test-taking-page-layout">
    <Header />

    <div class="page-content-wrapper" :class="{ 'has-sidebar': allQuestions.length > 0 }">
      <TraineeTestSideBar
        :questions="allQuestions"
        :currentQuestionId="currentQuestionId"
        @selectQuestion="handleQuestionSelectFromSidebar"
      />

      <main class="main-content-area">
        <div class="test-taking-container-inner">
          <div class="top-nav">
            <h3 class="question-number-top" v-if="currentQuestion">{{ currentQuestion.id }}.</h3>
            <div class="nav-buttons-wrapper">
              <button class="nav-button" @click="goToPreviousQuestion" :disabled="!hasPreviousQuestion">
                <svg-icon type="mdi" :path="mdiChevronLeft" class="nav-icon" /> 이전 문제
              </button>
              <button class="nav-button" @click="goToNextQuestion" :disabled="!hasNextQuestion">
                다음 문제 <svg-icon type="mdi" :path="mdiChevronRight" class="nav-icon" />
              </button>
            </div>
          </div>

          <div class="question-taking-area" v-if="currentQuestion">
            <div class="question-section">
              <div class="question-text-fixed">
                <p class="question-text">{{ currentQuestion.questionText }}</p>
              </div>
              <div class="question-content-scrollable">
                <div class="options-container" v-if="currentQuestion.type === 'OBJECTIVE'">
                  <div
                    v-for="(option, index) in currentQuestion.options"
                    :key="index"
                    :class="[
                      'option-item',
                      { 'is-selected': userAnswers.get(currentQuestion.id) === option }
                    ]"
                    @click="selectOption(option)"
                  >
                    <span class="option-label">{{ getOptionLabel(index) }}</span>
                    <span class="option-content">{{ option }}</span>
                  </div>
                </div>
                <div class="subjective-answer-section" v-else-if="currentQuestion.type === 'SUBJECTIVE'">
                  <div class="answer-group">
                    <p class="answer-label">나의 답변</p>
                    <textarea
                      class="answer-box user-answer-box"
                      v-model="userAnswers.get(currentQuestion.id).value"
                      placeholder="답변을 입력하세요."
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="loading-message">
            <p>시험 문제를 로딩 중입니다...</p>
          </div>
        </div>
        <div class="submit-and-exit-buttons">
          <button class="submit-button" @click="handleSubmitAnswer" :disabled="!currentQuestion">
            제출
          </button>
        </div>
      </main>
    </div>
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import Header from '@/components/layouts/Header.vue';
import Footer from '@/components/layouts/Footer.vue';
import SvgIcon from '@jamescoyle/vue-icon';
import { mdiChevronLeft, mdiChevronRight } from '@mdi/js';
import TraineeTestSideBar from '@/components/trainee/test/TraineeTestSideBar.vue';
import axios from 'axios'; // axios 임포트

// --- 문제 데이터 타입 정의 ---
interface GradingCriterion {
  score: number;
  criteria: string;
  example: string;
  note: string;
}

interface RawQuestion {
  type: 'OBJECTIVE' | 'SUBJECTIVE';
  difficulty_level: 'EASY' | 'NORMAL' | 'HARD';
  question: string;
  options: string[] | null;
  answer: string;
  explanation: string;
  grading_criteria: GradingCriterion[] | null;
  document_id: number;
  tags: string[];
}

// QuestionData 인터페이스에 isAnswered 속성 추가
export interface QuestionData {
  id: string;
  type: 'OBJECTIVE' | 'SUBJECTIVE';
  difficulty_level: 'EASY' | 'NORMAL' | 'HARD';
  questionText: string;
  options: string[] | null;
  explanation: string;
  gradingCriteria: GradingCriterion[] | null;
  document_id: number;
  tags: string[];
  isAnswered: boolean; // 추가된 속성
}
// --- 문제 데이터 타입 정의 끝 ---

const router = useRouter();
const route = useRoute();

const testId = route.params.testId as string;
const userId = ref('testUser123'); // 예시 userId, 실제로는 로그인 정보 등에서 가져와야 함

// allQuestions를 QuestionData[] 타입으로 선언
const allQuestions = ref<QuestionData[]>([]);
const currentQuestionId = ref<string | null>(null);

const userAnswers = ref(new Map<string, string | { value: string }>());

const currentQuestion = computed(() => {
  if (!currentQuestionId.value || allQuestions.value.length === 0) {
    return null;
  }
  return allQuestions.value.find(q => q.id === currentQuestionId.value);
});

const currentQuestionIndex = computed(() => {
  if (!currentQuestion.value) return -1;
  return allQuestions.value.findIndex(q => q.id === currentQuestion.value?.id);
});

const hasPreviousQuestion = computed(() => currentQuestionIndex.value > 0);
const hasNextQuestion = computed(() => currentQuestionIndex.value < allQuestions.value.length - 1);
const isLastQuestion = computed(() => currentQuestionIndex.value === allQuestions.value.length - 1); // 변수명 복원

const sampleApiData: RawQuestion[] = [
  {
    "type": "OBJECTIVE",
    "difficulty_level": "NORMAL",
    "question": "To-Be 프로세스 체인 정의서에서 'PC.10' 체인의 명칭은 무엇인가?",
    "options": ["세금계산서", "전자결재", "수기전표", "ERP 전표"],
    "answer": "세금계산서",
    "explanation": "'PC.10' 체인의 명칭은 '세금계산서'로 정의되어 있습니다.",
    "grading_criteria": null,
    "document_id": 1,
    "tags": ["문해력"]
  },
  {
    "type": "OBJECTIVE",
    "difficulty_level": "NORMAL",
    "question": "PC.10.01 프로세스에서 '정발행 세금계산서'의 ERP I/F System은 무엇인가?",
    "options": ["스마트빌", "eBill", "XML 업로드", "오프라인"],
    "answer": "XML 업로드",
    "explanation": "정발행 세금계산서의 ERP I/F System은 XML 업로드 방식으로 처리됩니다.",
    "grading_criteria": null,
    "document_id": 1,
    "tags": ["이해력"]
  },
  {
    "type": "SUBJECTIVE",
    "difficulty_level": "NORMAL",
    "question": "PC.10.02 프로세스에서 정발행/역발행 건의 결재 요청 및 승인 절차를 설명하세요. 이 문제는 지문이 다소 길어질 수 있으므로, 보기가 스크롤될 수 있도록 충분한 높이를 확보해야 합니다. 이는 사용자가 문제의 모든 보기를 한눈에 볼 수 있도록 하면서도, 전체 레이아웃의 균형을 유지하는 데 중요합니다. 이 문제는 지문이 다소 길어질 수 있으므로, 보기가 스크롤될 수 있도록 충분한 높이를 확보해야 합니다. 이는 사용자가 문제의 모든 보기를 한눈에 볼 수 있도록 하면서도, 전체 레이아웃의 균형을 유지하는 데 중요합니다. 이 문제는 지문이 다소 길어질 수 있으므로, 보기가 스크롤될 수 있도록 충분한 높이를 확보해야 합니다. 이는 사용자가 문제의 모든 보기를 한눈에 볼 수 있도록 하면서도, 전체 레이아웃의 균형을 유지하는 데 중요합니다.",
    "options": null,
    "answer": "검수/출장비 기반으로 발생한 정발행/역발행 건을 결재 요청하고, 결재 승인하는 절차입니다.",
    "explanation": "PC.10.02 프로세스는 검수/출장비를 기반으로 정발행/역발행 건을 결재 요청하고 승인하는 절차를 포함합니다.",
    "grading_criteria": [
      { "score": 5, "criteria": "정확하게 결재 요청 및 승인 절차를 설명하고, 관련 프로세스를 언급함.", "example": "검수/출장비 기반으로 발생한 정발행/역발행 건을 결재 요청하고, 결재 승인하는 절차입니다.", "note": "정확한 프로세스 명칭과 절차를 포함해야 합니다." },
      { "score": 3, "criteria": "결재 요청 및 승인 절차를 대략적으로 설명함.", "example": "정발행/역발행 건을 결재 요청하고 승인하는 절차입니다.", "note": "프로세스의 주요 요소를 언급해야 합니다." },
      { "score": 1, "criteria": "결재 요청 또는 승인 절차 중 하나만 언급함.", "example": "결재 요청 절차입니다.", "note": "부분적인 설명만 포함된 경우입니다." }
    ],
    "document_id": 1,
    "tags": ["분석력"]
  },
  {
    "type": "SUBJECTIVE",
    "difficulty_level": "NORMAL",
    "question": "PC.10.03 수기전표관리 프로세스에서 수기전표의 생성 및 관리 절차를 설명하세요.",
    "options": null,
    "answer": "수기전표 대상을 조회하고 추가 등록하여 결재 상신하는 절차입니다.",
    "explanation": "PC.10.03 프로세스는 수기전표 대상을 조회하고 추가 등록하여 결재 상신하는 절차를 포함합니다.",
    "grading_criteria": [
      { "score": 5, "criteria": "수기전표의 생성 및 관리 절차를 정확하게 설명하고, 관련 프로세스를 언급함.", "example": "수기전표 대상을 조회하고 추가 등록하여 결재 상신하는 절차입니다.", "note": "정확한 프로세스 명칭과 절차를 포함해야 합니다." },
      { "score": 3, "criteria": "수기전표의 생성 및 관리 절차를 대략적으로 설명함.", "example": "수기전표를 조회하고 결재 상신하는 절차입니다.", "note": "프로세스의 주요 요소를 언급해야 합니다." },
      { "score": 1, "criteria": "수기전표의 생성 또는 관리 절차 중 하나만 언급함.", "example": "수기전표 조회 절차입니다.", "note": "부분적인 설명만 포함된 경우입니다." }
    ],
    "document_id": 1,
    "tags": ["문제해결력"]
  },
  {
    "type": "OBJECTIVE",
    "difficulty_level": "HARD",
    "question": "다음 중 데이터 시각화 도구가 아닌 것은?",
    "options": ["Tableau", "Power BI", "MS Word", "Qlik Sense"],
    "answer": "MS Word",
    "explanation": "MS Word는 워드 프로세싱 소프트웨어이며, Tableau, Power BI, Qlik Sense는 데이터 시각화 도구입니다.",
    "grading_criteria": null,
    "document_id": 2,
    "tags": ["상식", "IT"]
  },
  {
    "type": "SUBJECTIVE",
    "difficulty_level": "EASY",
    "question": "Vue.js의 주요 특징 두 가지를 설명하세요.",
    "options": null,
    "answer": "Vue.js는 점진적 채택이 가능하며, 반응형 데이터 바인딩을 지원합니다.",
    "explanation": "Vue.js의 주요 특징으로는 점진적 채택(Progressive Framework)과 반응형 시스템이 있습니다. 점진적 채택은 프로젝트의 규모에 따라 유연하게 사용할 수 있다는 것을 의미하며, 반응형 시스템은 데이터 변경 시 자동으로 UI가 업데이트되는 것을 의미합니다.",
    "grading_criteria": [
      { "score": 5, "criteria": "점진적 채택, 반응형 시스템 등 핵심 특징 2가지 이상을 정확히 설명함.", "example": "점진적 채택과 반응형 데이터 바인딩이 있습니다.", "note": "각 특징에 대한 간략한 설명도 포함하면 좋습니다." },
      { "score": 3, "criteria": "핵심 특징 중 1가지 또는 유사한 특징을 설명함.", "example": "데이터 바인딩이 편리합니다.", "note": "하나의 특징만 정확하거나, 설명이 모호할 수 있습니다." }
    ],
    "document_id": 3,
    "tags": ["개발", "프론트엔드"]
  }
];


const fetchTestQuestions = async () => {
  try {
    const fetchedData = sampleApiData;

    if (Array.isArray(fetchedData)) {
      allQuestions.value = fetchedData.map((rawQ: RawQuestion, index: number) => {
        const generatedId = `Q${(index + 1).toString().padStart(2, '0')}`;
        let initialAnswerValue: string | { value: string };

        if (rawQ.type === 'SUBJECTIVE') {
          initialAnswerValue = ref(''); // 주관식은 ref 객체로 초기화
        } else {
          initialAnswerValue = ''; // 객관식은 문자열로 초기화
        }
        userAnswers.value.set(generatedId, initialAnswerValue);
        
        return {
          id: generatedId,
          type: rawQ.type,
          difficulty_level: rawQ.difficulty_level,
          questionText: rawQ.question,
          options: rawQ.options,
          explanation: '',
          gradingCriteria: null,
          document_id: rawQ.document_id,
          tags: rawQ.tags,
          isAnswered: false, // 모든 문제의 답변 여부를 false로 초기화
        };
      });

      if (allQuestions.value.length > 0) {
        currentQuestionId.value = allQuestions.value[0].id;
      }
    } else {
      console.warn('문제 데이터를 불러오는 데 실패했습니다: 서버 응답 형식이 예상과 다릅니다.', fetchedData);
      allQuestions.value = [];
    }
  } catch (error) {
    console.error('문제 데이터를 로드하는 데 실패했습니다:', error);
    alert('시험 문제를 불러오는 데 실패했습니다. 잠시 후 다시 시도해주세요.');
  }
};

const handleQuestionSelectFromSidebar = (questionId: string) => {
  currentQuestionId.value = questionId;
};

const goToPreviousQuestion = () => {
  const currentIndex = allQuestions.value.findIndex(q => q.id === currentQuestionId.value);
  if (currentIndex > 0) {
    currentQuestionId.value = allQuestions.value[currentIndex - 1].id;
  }
};

const goToNextQuestion = () => {
  const currentIndex = allQuestions.value.findIndex(q => q.id === currentQuestionId.value);
  if (currentIndex < allQuestions.value.length - 1) {
    currentQuestionId.value = allQuestions.value[currentIndex + 1].id;
  }
};

const getOptionLabel = (index: number): string => {
  return String.fromCharCode(65 + index) + ')';
};

const selectOption = (option: string) => {
  if (currentQuestion.value) {
    userAnswers.value.set(currentQuestion.value.id, option);
    // 객관식 답변 시 해당 문제의 isAnswered를 true로 설정
    const questionToUpdate = allQuestions.value.find(q => q.id === currentQuestion.value?.id);
    if (questionToUpdate) {
      questionToUpdate.isAnswered = true;
    }
  }
};

const handleSubmitAnswer = () => {
  if (!currentQuestion.value) return;

  const unansweredQuestions = allQuestions.value.filter(q => !q.isAnswered);
  let confirmMessage = '';

  if (unansweredQuestions.length > 0) {
    confirmMessage = `풀지 않은 문제가 ${unansweredQuestions.length}개 존재합니다. 정말 제출하시겠습니까? 제출 후에는 수정할 수 없습니다.`;
  } else {
    confirmMessage = `정말 제출하시겠습니까? 제출 후에는 수정할 수 없습니다.`;
  }

  if (confirm(confirmMessage)) {
    submitFinalTest();
  }
};

const submitFinalTest = async () => {
  // 전송할 답변 데이터 형식에 맞춰 변환
  const answersToSend = Array.from(userAnswers.value.entries()).map(([questionId, answer]) => {
    const question = allQuestions.value.find(q => q.id === questionId);
    return {
      id: questionId,
      response: typeof answer === 'object' ? answer.value : answer,
      questionType: question ? question.type : 'UNKNOWN' // 문제 타입도 함께 전송
    };
  });

  const requestBody = {
    userId: userId.value, // 실제 userId 사용
    testId: testId,
    answers: answersToSend
  };

  console.log('최종 제출될 요청 바디:', requestBody);

  try {
    const response = await axios.post('/api/answer', requestBody);
    console.log('시험 제출 성공:', response.data);
    alert('시험이 성공적으로 제출되었습니다!');
    
    // 성공 시 결과 페이지로 이동
    router.push({
      name: 'TraineeTestResult',
      params: { testId: testId },
      state: { testName: '모의 시험', actualScore: 85, isPassed: true } // 예시 데이터
    });
  } catch (error) {
    console.error('시험 제출 실패:', error);
    if (axios.isAxiosError(error) && error.response) {
      // 서버에서 보낸 에러 메시지가 있다면 출력
      alert(`시험 제출 중 오류가 발생했습니다: ${error.response.data.message || '알 수 없는 오류'}`);
    } else {
      alert('시험 제출 중 네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    }
  }
};

// 주관식 답변의 변경을 감지하고 isAnswered 상태 업데이트
watch(() => {
  if (currentQuestion.value?.type === 'SUBJECTIVE') {
    const answerRef = userAnswers.value.get(currentQuestion.value.id);
    // 주관식 답변이 ref이므로 .value를 통해 실제 문자열 값을 감시
    return (answerRef as { value: string }).value;
  }
  return undefined;
}, (newValue) => {
  if (currentQuestion.value && currentQuestion.value.type === 'SUBJECTIVE') {
    const questionToUpdate = allQuestions.value.find(q => q.id === currentQuestion.value?.id);
    if (questionToUpdate) {
      // 답변 내용이 비어있지 않으면 answered를 true로 설정 (공백도 답변으로 간주)
      questionToUpdate.isAnswered = newValue !== '' && newValue !== undefined && newValue !== null;
    }
  }
});


onMounted(() => {
  fetchTestQuestions();
});
</script>

<style scoped>
/*
  전체 레이아웃 스타일
  Header, Footer가 fixed이므로, main content는 margin/padding으로 공간 확보
*/
#test-taking-page-layout {
  display: flex;
  flex-direction: column;
  height: 100vh; /* 뷰포트 전체 높이를 사용 */
  background-color: #f8f8f8;
  font-family: 'Noto Sans KR', sans-serif;
  overflow: hidden;
}

.page-content-wrapper {
  display: grid;
  grid-template-columns: var(--sidebar-width, 220px) 1fr; /* 사이드바 추가로 인한 grid-template-columns 변경 */
  height: calc(100vh - 70px - 60px); /* 예시: Header 70px, Footer 60px 가정 */
  grid-template-rows: 1fr; /* 높이는 자동으로 채움 */
  grid-template-areas: "sidebar main-content"; /* 사이드바 영역 명시 */
  flex: 1;
  position: relative;
  overflow: hidden;
}

/* 사이드바 스타일 (TraineeTestSideBar.vue에 정의되어 있지만, 부모에서 영역 지정) */
.page-content-wrapper .trainee-test-sidebar {
  grid-area: sidebar;
  overflow-y: auto;
}

/* .has-sidebar 클래스는 이제 항상 적용되므로 제거하거나, 유동적인 너비 조절용으로 유지 */
/* .page-content-wrapper.has-sidebar {
  --sidebar-width: 250px;
} */


.main-content-area {
  grid-area: main-content;
  display: flex;
  flex-direction: column;
  padding: 25px;
  overflow: hidden;
  gap: 25px;
  box-sizing: border-box;
  position: relative; /* 제출 버튼을 absolute로 배치하기 위한 기준점 */
  min-height: 0;
  /* padding-bottom: 85px; 이 부분은 이제 .test-taking-container-inner가 다 채우므로 필요 없음 */
}

.test-taking-container-inner {
  display: flex;
  flex-direction: column;
  flex-grow: 1; /* 남은 공간을 모두 차지하도록 설정 */
  min-height: 0; /* flex item 내부 스크롤을 위해 필요 */
  overflow: hidden; /* 내부 스크롤을 위한 설정 */
  /* 제출 버튼 공간 확보를 위해 .question-taking-area가 아닌 이 컨테이너의 하단 패딩을 줄 수도 있음 */
  padding-bottom: 120px; /* 제출 버튼 높이(40px) + 여백(35px) */
}

/* Question Taking Area (문제 영역이 남은 공간을 모두 차지하도록) */
.question-taking-area {
  display: flex;
  flex-direction: column;
  flex-grow: 1; /* 이 부분이 중요: 남은 공간을 채움 */
  gap: 25px;
  min-height: 0; /* flex item 내부 스크롤을 위해 필요 */
  overflow: hidden; /* 이 영역에 스크롤이 생길 수 있음 */
}

.question-section {
  background-color: #ffffff;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  flex-shrink: 0;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  flex-grow: 1; /* 남은 공간을 차지하여 높이 유연하게 조절 */
  min-height: 350px; /* 최소 높이 유지 */
  overflow: hidden; /* 내부 스크롤 가능한 영역을 위해 */
}

/* Top Navigation */
.top-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  flex-shrink: 0; /* 이 요소는 축소되지 않음 */
}

.question-number-top {
  font-size: 26px;
  font-weight: 700;
  color: #343a40;
  margin: 0;
  padding-right: 20px;
}

.nav-buttons-wrapper {
  display: flex;
  gap: 12px;
}

.nav-button {
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 10px 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  font-size: 15px;
  font-weight: 500;
  color: #495057;
  transition: all 0.2s ease-in-out;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.nav-button:hover:not(:disabled) {
  background-color: #f0f0f0;
  border-color: #d0d0d0;
  color: #343a40;
  transform: translateY(-1px);
}

.nav-button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
  background-color: #f8f9fa;
  color: #adb5bd;
}

.nav-icon {
  font-size: 20px;
  margin: 0 5px;
  color: #6c757d;
}
.nav-button:hover:not(:disabled) .nav-icon {
  color: #495057;
}


.question-text-fixed {
  flex-shrink: 0;
  margin-bottom: 20px;
}

.question-text {
  font-size: 17px;
  line-height: 1.7;
  margin: 0;
  color: #495057;
}

.question-content-scrollable {
  flex-grow: 1;
  overflow-y: auto;
  padding-right: 10px;
}

.question-content-scrollable::-webkit-scrollbar {
  width: 6px;
}
.question-content-scrollable::-webkit-scrollbar-track {
  background: transparent;
}
.question-content-scrollable::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
}
.question-content-scrollable::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.4);
}

.options-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.option-item {
  display: flex;
  align-items: flex-start;
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 10px;
  padding: 15px 25px;
  font-size: 16px;
  color: #495057;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  position: relative;
}

.option-item:hover {
  background-color: #e9ecef;
  border-color: #ced4da;
}

.option-item.is-selected {
  background-color: #e6f7ff;
  border-color: #a8dcf0;
  font-weight: 600;
  color: #2b6cb0;
  box-shadow: 0 2px 5px rgba(0, 123, 255, 0.1);
}

.option-label {
  min-width: 30px;
  font-weight: bold;
  margin-right: 15px;
  color: #6c757d;
  flex-shrink: 0;
}
.option-item.is-selected .option-label {
  color: #2b6cb0;
}

.option-content {
  flex-grow: 1;
  word-break: break-word;
}

.subjective-answer-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-bottom: 5px;
}

.answer-group {
  display: flex;
  flex-direction: column;
}

.answer-label {
  font-size: 15px;
  font-weight: 600;
  color: #343a40;
  margin-bottom: 8px;
  align-self: flex-start;
}

.answer-box {
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 10px;
  padding: 15px 20px;
  font-size: 16px;
  line-height: 1.6;
  word-break: break-word;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  min-height: 150px;
  resize: vertical;
  color: #495057;
}

.answer-box:focus {
  border-color: #a8dcf0;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
  outline: none;
}


/* Submit and Exit Buttons (오른쪽 하단 고정) */
.submit-and-exit-buttons {
  position: absolute; /* main-content-area에 상대적으로 고정 */
  bottom: 85px; /* Footer 높이(60px) + 버튼 하단 여백(25px) = 85px */
  right: 25px; /* main-content-area의 padding-right와 일치 */
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  flex-shrink: 0;
  z-index: 10; /* 다른 요소 위에 오도록 z-index 설정 */
}

.submit-button {
  border: none;
  border-radius: 10px;
  padding: 12px 25px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out, transform 0.1s ease-in-out;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  background-color: #28a745;
  color: white;
}

.submit-button:hover:not(:disabled) {
  background-color: #218838;
  transform: translateY(-1px);
}

.submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background-color: #92b192;
}

.loading-message {
  background-color: #ffffff;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  text-align: center;
  color: #555;
  font-size: 17px;
  height: 250px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>