<template>
  <div class="trainee-test-result-page">
    <Header /> 

    <div class="page-content-wrapper">
      <aside class="sidebar-area">
        <TraineeTestResultSideBar
          :questions="questionStatus"
          :currentIndex="currentQuestion"
          @select="(index) => currentQuestion = index"
        />
      </aside>

      <main class="main-content-area">
        <div class="layout-grid">
          <div class="question-number">Q{{ currentQuestion + 1 }}.</div>
          <div class="nav-buttons">
            <button @click="goToPrev" :disabled="currentQuestion === 0">◀ 이전</button>
            <button @click="goToNext" :disabled="currentQuestion === questions.length - 1">다음 ▶</button>
          </div>

          <div class="main-content" v-if="current">
            <div class="question-section">
              <div class="question-text-area">
                <p class="question-text">{{ current.content }}</p>
              </div>

              <div
                class="answer-boxes"
                :class="{
                  'objective-type': current.type === 'objective',
                  'subjective-type': current.type === 'subjective',
                }"
              >
                <div v-if="current.type === 'objective'" class="options">
                  <div v-for="(opt, index) in current.options" :key="index" class="option-wrapper">
                    <div
                      class="option"
                      :class="{
                        // 정답은 항상 하이라이트
                        correct: index === current.correctAnswerIndex,
                        // 사용자가 선택한 답이면서 오답일 경우 표시 (초록색 외 빨간색 등)
                        // 현재는 선택한 답과 정답이 다를 경우 기본 스타일 유지
                        'user-selected-wrong': index === current.userAnswerIndex && index !== current.correctAnswerIndex
                      }"
                    >
                      <span
                        class="option-circle"
                        :class="{
                          selected: index === current.userAnswerIndex // 사용자가 선택한 답
                        }"
                      ></span>
                      <span class="option-text">{{ optionLabels[index] }} {{ opt }}</span>
                    </div>
                  </div>
                </div>

                <div v-else-if="current.type === 'subjective'" class="subjective-answer">
                  <div class="option subjective-box">
                    <span class="option-text full">
                      <p class="label">나의 응답</p>
                      <p>{{ current.userAnswer }}</p>
                    </span>
                  </div>
                  <div class="option subjective-box">
                    <span class="option-text full">
                      <p class="label">예시 답안</p>
                      <p class="reference-answer">{{ current.correctAnswer }}</p>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div class="solution-section">
              <template v-if="current.type === 'objective'">
                <p class="label">풀이</p>
                <div class="solution-box">
                  <p class="text">{{ current.explanation }}</p>
                </div>
              </template>
              <template v-else-if="current.type === 'subjective' && current.gradingCriteria && current.gradingCriteria.length > 0">
                <p class="label">채점 기준</p>
                <ul class="grading-list">
                  <li v-for="(item, i) in current.gradingCriteria" :key="i">• {{ item }}</li>
                </ul>
              </template>
              <template v-else-if="current.explanation">
                <p class="label">해설</p>
                <div class="solution-box">
                  <p class="text">{{ current.explanation }}</p>
                </div>
              </template>
            </div>
          </div>

          <div class="chat-column">
            <div class="chat-grid">
              <div class="chat-box">
                <div class="chat-message trainee">Trainee Msg</div>
                <div class="chat-message assistant">Trainee Assistance</div>
              </div>
              <div class="chat-input">
                <input placeholder="메시지를 입력하세요." />
                <button class="send-button">➤</button>
              </div>
            </div>
          </div>

          <div class="exit-button-area">
            <button class="exit-button" @click="handleExit">나가기</button>
          </div>
          <div class="robot-icon">🤖</div>
        </div>
      </main>
    </div>

    <Footer />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
// DefaultLayout은 사용하지 않으므로 임포트에서 제거합니다.
// import DefaultLayout from '@/layouts/DefaultLayout.vue'; 
// 현재 프로젝트의 Header와 Footer 컴포넌트 경로를 정확하게 지정합니다.
import Header from '@/components/layouts/Header.vue'; // 현재 프로젝트의 Header 경로
import Footer from '@/components/layouts/Footer.vue'; // 현재 프로젝트의 Footer 경로
import TraineeTestResultSideBar from '@/components/layouts/sidebar/TraineeTestResultSideBar.vue'; 

