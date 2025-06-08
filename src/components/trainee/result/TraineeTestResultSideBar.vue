<template>
  <SideBar class="trainee-test-sidebar">
    <div class="trainee-sidebar-inner-content">
      <div class="sidebar-header">
        <h3 class="sidebar-title">문제</h3>
      </div>

      <hr class="divider" />

      <div class="question-list-wrapper">
        <div
          v-for="question in questions"
          :key="question.id"
          :class="['question-item-sidebar', { 'active': question.id === currentQuestionId }]"
          @click="selectQuestion(question.id)"
        >
          <span class="question-id">{{ question.id }}</span>
          <span
            :class="['status-indicator', { 'correct': question.isCorrect, 'wrong': !question.isCorrect && question.userAnswer !== '' }]"
          >
            {{ question.isCorrect ? 'O' : 'X' }}
          </span>
        </div>
      </div>
    </div>
  </SideBar>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';
// SvgIcon과 mdiMenu는 Figma 이미지에 현재 필요하지 않으므로 주석 처리합니다.
// import SvgIcon from '@jamescoyle/vue-icon';
// import { mdiMenu } from '@mdi/js';
import SideBar from '@/components/layouts/SideBar.vue';
import type { QuestionData } from '@/pages/trainee/TraineeTestResult.vue';

const props = defineProps<{
  questions: QuestionData[];
  currentQuestionId: string | null;
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
  color: #f8f9fa; /* 텍스트 색상을 밝게 설정 */
}

/* 기존 TraineeSideBar 고유의 스타일은 유지 */
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

.question-id {
  flex-grow: 1;
  margin-right: 10px;
}

.status-indicator {
  font-weight: bold;
  font-size: 12px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: white;

  /* === 여기에 추가 또는 수정 === */
  line-height: 1; /* 텍스트 줄 높이를 요소 높이에 맞춰서 수직 중앙 정렬 효과 개선 */
  transform: translateY(-1px); /* 필요시 미세 조정을 위해 주석으로 남겨둡니다. */
}

.status-indicator.correct {
  background-color: #2db84e;
}

.status-indicator.wrong {
  background-color: #cc3d4b;
}
</style>