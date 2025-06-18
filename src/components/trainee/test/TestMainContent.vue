<template>
  <main class="main-content-area"
        @copy.prevent="handleCopyPaste"
        @cut.prevent="handleCopyPaste"
        @paste.prevent="handleCopyPaste"
        @contextmenu.prevent="handleContextMenu">
    <div class="test-exam-container-inner">
      <div class="top-nav">
        <div class="timer">남은 시간: {{ formattedTime }}</div>
        <h3 class="question-number-top" v-if="currentQuestion">{{ currentQuestion.id }}.</h3>
        <div class="nav-buttons-wrapper">
          <button class="nav-button" @click="$emit('goToPreviousQuestion')" :disabled="!hasPreviousQuestion">
            <svg-icon type="mdi" :path="mdiChevronLeft" class="nav-icon" /> 이전 문제
          </button>
          <button class="nav-button" @click="$emit('goToNextQuestion')" :disabled="!hasNextQuestion">
            다음 문제 <svg-icon type="mdi" :path="mdiChevronRight" class="nav-icon" />
          </button>
        </div>
      </div>

      <div class="question-area" v-if="currentQuestion">
        <QuestionDisplay
          :currentQuestion="currentQuestion"
          :getOptionLabel="getOptionLabel"
          :isExamMode="true"
          @update:userAnswer="(newValue) => $emit('update:userAnswer', newValue)"
          @selectOption="(selectedOption) => $emit('selectOption', selectedOption)"
        />
      </div>
      <div v-else class="loading-message">
        <p>시험 문제를 로딩 중입니다...</p>
      </div>

      <div class="submit-button-container">
        <button class="submit-button" @click="$emit('submitTest')">시험 제출하기</button>
      </div>
    </div>
  </main>
</template>

<script setup>
import { defineProps, defineEmits, ref, onMounted, onUnmounted, computed } from 'vue';
import SvgIcon from '@jamescoyle/vue-icon';
import { mdiChevronLeft, mdiChevronRight } from '@mdi/js';
import QuestionDisplay from '@/components/trainee/result/QuestionDisplay.vue';
// import { QuestionData } from '@/views/trainee/TraineeTestLayout.vue'; // TypeScript 타입 정의 제거

const props = defineProps({
  currentQuestion: Object, // QuestionData | null 대신 Object
  hasPreviousQuestion: Boolean,
  hasNextQuestion: Boolean,
  getOptionLabel: Function, // (index: number) => string 대신 Function
  isExamMode: Boolean,
  isExamActive: Boolean, // 시험 활성 상태를 받는 prop 추가
});

const emit = defineEmits(['goToPreviousQuestion', 'goToNextQuestion', 'submitTest', 'update:userAnswer', 'selectOption']);

// 타이머 관련 로직
const timeRemaining = ref(3600); // 60분 (3600초)
let timerInterval; // number | undefined 대신 선언만

const formattedTime = computed(() => {
  const minutes = Math.floor(timeRemaining.value / 60);
  const seconds = timeRemaining.value % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
});

const startTimer = () => {
  timerInterval = setInterval(() => {
    if (timeRemaining.value > 0) {
      timeRemaining.value--;
    } else {
      clearInterval(timerInterval);
      alert('시험 시간이 종료되었습니다!');
      // TODO: 시험 자동 제출 로직 추가
      emit('submitTest'); // 시간 종료 시 자동 제출
    }
  }, 1000);
};

// 복사/붙여넣기 및 우클릭 방지 핸들러
const handleCopyPaste = (event) => { // event: Event 제거
  if (props.isExamActive) { // 시험이 활성 상태일 때만 작동
    event.preventDefault();
    alert('시험 중에는 복사 및 붙여넣기를 할 수 없습니다.');
  }
};

const handleContextMenu = (event) => { // event: Event 제거
  if (props.isExamActive) { // 시험이 활성 상태일 때만 작동
    event.preventDefault();
  }
};

onMounted(() => {
  startTimer();
});