interface Question {
  questionId: number;
  testId: number;
  type: 'objective' | 'subjective';
  content: string;
  options?: string[];
  correctAnswer: string | number;
  userAnswer: string | number;
  correctAnswerIndex?: number;
  userAnswerIndex?: number;
  explanation?: string;
  gradingCriteria?: string[];
  isCorrect: boolean;
}

const route = useRoute();
const router = useRouter();

const testId = ref<number | null>(null);
const currentQuestion = ref(0);
const questions = ref<Question[]>([]);
const isLoading = ref(true);

const optionLabels = ['①', '②', '③', '④', '⑤'];

const current = computed(() => questions.value[currentQuestion.value] || null);

const questionStatus = computed(() =>
  questions.value.map((q, index) => ({
    questionNum: index + 1,
    isCorrect: q.isCorrect,
    isCurrent: index === currentQuestion.value
  }))
);

const goToPrev = () => {
  if (currentQuestion.value > 0) {
    currentQuestion.value--;
  }
};

const goToNext = () => {
  if (currentQuestion.value < questions.value.length - 1) {
    currentQuestion.value++;
  }
};

const handleExit = () => {
  router.push({ name: 'TraineeMain' });
};

onMounted(async () => {
  const id = route.params.testId as string;
  if (id) {
    testId.value = parseInt(id);
  } else {
    console.error("Test ID is missing in route params.");
    alert("테스트 ID를 찾을 수 없습니다.");
    router.push({ name: 'TraineeMain' });
    return;
  }

  try {
    const sampleResponse = [
      {
        questionId: 1, testId: testId.value, type: 'objective', content: '다음 중 Vue.js 라이프사이클 훅이 아닌 것은?',
        options: ['created', 'mounted', 'destroyed', 'unmounted'], correctAnswer: 'destroyed', correctAnswerIndex: 2,
        userAnswer: 'unmounted', userAnswerIndex: 3, explanation: 'Vue 3에서는 `destroyed` 훅이 `unmounted`로 이름이 변경되었습니다.', isCorrect: false,
      },
      {
        questionId: 2, testId: testId.value, type: 'subjective', content: '자바스크립트에서 `let`, `const`, `var`의 차이점을 설명하시오.',
        correctAnswer: '`var`는 함수 스코프를 가지며 재선언 및 재할당이 가능합니다. `let`은 블록 스코프를 가지며 재선언은 불가능하지만 재할당은 가능합니다. `const`는 블록 스코프를 가지며 재선언 및 재할당 모두 불가능합니다.',
        userAnswer: 'var는 함수 스코프, let과 const는 블록 스코프. var는 재선언 가능, let은 재할당 가능, const는 모두 불가능.',
        explanation: '각 변수 선언 키워드의 스코프 규칙과 재선언/재할당 가능 여부를 정확히 기술해야 합니다.',
        gradingCriteria: ['var의 스코프 및 재선언/재할당 설명', 'let의 스코프 및 재선언/재할당 설명', 'const의 스코프 및 재선언/재할당 설명'], isCorrect: false,
      },
      {
        questionId: 3, testId: testId.value, type: 'objective', content: 'CSS에서 요소를 수평 중앙 정렬하는 방법으로 틀린 것은?',
        options: ['text-align: center;', 'margin: 0 auto;', 'display: flex; justify-content: center;', 'vertical-align: middle;'],
        correctAnswer: 'vertical-align: middle;', correctAnswerIndex: 3,
        userAnswer: 'text-align: center;', userAnswerIndex: 0, explanation: '`vertical-align`은 인라인 요소나 테이블 셀의 수직 정렬에 사용됩니다. 블록 요소를 수평 중앙 정렬하는 데는 사용되지 않습니다.', isCorrect: false,
      },
      {
        questionId: 4, testId: testId.value, type: 'objective', content: 'Git에서 마지막 커밋 메시지를 수정하는 명령어는?',
        options: ['git rebase', 'git commit --amend', 'git merge --squash', 'git revert'],
        correctAnswer: 'git commit --amend', correctAnswerIndex: 1,
        userAnswer: 'git commit --amend', userAnswerIndex: 1,
        explanation: '`git commit --amend`는 가장 최근 커밋의 메시지나 내용을 수정할 때 사용합니다. `git rebase`는 여러 커밋을 재정렬하거나 수정할 때, `git merge --squash`는 여러 커밋을 하나로 합칠 때, `git revert`는 특정 커밋의 변경 사항을 되돌리는 새 커밋을 만들 때 사용합니다.', isCorrect: true,
      },
      {
        questionId: 5, testId: testId.value, type: 'subjective', content: 'Restful API의 주요 특징을 3가지 이상 설명하시오.',
        correctAnswer: '클라이언트-서버 구조, 스테이트리스(Stateless), 캐시 가능(Cacheable), 계층화된 시스템(Layered System), 균일한 인터페이스(Uniform Interface), 코드 온 디맨드(Code-On-Demand) (선택 사항)',
        userAnswer: '클라이언트-서버, 무상태성, 캐싱.',
        explanation: 'REST 아키텍처 스타일의 핵심 원칙들을 설명해야 합니다.',
        gradingCriteria: ['클라이언트-서버 구조 설명', '스테이트리스(Stateless) 설명', '캐시 가능(Cacheable) 설명', '균일한 인터페이스(Uniform Interface) 설명 (선택적)', '계층화된 시스템(Layered System) 설명 (선택적)'],
        isCorrect: true,
      },
    ];

    questions.value = sampleResponse.map(q => {
      let isCorrectBasedOnLogic = false;
      if (q.type === 'objective') {
        isCorrectBasedOnLogic = q.userAnswerIndex === q.correctAnswerIndex;
      } else if (q.type === 'subjective') {
        isCorrectBasedOnLogic = q.isCorrect;
      }
      return { ...q, isCorrect: isCorrectBasedOnLogic };
    });

  } catch (error) {
    console.error('테스트 결과를 불러오는 데 실패했습니다:', error);
    alert('테스트 결과를 불러오는 데 실패했습니다. 잠시 후 다시 시도해주세요.');
    router.push({ name: 'TraineeMain' });
  } finally {
    isLoading.value = false;
  }
});
</script>

