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
            :class="['status-indicator', { 'answered': question.isAnswered }]"
            :title="question.isAnswered ? '답변 완료' : '미답변'"
          >
            </span>
        </div>
      </div>
    </div>
  </SideBar>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';
import SideBar from '@/components/layouts/SideBar.vue';

interface QuestionDataForSidebar {
  id: string;
  type: 'OBJECTIVE' | 'SUBJECTIVE';
  difficulty_level: 'EASY' | 'NORMAL' | 'HARD';
  questionText: string;
  options: string[] | null;
  explanation: string;
  gradingCriteria: any[] | null;
  document_id: number;
  tags: string[];
  isAnswered: boolean;
}

const props = defineProps<{
  questions: QuestionDataForSidebar[];
  currentQuestionId: string | null;
}>();

const emit = defineEmits(['selectQuestion']);

const selectQuestion = (questionId: string) => {
  emit('selectQuestion', questionId);
};
</script>

<style scoped>
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
  padding-top: 5px;
  padding-bottom: 0px;
  margin-left: 15px;
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
  background-color: transparent; /* 기본은 투명 */
  border: 1px solid #ccc; /* 테두리 추가 */
  transition: background-color 0.2s, border-color 0.2s;
}

.status-indicator.answered {
  background-color: #ffffff; /* 답변 완료 시 흰색으로 채움 */
  border-color: #ffffff; /* 테두리도 흰색으로 */
}
</style>