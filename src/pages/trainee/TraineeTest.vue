<template>
  <div id="test-exam-page-layout">
    <Header :isExamActive="examStore.isExamActive" />

    <div class="page-content-wrapper" :class="{ 'has-sidebar': allQuestions.length > 0 }">
      <TraineeTestSideBar
        :questions="allQuestions"
        :currentQuestionId="currentQuestionId"
        @selectQuestion="handleQuestionSelectFromSidebar"
        v-if="allQuestions.length > 0"
        :traineeName="traineeName"
      />

      <TestExamMainContent
        :currentQuestion="currentQuestion"
        :hasPreviousQuestion="hasPreviousQuestion"
        :hasNextQuestion="hasNextQuestion"
        @goToPreviousQuestion="goToPreviousQuestion"
        @goToNextQuestion="goToNextQuestion"
        @submitTest="submitTest"
        :getOptionLabel="getOptionLabel"
        :isExamMode="true"
        @update:userAnswer="updateUserAnswer"
        @selectOption="selectOption"
        :isExamActive="examStore.isExamActive"
      />
    </div>

    <Footer />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
// --- IMPORTANT CHANGE HERE: Import useExamStore from its dedicated file ---
import { useExamStore } from '@/stores/test';

import Header from '@/components/layouts/Header.vue';
import Footer from '@/components/layouts/Footer.vue';
import TraineeTestSideBar from '@/components/trainee/test/TraineeTestSideBar.vue';
// Note: The original error message showed '@/components/trainee/test/TestMainContent.vue'
// but your latest code uses '@/components/trainee/exam/TestExamMainContent.vue'.
// Please ensure the import path for your main content component is correct for your project structure.
import TestExamMainContent from '@/components/trainee/test/TestMainContent.vue';


// Pinia 스토어 인스턴스 사용
// const examStore = useExamStore(); // <--- This line is correct.

const router = useRouter();

// --- 타입 정의 ---
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
  userAnswer: string;
  isAnswered: boolean;
  isCorrect: boolean;
}
// --- 타입 정의 끝 ---

const allQuestions = ref<QuestionData[]>([]);
const currentQuestionId = ref<string | null>(null);
const traineeName = ref<string>('홍길동'); // 응시자 이름 (예시 값)

// 현재 문제 객체를 계산합니다.
const currentQuestion = computed(() => {
  if (!currentQuestionId.value || allQuestions.value.length === 0) {
    return null;
  }
  return allQuestions.value.find(q => q.id === currentQuestionId.value);
});

// 현재 문제의 인덱스를 계산합니다.
const currentQuestionIndex = computed(() => {
  if (!currentQuestion.value) return -1;
  return allQuestions.value.findIndex(q => q.id === currentQuestion.value?.id);
});

// 이전 문제 존재 여부를 판단합니다.
const hasPreviousQuestion = computed(() => currentQuestionIndex.value > 0);

// 다음 문제 존재 여부를 판단합니다.
const hasNextQuestion = computed(() => currentQuestionIndex.value < allQuestions.value.length - 1);

// UI 확인을 위한 Sample Data (Hardcoded)
const sampleExamData: RawQuestion[] = [
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

// 시험 문제 데이터를 가져오는 함수 (실제 API 호출로 대체될 수 있습니다.)
const fetchExamQuestions = async () => {
  try {
    const fetchedData = sampleExamData; // 샘플 데이터를 직접 사용

    if (Array.isArray(fetchedData)) {
      allQuestions.value = fetchedData.map((rawQ: RawQuestion, index: number) => {
        const generatedId = `Q${(index + 1).toString().padStart(2, '0')}`;
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
          userAnswer: '', // 사용자 답변 초기화
          isAnswered: false, // 답변 여부 초기화
          isCorrect: false, // 정답 여부 초기화
        };
      });

      if (allQuestions.value.length > 0) {
        currentQuestionId.value = allQuestions.value[0].id; // 첫 번째 문제로 설정
        examStore.setExamActive(true); // 시험 시작 시 스토어 상태를 true로 업데이트
      }
    } else {
      console.warn('샘플 데이터가 예상된 문제 배열 형태가 아닙니다.', fetchedData);
      allQuestions.value = [];
    }
  } catch (error) {
    console.error('시험 문제를 로드하는 데 실패했습니다:', error);
    alert('시험 문제를 불러오는 데 실패했습니다. 콘솔을 확인해주세요.');
  }
};