<style scoped>
/* 페이지 전체 컨테이너 */
.trainee-test-result-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh; /* 뷰포트 전체 높이 사용 */
  overflow: hidden; /* 전체 페이지 overflow 관리 */
}

/* Header, Footer를 제외한 메인 컨텐츠와 사이드바를 감싸는 래퍼 */
.page-content-wrapper {
  flex: 1; /* 남은 공간을 모두 차지하여 Footer를 하단으로 밀어냄 */
  display: flex;
  width: 100%;
  overflow: hidden; /* 내부 스크롤 관리 */
}

/* 사이드바 영역 */
.sidebar-area {
  width: 250px; /* 사이드바 너비 고정 */
  flex-shrink: 0; /* 줄어들지 않도록 */
  background-color: #1e2251; /* 사이드바 배경색 */
  color: white;
  overflow-y: auto; /* 사이드바 내용이 길어지면 스크롤 */
}

/* 메인 컨텐츠 영역 */
.main-content-area {
  flex: 1; /* 남은 공간 모두 차지 */
  overflow-y: auto; /* 메인 컨텐츠 내용이 길어지면 스크롤 */
  padding: 1.5rem; /* 기존 layout-grid의 패딩 유지 */
  background-color: #f8f9fa; /* 배경색 */
}

/* 기존 layout-grid 스타일은 그대로 유지하고, main-content-area 내부에 적용 */
.layout-grid {
  display: grid;
  grid-template-areas:
    'question-number nav-buttons'
    'main-content chat-column'
    'exit-button-area robot-icon';
  grid-template-columns: 70% 30%;
  grid-template-rows: auto 1fr auto;
  gap: 0.5rem;
  height: 100%; /* 부모(main-content-area)의 높이에 맞춤 */
  box-sizing: border-box;
}

/* 나머지 기존 스타일들은 그대로 유지됩니다. */
/* 전체 그리드 레이아웃 */
.layout-grid {
  display: grid;
  grid-template-areas:
    'question-number nav-buttons'
    'main-content chat-column'
    'exit-button-area robot-icon'; /* grid-area 이름 일치 */
  grid-template-columns: 70% 30%;
  grid-template-rows: auto 1fr auto;
  gap: 0.5rem;
  /* padding: 1.5rem; 이미 main-content-area에 패딩 적용 */
  height: 100%;
  box-sizing: border-box;
}

