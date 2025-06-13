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

      <main class="main-content-area">
        <div class="test-result-container-inner">
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

          <div class="question-solution-area" v-if="currentQuestion">
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
                      {
                        'is-selected': currentQuestion.userAnswer === option,
                        'is-correct-answer': option === currentQuestion.correctAnswer,
                        'is-wrong-answer': currentQuestion.userAnswer === option && option !== currentQuestion.correctAnswer
                      }
                    ]"
                  >
                    <span class="option-label">{{ getOptionLabel(index) }}</span>
                    <span class="option-content">{{ option }}</span>
                    <svg-icon v-if="option === currentQuestion.correctAnswer" :path="mdiCheckCircle" class="answer-icon correct-icon" />
                    <svg-icon v-if="currentQuestion.userAnswer === option && option !== currentQuestion.correctAnswer" :path="mdiCloseCircle" class="answer-icon wrong-icon" />
                  </div>
                </div>
                <div class="subjective-answer-section" v-else-if="currentQuestion.type === 'SUBJECTIVE'">
                  <div class="answer-group">
                    <p class="answer-label">나의 답변</p>
                    <div class="answer-box user-answer-box">
                      <p>{{ currentQuestion.userAnswer || '답변 없음' }}</p>
                    </div>
                  </div>
                  <div class="answer-group mt-3">
                    <p class="answer-label">예시 답안</p>
                    <div class="answer-box example-answer-box">
                      <p>{{ currentQuestion.correctAnswer || '예시 답안 없음' }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="solution-section">
              <h4 class="solution-title">풀이</h4>
              <div v-if="currentQuestion.explanation" class="solution-text">
                {{ currentQuestion.explanation }}
              </div>
              <div v-else-if="currentQuestion.gradingCriteria && currentQuestion.gradingCriteria.length > 0" class="grading-criteria">
                <h4 class="criteria-title">채점 기준:</h4>
                <ul>
                  <li v-for="(criterion, index) in currentQuestion.gradingCriteria" :key="index">
                    <strong>점수: {{ criterion.score }}점</strong> - {{ criterion.criteria }}
                    <p v-if="criterion.example" class="criteria-sub-text">예시: {{ criterion.example }}</p>
                    <p v-if="criterion.note" class="criteria-sub-text">참고: {{ criterion.note }}</p>
                  </li>
                </ul>
              </div>
              <div v-else class="no-solution">
                <p>이 문제에 대한 풀이 또는 채점 기준이 없습니다.</p>
              </div>
            </div>
          </div>
          <div v-else class="loading-message">
            <p>시험 결과를 로딩 중입니다...</p>
          </div>

          <div class="exit-button-container">
            <button class="exit-button" @click="exitTestResult">나가기</button>
          </div>
        </div>
      </main>

      <div class="chatbot-section">
        <div class="chatbot-header">
          <svg-icon type="mdi" :path="mdiRobot" class="chatbot-header-icon" />
          <span class="chatbot-header-text">챗봇</span>
        </div>

        <div class="chatbot-messages">
          <div class="message trainee-msg" v-if="currentQuestion && currentQuestion.id === 'Q03'">
            <p>PC.10.02 프로세스에서 정발행/역발행 건의 결재 요청 및 승인 절차를 자세히 알려주세요.</p>
          </div>
          <div class="message bot-msg" v-if="currentQuestion && currentQuestion.id === 'Q03'">
            <p>PC.10.02 프로세스는 검수/출장비 기반으로 발생한 정발행/역발행 건을 결재 요청하고, 결재 승인하는 절차입니다.</p>
          </div>
          <div class="message trainee-msg">
            <p>세금계산서 발행 프로세스에 대해 더 알려주세요.</p>
          </div>
          <div class="message bot-msg">
            <p>세금계산서 발행 프로세스는 크게 정발행과 역발행으로 나뉩니다. 정발행은 공급자가 발행하고, 역발행은 공급받는 자가 발행 요청하는 방식입니다. 어떤 부분이 궁금하신가요?</p>
          </div>
          <div
            v-for="(message, index) in messages"
            :key="index"
            :class="['message', message.sender === 'user' ? 'trainee-msg' : 'bot-msg']"
          >
            <p>{{ message.text }}</p>
          </div>
        </div>

        <div class="chatbot-input-area">
          <input
            type="text"
            placeholder="메세지를 입력하세요"
            class="message-input"
            v-model="newMessage"
            @keyup.enter="sendMessage"
          />
          <button class="send-button" @click="sendMessage">
            <svg-icon type="mdi" :path="mdiSend" class="send-icon" />
          </button>
          <div class="chatbot-avatar">
            <svg-icon type="mdi" :path="mdiRobot" class="robot-icon" />
          </div>
        </div>
      </div>
    </div>
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'; // nextTick 임포트
import { useRouter } from 'vue-router';
import Header from '@/components/layouts/Header.vue';
import Footer from '@/components/layouts/Footer.vue';
import TraineeTestResultSideBar from '@/components/trainee/result/TraineeTestResultSideBar.vue';
import SvgIcon from '@jamescoyle/vue-icon';
import { mdiChevronLeft, mdiChevronRight, mdiSend, mdiRobot, mdiCheckCircle, mdiCloseCircle } from '@mdi/js';

// --- 문제 데이터 타입 정의 (생략 - 기존과 동일) ---
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
  isCorrect: boolean;
}
// --- 문제 데이터 타입 정의 끝 ---

