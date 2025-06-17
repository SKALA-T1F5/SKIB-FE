<template>
  <div class="trainee-test-sidebar-content">
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
            :class="['status-indicator', { 'answered': question.isAnswered }]"
            :title="question.isAnswered ? '답변 완료' : '미답변'"
          >
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';
// SideBar 컴포넌트 임포트를 제거합니다. MainLayout이 이미 SideBar 역할을 하는 컨테이너를 제공합니다.
// import SideBar from '@/components/layouts/SideBar.vue'; // 이 줄을 제거합니다.

const props = defineProps({
  questions: Array,
  currentQuestionId: [String, null],
});

const emit = defineEmits(['selectQuestion']);

const selectQuestion = (questionId) => {
  emit('selectQuestion', questionId);
};
</script>

<style scoped>
/*
  기존 .trainee-test-sidebar 스타일은 SideBar 컴포넌트에 적용되던 것이었으므로,
  이제 MainLayout의 .sidebar-container에 의해 관리되거나,
  이 컴포넌트의 최상위 div인 .trainee-test-sidebar-content에 맞춰 조정되어야 합니다.
  MainLayout의 .sidebar-container가 이미 기본 너비와 배경색을 가지고 있으므로,
  여기서는 내부 콘텐츠의 정렬 및 간격 위주로 스타일을 유지하거나 조정합니다.
*/

.trainee-test-sidebar-content {
  /* MainLayout의 sidebar-container 안에 들어갈 콘텐츠의 스타일 */
  width: 100%; /* 부모 컨테이너(sidebar-container)에 꽉 차도록 */
  height: 100%; /* 부모 컨테이너에 꽉 차도록 */
  padding: 0; /* MainLayout의 sidebar-container에서 이미 패딩을 줬을 경우 겹치지 않게 0으로 설정하거나,
                  필요에 따라 추가 패딩을 여기에 줍니다. (현재 MainLayout은 20px 패딩) */
  box-sizing: border-box; /* 패딩이 너비/높이에 포함되도록 */
  /* min-width, min-height, font-size 등은 필요시 여기에 정의합니다.
     하지만 MainLayout의 sidebar-container가 이미 기본값을 제공하므로
     여기는 이 콘텐츠만의 고유한 스타일을 넣는 데 집중합니다. */
  font-size: 14px; /* 콘텐츠 자체의 글꼴 크기 */
}

.trainee-sidebar-inner-content {
  width: 100%;
  flex-grow: 1; /* 남은 공간을 차지하여 콘텐츠가 길어질 경우 스크롤 가능하게 합니다. */
  overflow-y: auto; /* 콘텐츠가 넘칠 경우 스크롤바 생성 */
}

.sidebar-header {
  position: relative;
  display: flex;
  align-items: center;
  padding-top: 5px;
  padding-bottom: 0px;
  margin-left: 0px; /* MainLayout의 padding을 고려하여 조정 */
  margin-right: auto;
}

.sidebar-title {
  width: 100%;
  padding: 0;
  border: none;
  outline: none;
  font-size: 18px;
  background-color: transparent;
  color: #f8f9fa;
  margin: 0;
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
  padding: 10px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s;
  color: #dee2e6;
}

.question-item-sidebar:hover {
  background-color: #707ada36;
  color: #fff;
}

.question-item-sidebar.active {
  background-color: #707ada36;
  color: #fff;
  font-weight: 600;
  border-left: 3px solid #3b82f6;
  padding-left: 9px;
}

.question-id {
  flex-grow: 1;
  margin-right: 10px;
}

.status-indicator {
  font-weight: bold;
  font-size: 12px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background-color: transparent;
  border: 1px solid #ccc;
  transition: background-color 0.2s, border-color 0.2s;
}

.status-indicator.answered {
  background-color: #ffffff;
  border-color: #ffffff;
}
</style>