/* 문제 번호 텍스트 */
.question-number {
  grid-area: question-number;
  font-size: 30px;
  font-weight: bold;
  color: #333;
}

/* 이전/다음 버튼 영역 */
.nav-buttons {
  grid-area: nav-buttons;
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

/* 이전/다음 버튼 스타일 */
.nav-buttons button {
  background: #eef2f6;
  color: black;
  border: none;
  border-radius: 10px;
  padding: 0.6rem 1.2rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s;
}

.nav-buttons button:hover:not(:disabled) {
  background-color: #dbe2ea;
  color: #333;
}

.nav-buttons button:disabled {
  background-color: #f0f0f0;
  color: #aaa;
  cursor: not-allowed;
}

/* 본문(문제+풀이) 전체 영역 */
.main-content {
  grid-area: main-content;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  gap: 1rem;
  overflow: hidden; /* 자식 요소 스크롤 처리를 위해 */
}

/* 문제 박스 전체 영역 */
.question-section {
  flex: 4; /* 문제 영역이 풀이 영역보다 더 많은 공간 차지 */
  display: flex;
  flex-direction: column;
  background: #eef2f6;
  border-radius: 16px;
  padding: 1.5rem;
  min-height: 0; /* flex 아이템의 최소 높이 설정 */
  overflow-y: auto; /* 내용이 길어지면 스크롤 */
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

/* 문제 텍스트 영역 (공통: 객관식/주관식 상단) */
.question-text-area {
  margin-bottom: 1rem;
  padding-right: 8px; /* 스크롤바 공간 확보 */
  flex-shrink: 0; /* 내용이 줄어도 너비 유지 */
}

/* 객관식/주관식 보기 전체 박스 */
.answer-boxes {
  flex: 4;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  min-height: 0; /* 내부 스크롤 가능하게 */
}

/* 객관식 보기 목록 wrapper */
.options {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 0.75rem;
  flex: 1; /* 남은 공간 채우기 */
  height: 100%; /* 부모의 높이 상속 */
  min-height: 0; /* 내부 스크롤 가능하게 */
  overflow-y: auto; /* 옵션이 많아지면 스크롤 */
  padding-right: 8px; /* 스크롤바 공간 확보 */
}

/* 객관식 보기 하나의 wrapper */
.option-wrapper {
  flex-shrink: 0; /* 공간이 부족해도 줄어들지 않음 */
  display: flex;
  align-items: center;
}

/* 객관식 보기 한 줄 */
.option {
  display: flex;
  align-items: center;
  background: white;
  border-radius: 12px;
  padding: 0.8rem 1rem;
  border: 1px solid #cfd6e1;
  width: 100%;
  height: 100%; /* flex-item이라 높이 필요 */
  box-sizing: border-box;
  box-shadow: 0 1px 3px rgba(0,0,0,0.03);
}

/* 정답에 해당할 경우 강조 */
.option.correct {
  background-color: #dcfce7; /* 연한 초록색 */
  border-color: #a7f3d0;
  font-weight: bold;
}

/* 사용자가 선택했으나 오답인 경우 */
.option.user-selected-wrong {
  background-color: #fee2e2; /* 연한 빨간색 */
  border-color: #fca5a5;
  font-weight: bold;
}


/* 객관식 원형 선택지 */
.option-circle {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid #cfd6e1;
  margin-right: 12px;
  background-color: white;
  flex-shrink: 0;
}

/* 선택된 보기 원형 */
.option-circle.selected {
  background-color: #3b82f6; /* 파란색 */
  border-color: #3b82f6;
}

/* 보기 텍스트 영역 */
.option-text {
  flex: 1;
  font-size: 16px;
  line-height: 1.5;
  color: #333;
}

/* 서술형 보기 wrapper (객관식과 동일한 높이 설정) */
.subjective-answer {
  flex: 1;
  display: flex;
  flex-direction: row;
  gap: 0.75rem;
  height: 100%;
  min-height: 0;
}

/* 서술형 박스 하나 */
.subjective-box {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  background: white;
  border-radius: 12px;
  padding: 0.8rem 1rem;
  border: 1px solid #cfd6e1;
  min-height: 0;
  height: 100%;
  box-shadow: 0 1px 3px rgba(0,0,0,0.03);
  overflow-y: auto; /* 내용이 길어지면 스크롤 */
}

/* 서술형 답변 영역 내 텍스트 스크롤 가능하도록 */
.option-text.full {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding-right: 8px; /* 스크롤바 공간 확보 */
  min-height: 0;
}

/* 예시 답안 강조 (파란색 굵은 글씨) */
.reference-answer {
  color: #1c4ed8;
  font-weight: bold;
}

/* 풀이/해설/채점 기준 영역 */
.solution-section {
  flex: 1; /* 문제 영역의 절반 정도 공간 차지 */
  display: flex;
  flex-direction: column;
  background: #eef2f6;
  border-radius: 16px;
  padding: 1.5rem;
  min-height: 0;
  overflow-y: auto;
  max-height: 200px; /* 이전에 주석 처리된 max-height 적용 */
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

/* 문제 텍스트의 실제 내용 */
.question-text {
  font-size: 18px;
  line-height: 1.5;
  color: #333;
}

/* "풀이", "나의 응답" 등의 텍스트 라벨 */
.label {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 0.5rem; /* 간격 조정 */
  color: #444;
}

.solution-box {
  background: white;
  border-radius: 8px;
  padding: 1rem;
  border: 1px solid #eee;
  box-shadow: inset 0 1px 3px rgba(0,0,0,0.02);
}

.solution-box .text {
  font-size: 16px;
  line-height: 1.6;
  color: #555;
}

.grading-list {
  list-style-type: none;
  padding-left: 0;
  margin: 0;
}

.grading-list li {
  font-size: 15px;
  line-height: 1.6;
  color: #555;
  margin-bottom: 0.5rem;
}


/* 챗봇 전체 영역 */
.chat-column {
  grid-area: chat-column;
  display: flex;
  height: 100%;
  overflow: hidden;
  padding-left: 0.5rem; /* 그리드 간격으로 인한 여백 추가 */
}

/* 챗봇 내부 레이아웃 */
.chat-grid {
  display: grid;
  grid-template-rows: 1fr auto;
  background: #f4f6fb;
  border-radius: 16px;
  padding: 1rem;
  width: 100%;
  height: 100%;
  max-height: calc(100vh - 240px); /* 전체 뷰포트 높이에서 헤더, 푸터 등 제외 */
  min-height: 0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

/* 챗봇 메시지 출력 영역 */
.chat-box {
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1rem;
  min-height: 0;
  max-height: 100%; /* 부모에 맞춰 스크롤 */
  padding-right: 5px; /* 스크롤바 공간 */
}

/* 챗봇 메시지 하나 */
.chat-message {
  padding: 0.8rem 1rem;
  border-radius: 10px;
  font-size: 14px;
  max-width: 85%;
  word-wrap: break-word; /* 긴 텍스트 줄바꿈 */
}

/* 학습자 메시지 말풍선 */
.chat-message.trainee {
  align-self: flex-end;
  background-color: #d1d1d1;
  color: #333;
}

/* 어시스턴트 메시지 말풍선 */
.chat-message.assistant {
  align-self: flex-start;
  background-color: #e0e7ff; /* 연한 파란색 */
  color: #333;
}

/* 챗봇 입력창 영역 */
.chat-input {
  display: flex;
  gap: 0.5rem;
}

/* 챗봇 입력창 */
.chat-input input {
  flex: 1;
  padding: 0.6rem;
  border-radius: 8px;
  border: 1px solid #ccc;
  font-size: 14px;
}

/* 전송 버튼 */
.send-button {
  background: #1c2053;
  color: white;
  border-radius: 8px;
  padding: 0.6rem 1rem;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
}

.send-button:hover {
  background-color: #2a3068;
}

/* 하단 나가기 버튼 위치 */
.exit-button-area {
  grid-area: exit-button-area; /* grid-area 이름 일치 */
  display: flex;
  justify-content: flex-start;
  align-items: center; /* 수직 중앙 정렬 */
  padding-top: 0.5rem;
}

/* 나가기 버튼 스타일 */
.exit-button {
  background: #1c2053;
  color: white;
  border: none;
  border-radius: 10px;
  padding: 0.6rem 1.2rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;
}

.exit-button:hover {
  background-color: #2a3068;
}

/* 우측 하단 로봇 이모지 */
.robot-icon {
  grid-area: robot-icon;
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;
  font-size: 28px;
  padding-top: 0.5rem;
}
</style>