// --- 챗봇 메시지 타입 정의 ---
interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
}
// --- 챗봇 메시지 타입 정의 끝 ---

const router = useRouter();

const allQuestions = ref<QuestionData[]>([]);
const currentQuestionId = ref<string | null>(null);

// 챗봇 관련 상태
const newMessage = ref<string>(''); // 사용자가 입력할 메시지
const messages = ref<ChatMessage[]>([]); // 챗봇 메시지 목록

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
    "options": ["세금계산서", "전자결재", "수기전표", "ERP 전표"], // 4지선다로 수정
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
    "options": ["스마트빌", "eBill", "XML 업로드", "오프라인"], // 4지선다
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
    "options": ["Tableau", "Power BI", "MS Word", "Qlik Sense"], // 4지선다
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

// 챗봇 메시지 전송 로직
const sendMessage = async () => {
  if (newMessage.value.trim() === '') {
    return; // 빈 메시지는 전송하지 않음
  }

  // 사용자 메시지 추가
  messages.value.push({
    sender: 'user',
    text: newMessage.value.trim()
  });

  // 입력 필드 초기화
  newMessage.value = '';

  // 메시지 목록의 스크롤을 가장 아래로 이동 (다음 틱에서 DOM 업데이트 후 실행)
  await nextTick();
  const chatMessagesContainer = document.querySelector('.chatbot-messages');
  if (chatMessagesContainer) {
    chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
  }

  // 여기에 챗봇 응답 로직 추가 (예: API 호출)
  // 임시 응답: 사용자 메시지를 에코
  setTimeout(async () => {
    messages.value.push({
      sender: 'bot',
      text: `"${messages.value[messages.value.length - 1].text}" 에 대한 답변을 준비 중입니다.`
    });
    // 챗봇 응답 후에도 스크롤 이동
    await nextTick();
    if (chatMessagesContainer) {
      chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
    }
  }, 1000); // 1초 후 챗봇 응답 시뮬레이션
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

.main-content-area {
  grid-area: main-content;
  display: flex;
  flex-direction: column;
  padding: 25px;
  overflow: hidden;
  gap: 25px;
  box-sizing: border-box;
  position: relative;
  min-height: 0;
}

/* Top Navigation */
.top-nav {
  display: flex;
  justify-content: space-between; /* 문제 번호와 버튼 그룹을 양 끝으로 정렬 */
  align-items: center; /* 수직 중앙 정렬 */
  margin-bottom: 25px;
  flex-shrink: 0;
}

.question-number-top {
  font-size: 26px; /* 기존 .question-number와 동일한 크기 */
  font-weight: 700;
  color: #343a40;
  margin: 0; /* 기본 마진 제거 */
  padding-right: 20px; /* 버튼과의 간격 확보 */
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


/* Question and Solution Area */
.question-solution-area {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  gap: 25px;
  min-height: 0;
}

.question-section,
.solution-section {
  background-color: #ffffff;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  flex-shrink: 0;
  box-sizing: border-box;
  display: flex; /* 내부 콘텐츠를 flex로 제어 */
  flex-direction: column; /* 수직 정렬 */
}

.question-section {
  height: 350px; /* 고정 높이 */
  /* problem text와 scrollable content를 분리하기 위해 overflow 제거 */
  overflow: hidden;
}

.question-text-fixed {
  flex-shrink: 0; /* 이 영역은 축소되지 않음 */
  margin-bottom: 20px; /* 문제 텍스트와 하단 콘텐츠 사이 간격 */
  /* padding은 question-section에서 이미 적용되었으므로 별도 패딩 없음 */
}

.question-text {
  font-size: 17px;
  line-height: 1.7;
  margin: 0; /* 기본 마진 제거 */
  color: #495057;
}

.question-content-scrollable {
  flex-grow: 1; /* 남은 공간을 차지하여 스크롤 가능한 영역 */
  overflow-y: auto; /* 내용이 길어질 경우 이 영역 내에서만 스크롤 */
  padding-right: 10px; /* 스크롤바 공간 확보 */
}

/* 문제 섹션 내부 스크롤바 */
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
  cursor: default;
  transition: all 0.2s ease-in-out;
  position: relative;
}

.option-item.is-selected {
  background-color: #e6f7ff;
  border-color: #a8dcf0;
  font-weight: 600;
  color: #2b6cb0;
}

.option-item.is-correct-answer {
  background-color: #e6ffe6;
  border-color: #a8edb8;
  color: #28a745;
}
.option-item.is-wrong-answer {
  background-color: #ffe6e6;
  border-color: #edb8b8;
  color: #dc3545;
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
.option-item.is-correct-answer .option-label {
    color: #28a745;
}
.option-item.is-wrong-answer .option-label {
    color: #dc3545;
}


.option-content {
  flex-grow: 1;
  word-break: break-word;
}

.answer-icon {
  position: absolute;
  right: 20px;
  font-size: 22px;
}

.correct-icon {
  color: #28a745;
}

.wrong-icon {
  color: #dc3545;
}

.subjective-answer-section {
  display: flex;
  flex-direction: column;
  gap: 20px; /* 나의 답변과 예시 답안 사이 간격 */
  padding-bottom: 5px; /* 스크롤 하단 여백 */
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
  align-self: flex-start; /* 라벨 왼쪽 정렬 */
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
}

.user-answer-box {
  color: #495057;
  background-color: #f0f4f7; /* 약간 더 진한 배경색으로 구분 */
  border-color: #d1e2ed;
}

.example-answer-box {
  color: #28a745; /* 정답과 유사한 초록색 */
  background-color: #e6ffe6;
  border-color: #a8edb8;
  font-weight: 500;
}

.answer-box p {
  margin: 0;
}

/* Solution/Explanation Section */
.solution-section {
  flex-grow: 1;
  height: 250px;
  overflow-y: auto;
  box-sizing: border-box;
}

/* 풀이 섹션 내부 스크롤바 */
.solution-section::-webkit-scrollbar {
  width: 6px;
}
.solution-section::-webkit-scrollbar-track {
  background: transparent;
}
.solution-section::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
}
.solution-section::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.4);
}


