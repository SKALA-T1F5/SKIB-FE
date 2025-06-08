<template>
  <div id="test-result-page-layout">
    <Header />

    <div class="page-content-wrapper" :class="{ 'has-sidebar': allQuestions.length > 0 }">
      <TraineeTestResultSideBar
        :questions="allQuestions"
        :currentQuestionId="currentQuestionId"
        @selectQuestion="handleQuestionSelectFromSidebar"
        v-if="allQuestions.length > 0"
      />

      <TestResultMainContent
        :currentQuestion="currentQuestion"
        :hasPreviousQuestion="hasPreviousQuestion"
        :hasNextQuestion="hasNextQuestion"
        @goToPreviousQuestion="goToPreviousQuestion"
        @goToNextQuestion="goToNextQuestion"
        @exitTestResult="exitTestResult"
        :getOptionLabel="getOptionLabel"
        :isExamMode="false"
      />

      <ChatbotSection />
    </div>
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import Header from '@/components/layouts/Header.vue';
import Footer from '@/components/layouts/Footer.vue';
import TraineeTestResultSideBar from '@/components/trainee/result/TraineeTestResultSideBar.vue';
import TestResultMainContent from '@/components/trainee/result/TestResultMainContent.vue';
import ChatbotSection from '@/components/trainee/result/ChatbotSection.vue';

// --- 문제 데이터 타입 정의 (기존과 동일) ---
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

export interface QuestionData {
  id: string;
  type: 'OBJECTIVE' | 'SUBJECTIVE';
  difficulty_level: 'EASY' | 'NORMAL' | 'HARD';
  questionText: string;
  options: string[] | null;
  correctAnswer: string;
  explanation: string;
  gradingCriteria: GradingCriterion[] | null;
  document_id: number;
  tags: string[];
  userAnswer: string; // 사용자 답변 (응시 화면에서는 v-model로 바인딩, 결과 화면에서는 표시)
  isCorrect: boolean; // 정답 여부 (결과 화면에서 사용)
}
// --- 문제 데이터 타입 정의 끝 ---

const router = useRouter();

const allQuestions = ref<QuestionData[]>([]);
const currentQuestionId = ref<string | null>(null);

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

// UI 확인을 위한 Sample Data (Hardcoded)
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
    "answer": "검수/출장비 기반으로 발생한 정발행/역발행 건을 결재 요청하고, 결재 승인하는 절차입니다. 이 예시 답안은 실제 답변의 길이와 복잡성을 반영하며, 사용자가 작성한 답변과 비교될 수 있도록 충분한 정보를 포함합니다. 이 예시 답안은 실제 답변의 길이와 복잡성을 반영하며, 사용자가 작성한 답변과 비교될 수 있도록 충분한 정보를 포함합니다. 이 예시 답안은 실제 답변의 길이와 복잡성을 반영하며, 사용자가 작성한 답변과 비교될 수 있도록 충분한 정보를 포함합니다. 이 예시 답안은 실제 답변의 길이와 복잡성을 반영하며, 사용자가 작성한 답변과 비교될 수 있도록 충분한 정보를 포함합니다.",
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
        let userAnswer = '';
        let isCorrect = false;

        if (rawQ.type === 'OBJECTIVE') {
          // Figma 이미지에 맞춰 Q01은 정답, Q02는 오답 (첫번째 보기 선택), Q05는 정답으로 설정
          if (generatedId === 'Q01') {
            userAnswer = rawQ.answer; // 정답으로 설정
          } else if (generatedId === 'Q02') {
            userAnswer = rawQ.options && rawQ.options.length > 0 ? rawQ.options[0] : ''; // 오답으로 설정
          } else if (generatedId === 'Q05') {
            userAnswer = rawQ.answer; // 정답으로 설정
          }
          isCorrect = (userAnswer === rawQ.answer);
        } else { // SUBJECTIVE (주관식)
          // Q03과 Q04는 임의로 정답 처리, Q06은 오답 처리
          if (generatedId === 'Q03') {
            userAnswer = "검수/출장비 기반으로 정발행/역발행 건을 결재 요청하고 승인하는 절차입니다. 저의 답변은 좀 더 자세한 내용을 포함합니다. 이 답변은 예시 답안과 비교하여 채점될 수 있습니다.";
            isCorrect = true; // Figma 이미지처럼 'O' 표시를 위해 true
          } else if (generatedId === 'Q04') {
            userAnswer = "수기전표는 조회하고 추가 등록하여 결재 상신하는 과정으로 관리됩니다. 이 과정은 전표의 정확성을 보장하고 승인을 위한 중요한 단계입니다.";
            isCorrect = true; // Figma 이미지처럼 'O' 표시를 위해 true
          } else if (generatedId === 'Q06') {
            userAnswer = "반응형 데이터 바인딩입니다."; // 부분 답변으로 오답 처리
            isCorrect = false; // Figma 이미지처럼 'X' 표시를 위해 false
          }
        }

        return {
          id: generatedId,
          type: rawQ.type,
          difficulty_level: rawQ.difficulty_level,
          questionText: rawQ.question,
          options: rawQ.options,
          correctAnswer: rawQ.answer,
          explanation: rawQ.explanation,
          gradingCriteria: rawQ.grading_criteria,
          document_id: rawQ.document_id,
          tags: rawQ.tags,
          userAnswer: userAnswer,
          isCorrect: isCorrect,
        };
      });

      if (allQuestions.value.length > 0) {
        currentQuestionId.value = allQuestions.value[0].id;
      }
    } else {
      console.warn('샘플 데이터가 예상된 문제 배열 형태가 아닙니다.', fetchedData);
      allQuestions.value = [];
    }

  } catch (error) {
    console.error('샘플 데이터를 로드하는 데 실패했습니다:', error);
    alert('UI 데이터를 불러오는 데 실패했습니다. 콘솔을 확인해주세요.');
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

const exitTestResult = () => {
  if (confirm('테스트 결과 화면을 종료하시겠습니까?')) {
    console.log('테스트 결과 화면 종료 (실제 앱에서는 메인 페이지로 이동)');
    router.push({ name: 'TraineeMain' });
  }
};

onMounted(() => {
  fetchTestQuestions();
});
</script>

<style scoped>
/*
  전체 레이아웃 스타일
  Header, Footer가 fixed이므로, main content는 margin/padding으로 공간 확보
*/
#test-result-page-layout {
  display: flex;
  flex-direction: column;
  height: 100vh; /* 뷰포트 전체 높이를 사용 */
  background-color: #f8f8f8; /* Figma 이미지의 배경색에 더 가깝게 조정 */
  font-family: 'Noto Sans KR', sans-serif;
  overflow: hidden; /* 전체 페이지 스크롤을 막고 내부 요소만 스크롤하게 할 때 사용합니다. */
}

.page-content-wrapper {
  display: grid;
  /* 챗봇 영역 너비 320px -> 380px으로 변경 */
  grid-template-columns: var(--sidebar-width, 0px) 1fr 380px;
  height: calc(100vh - 70px - 60px); /* 예시: Header 70px, Footer 60px 가정 */
  grid-template-rows: 1fr; /* 높이는 자동으로 채움 */
  grid-template-areas: "sidebar main-content chatbot";
  flex: 1; /* 부모 flex-direction: column; 일 때 남은 공간 차지 */
  position: relative;
  overflow: hidden; /* 내부 그리드 아이템들이 각자 스크롤되도록 설정 */
}

.page-content-wrapper .trainee-test-result-sidebar {
  grid-area: sidebar;
  overflow-y: auto;
}

.page-content-wrapper.has-sidebar {
  --sidebar-width: 250px;
}
</style>