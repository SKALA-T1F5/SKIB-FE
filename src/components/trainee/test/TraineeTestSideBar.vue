<template>
  <SideBar class="trainee-test-sidebar">
    <div class="trainee-sidebar-inner-content">
      <div class="sidebar-header">
        <h3 class="sidebar-title">문제</h3>
        <p v-if="traineeName" class="trainee-name">{{ traineeName }} 님</p>
      </div>

      <hr class="divider" />

      <div class="question-list-wrapper">
        <div
          v-for="question in questions"
          :key="question.id"
          :class="['question-item-sidebar', { 'active': question.id === currentQuestionId }]"
          @click="selectQuestion(question.id)"
        >
          <span :class="['question-status-square', { 'filled': question.isAnswered }]"></span>
          <span class="question-id">{{ question.id }}</span>
          </div>
      </div>
    </div>
  </SideBar>
</template>

<script setup lang="ts">
// import { defineProps, defineEmits } from 'vue';
import SideBar from '@/components/layouts/SideBar.vue';
// QuestionData 타입의 출처를 정확히 명시해주세요.
// 예: import type { QuestionData } from '@/types/QuestionData';
// 또는 import type { QuestionData } from '@/views/trainee/TraineeTestLayout.vue'; (이전 예시에서 사용된 경로)
import type { QuestionData } from '@/views/trainee/TraineeTestLayout.vue'; // 이 경로를 사용한다고 가정합니다.

const props = defineProps<{
  questions: QuestionData[];
  currentQuestionId: string | null;
  traineeName?: string; // 응시자 이름 prop 추가, optional로 설정
}>();

const emit = defineEmits(['selectQuestion']);

const selectQuestion = (questionId: string) => {
  emit('selectQuestion', questionId);
};
</script>

<style scoped>
/* SideBar 컴포넌트에 직접 적용되는 클래스 */
.trainee-test-sidebar {
  width: 180px;
  padding: 16px;
  border-top-right-radius: 40px;
  min-width: 140px;
  min-height: calc(100vh - 60px);
  font-size: 14px;
  color: #f8f9fa;
}

.trainee-sidebar-inner-content {
  width: 100%;
}

.sidebar-header {
  position: relative;
  display: flex;
  align-items: center;
  /* 상하 패딩을 더 줄이거나 없앱니다. */
  padding-top: 5px; /* 조정: 0px보다는 약간의 여백이 자연스러울 수 있음 */
  padding-bottom: 0px; /* 조정 */
  margin-left: 15px;
  margin-right: auto;
}

.sidebar-title {
  width: 100%;
  /* padding을 제거하여 h3 자체의 상하 여백을 줄임 */
  padding: 0;
  border: none;
  outline: none;
  font-size: 18px;
  background-color: transparent;
  color: #f8f9fa; /* 제목 색상도 밝게 설정 */
  margin: 0; /* h3 기본 margin 제거 */
}

.divider {
  border: 0;
  border-top: 1px solid #aaa;
  margin: 15px 0;
}

.question-list-wrapper {
  margin-top: 15px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

/* 스크롤바 스타일 */
.question-list-wrapper::-webkit-scrollbar {
  width: 6px;
}
.question-list-wrapper::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}
.question-list-wrapper::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 10px;
}
.question-list-wrapper::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

.question-item-sidebar {
  display: flex;
  align-items: center;
  padding: 10px 12px; /* 항목별 패딩 조정 */
  border-radius: 6px; /* 모서리 둥글게 */
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s;
  color: #dee2e6; /* 기본 텍스트 색상 */
}

.question-item-sidebar:hover {
  background-color: #707ada36; /* 호버 시 배경색 */
  color: #fff;
}

.question-item-sidebar.active {
  background-color: #707ada36; /* 활성 항목 배경색 (더 진한 색) */
  color: #fff;
  font-weight: 600;
  border-left: 3px solid #3b82f6; /* 활성 항목 좌측 강조선 */
  padding-left: 9px; /* 강조선 추가로 인한 패딩 조정 */
}

/* 문제 번호 좌측에 답변 상태 표시용 사각형 스타일 */
.question-status-square {
  width: 16px; /* 사각형 크기 조정 */
  height: 16px; /* 사각형 크기 조정 */
  border: 2px solid #fff; /* 흰색 테두리 */
  border-radius: 3px; /* 약간 둥근 모서리 */
  margin-right: 10px; /* 문제 번호와의 간격 */
  flex-shrink: 0; /* 크기 고정 */
  background-color: transparent; /* 기본은 투명 */
  transition: background-color 0.2s ease, border-color 0.2s ease;
}

.question-status-square.filled {
  background-color: #2db84e; /* 답변 완료 시 채워지는 색 (녹색) */
  border-color: #2db84e; /* 채워질 때 테두리 색상도 변경 */
}


.question-id {
  flex-grow: 1; /* 문제 번호가 남은 공간을 차지하도록 */
}
</style>