.solution-title, .criteria-title {
  font-size: 20px;
  font-weight: 700;
  color: #343a40;
  margin-bottom: 15px;
}

.solution-text, .grading-criteria {
  font-size: 16px;
  line-height: 1.7;
  color: #495057;
}

.grading-criteria ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.grading-criteria li {
  margin-bottom: 12px;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 15px 20px;
  background-color: #fcfdfe;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.criteria-sub-text {
  font-size: 14px;
  color: #777;
  margin-top: 8px;
  margin-bottom: 0;
  line-height: 1.5;
}

.no-solution {
  color: #777;
  font-style: italic;
  padding: 15px 0;
  text-align: center;
}

/* Exit Button */
.exit-button-container {
  margin-top: 30px;
  text-align: left;
  flex-shrink: 0;
}

.exit-button {
  background-color: #1e2251;
  color: white;
  border: none;
  border-radius: 10px;
  padding: 12px 25px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out, transform 0.1s ease-in-out;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.exit-button:hover {
  background-color: #2c3e50;
  transform: translateY(-1px);
}

/* Chatbot Section */
.chatbot-section { /* highlight */
  grid-area: chatbot;
  width: 380px; /* 챗봇 영역 너비 380px */
  background-color: #ffffff;
  border-left: 1px solid #e9ecef;
  border-radius: 12px;
  display: flex;
  flex-direction: column; /* 챗봇 헤더, 메시지, 입력창을 수직으로 배치 */
  padding: 25px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  flex-shrink: 0;
  height: 91%; /* highlight: 부모(.page-content-wrapper)의 높이를 100% 사용 */
  overflow: auto; /* highlight: 이 영역 안에서 스크롤이 발생하도록 설정 */
  box-sizing: border-box;
}

.chatbot-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e9ecef;
  flex-shrink: 0; /* highlight: 이 영역은 내용이 늘어나도 높이가 고정되도록 */
}