onUnmounted(() => {
  if (timerInterval) {
    clearInterval(timerInterval);
  }
});
</script>

<style scoped>
.main-content-area {
  grid-area: main-content;
  display: flex;
  flex-direction: column;
  padding: 25px; /* 기본 패딩 유지 */
  overflow: hidden;
  box-sizing: border-box;
  position: relative;
  min-height: 0;

  /* 중앙 정렬을 위한 조정: 부모 (page-content-wrapper)에서 justify-content: center; align-items: center; */
  /* 이 컴포넌트 자체는 flex-grow: 1을 유지하며 내부 컨텐츠를 중앙에 배치하도록 합니다. */
  background-color: #ffffff; /* 배경색 추가 */
  border-radius: 12px; /* 모서리 둥글게 */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); /* 그림자 효과 */

  /* 크기 조정 및 사이드바에 붙이기 */
  max-width: 900px; /* 최대 너비 설정 */
  width: 95%; /* 부모의 95% 너비 사용 */
  height: 95%; /* 부모의 95% 높이 사용 */
  margin: auto; /* 상하좌우 중앙 정렬 */
}

.test-exam-container-inner {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  padding: 20px; /* 내부 컨텐츠 패딩 */
}

/* Top Navigation */
.top-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  flex-shrink: 0;
}

/* 남은 시간 타이머 스타일 */
.timer {
  font-size: 20px; /* 크기 약간 줄임 */
  font-weight: bold;
  color: #d9534f;
  background-color: #ffe0e0;
  padding: 6px 12px; /* 패딩 약간 줄임 */
  border-radius: 6px; /* 둥글기 약간 줄임 */
  display: inline-block;
  min-width: 100px; /* 최소 너비 조정 */
  text-align: center;
  margin-right: 15px; /* 이전 문제 버튼과의 간격 조정 */
}

/* 문제 번호 크기 조정 */
.question-number-top {
  font-size: 28px; /* 문제 번호를 약간 줄임 */
  font-weight: 700;
  color: #343a40;
  margin: 0 auto; /* 중앙 정렬 */
  flex-grow: 1; /* 남은 공간을 차지하여 버튼들을 오른쪽으로 밈 */
  text-align: center; /* 문제 번호 중앙 정렬 */
}

.nav-buttons-wrapper {
  display: flex;
  gap: 10px; /* 버튼 간격 약간 줄임 */
  flex-shrink: 0;
}

.nav-button {
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 6px; /* 둥글기 약간 줄임 */
  padding: 8px 15px; /* 패딩 약간 줄임 */
  cursor: pointer;
  display: flex;
  align-items: center;
  font-size: 14px; /* 글자 크기 약간 줄임 */
  font-weight: 500;
  color: #495057;
  transition: all 0.2s ease-in-out;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05); /* 그림자 약간 줄임 */
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
  font-size: 18px; /* 아이콘 크기 약간 줄임 */
  margin: 0 4px; /* 마진 약간 줄임 */
  color: #6c757d;
}
.nav-button:hover:not(:disabled) .nav-icon {
  color: #495057;
}

/* Question Area - 화면에 꽉 차게 조정 */
.question-area {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  min-height: 0;
  overflow-y: auto;
  padding-right: 10px;
  margin-bottom: 20px; /* 제출 버튼과의 간격 */
}

/* QuestionDisplay 컴포넌트 내부 스크롤바 스타일 */
.question-area::-webkit-scrollbar {
  width: 8px;
}
.question-area::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}
.question-area::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 10px;
}
.question-area::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* Submit Button */
.submit-button-container {
  margin-top: auto; /* 하단에 고정 */
  text-align: right;
  flex-shrink: 0;
}

.submit-button {
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 25px; /* 패딩 약간 줄임 */
  font-size: 16px; /* 글자 크기 약간 줄임 */
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out, transform 0.1s ease-in-out;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* 그림자 약간 줄임 */
}

.submit-button:hover {
  background-color: #0056b3;
  transform: translateY(-1px);
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