// 사이드바에서 문제 선택 시 호출되는 핸들러
const handleQuestionSelectFromSidebar = (questionId: string) => {
  currentQuestionId.value = questionId;
};

// 이전 문제로 이동하는 함수
const goToPreviousQuestion = () => {
  const currentIndex = allQuestions.value.findIndex(q => q.id === currentQuestionId.value);
  if (currentIndex > 0) {
    currentQuestionId.value = allQuestions.value[currentIndex - 1].id;
  }
};

// 다음 문제로 이동하는 함수
const goToNextQuestion = () => {
  const currentIndex = allQuestions.value.findIndex(q => q.id === currentQuestionId.value);
  if (currentIndex < allQuestions.value.length - 1) {
    currentQuestionId.value = allQuestions.value[currentIndex + 1].id;
  }
};

// 주관식 문제 답변 업데이트 함수
const updateUserAnswer = (newValue: string) => {
  const q = currentQuestion.value;
  if (q) {
    q.userAnswer = newValue;
    q.isAnswered = newValue.trim() !== ''; // 답변 내용이 있으면 '답변 완료'로 처리
  }
};

// 객관식 문제 옵션 선택 함수
const selectOption = (selectedOption: string) => {
  const q = currentQuestion.value;
  if (q && q.type === 'OBJECTIVE') {
    q.userAnswer = selectedOption;
    q.isAnswered = true; // 옵션 선택 시 '답변 완료'로 처리
  }
};

// 객관식 보기 라벨 (A, B, C...)을 생성하는 함수
const getOptionLabel = (index: number): string => {
  return String.fromCharCode(65 + index) + ')';
};

// 시험 제출 함수
const submitTest = () => {
  if (confirm('시험을 제출하시겠습니까? 제출 후에는 수정할 수 없습니다.')) {
    console.log('시험 제출 완료!', allQuestions.value);
    examStore.setExamActive(false); // 시험 종료 시 스토어 상태를 false로 업데이트
    router.push({ name: 'TraineeTestResult' }); // 결과 페이지로 이동
  }
};

// 컴포넌트 마운트 시 시험 문제 로드
onMounted(() => {
  fetchExamQuestions();
});

// 컴포넌트 언마운트 시 추가 로직이 필요하다면 여기에 추가 (예: 시험 상태 초기화)
// 현재는 라우터 가드에서 이동을 막고 있으므로 필수적이지 않습니다.
onUnmounted(() => {
  // 예: examStore.setExamActive(false); // 컴포넌트가 파괴될 때 시험 상태를 명시적으로 비활성화
});
</script>

<style scoped>
#test-exam-page-layout {
  display: flex;
  flex-direction: column;
  height: 100vh; /* 전체 화면 높이 사용 */
  background-color: #f8f8f8; /* 배경색 설정 */
  font-family: 'Noto Sans KR', sans-serif; /* 폰트 설정 */
  overflow: hidden; /* 오버플로우 숨김 */
  /* 복사/붙여넣기 방지 (전체 페이지) - 라우터 가드와 함께 사용 시 더욱 강력 */
  user-select: none; /* 표준 */
  -webkit-user-select: none; /* Safari */
  -moz-user-select: none; /* Firefox */
  -ms-user-select: none; /* IE/Edge */
}

.page-content-wrapper {
  display: grid;
  /* 사이드바가 있을 때와 없을 때의 그리드 템플릿 컬럼 설정 */
  grid-template-columns: var(--sidebar-width, 0px) 1fr;
  height: calc(100vh - 70px - 60px); /* 헤더(70px)와 푸터(60px) 높이를 제외한 영역 */
  grid-template-rows: 1fr;
  grid-template-areas: "sidebar main-content"; /* 그리드 영역 이름 정의 */
  flex: 1; /* 남은 공간을 모두 차지하도록 설정 */
  position: relative;
  overflow: hidden;
  justify-content: center; /* 수평 중앙 정렬 */
  align-items: center; /* 수직 중앙 정렬 */
}

.page-content-wrapper .trainee-test-sidebar {
  grid-area: sidebar; /* 사이드바 영역 지정 */
}

/* 사이드바가 있을 때만 너비 설정 */
.page-content-wrapper.has-sidebar {
  --sidebar-width: 180px; /* 사이드바 너비를 180px로 조정 */
}
</style>