.chatbot-header-icon {
  font-size: 28px;
  color: #34495e; /* 아바타 색상과 통일 */
}

.chatbot-header-text {
  font-size: 20px;
  font-weight: 700;
  color: #343a40;
}

.chatbot-messages { /* highlight */
  flex-grow: 1; /* highlight: 이 영역이 남은 공간을 모두 차지하도록 하여 메시지가 많아지면 스크롤되게 함 */
  overflow-y: auto; /* highlight: 내용이 넘치면 세로 스크롤바 생성 */
  padding-right: 10px;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
}

/* Chatbot messages scrollbar */
.chatbot-messages::-webkit-scrollbar {
  width: 6px;
}
.chatbot-messages::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}
.chatbot-messages::-webkit-scrollbar-thumb {
  background: #bbb;
  border-radius: 10px;
}
.chatbot-messages::-webkit-scrollbar-thumb:hover {
  background: #999;
}


.message {
  padding: 12px 18px;
  border-radius: 18px;
  margin-bottom: 12px;
  max-width: 85%;
  position: relative;
  word-wrap: break-word;
  line-height: 1.6;
  font-size: 15px;
}

.message p {
  margin: 0;
}

.trainee-msg {
  background-color: #daf5cf;
  align-self: flex-end;
  margin-left: auto;
  border-bottom-right-radius: 4px;
  color: #3a5c2d;
}

.bot-msg {
  background-color: #f0f2f5;
  align-self: flex-start;
  margin-right: auto;
  border-bottom-left-radius: 4px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  color: #343a40;
}

.chatbot-input-area {
  display: flex;
  align-items: center;
  padding-top: 15px;
  border-top: 1px solid #e9ecef;
  position: relative;
  flex-shrink: 0; /* highlight: 이 영역도 내용이 늘어나도 높이가 고정되도록 */
}

.message-input {
  flex-grow: 1;
  border: 1px solid #ced4da;
  border-radius: 25px;
  padding: 12px 50px 12px 20px; /* send-button과 avatar 공간 확보 */
  font-size: 15px;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.message-input:focus {
  border-color: #80bdff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.send-button {
  background: none;
  border: none;
  cursor: pointer;
  position: absolute;
  right: 65px; /* 아바타와 입력 필드 사이 간격 조절 */
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  z-index: 10; /* 입력 필드 위에 버튼이 보이도록 */
}

.send-icon {
  font-size: 26px;
  color: #888;
  transition: color 0.2s;
}

.send-icon:hover {
  color: #343a40;
}

.chatbot-avatar {
  width: 45px;
  height: 45px;
  background-color: #34495e;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 15px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
  flex-shrink: 0; /* 아바타가 축소되지 않도록 설정 */
}

.robot-icon {
  font-size: 26px;
  color: white;
  width: 1em;
  height: 1em;
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