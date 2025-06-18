<template>
  <div :class="['trainee-test-sidebar-content', { 'is-collapsed': isCollapsed }]">
    <div class="question-list-wrapper" v-if="!isCollapsed">
      <div
        v-for="question in questions"
        :key="question.id"
        :class="['question-item-sidebar', { active: question.id === currentQuestionId }]"
        @click="selectQuestion(question.id)"
      >
        <span class="question-id">{{ question.id }}</span>
        <span
          :class="['status-indicator', { answered: question.isAnswered }]"
          :title="question.isAnswered ? '답변 완료' : '미답변'"
        >
        </span>
      </div>
    </div>
    <div v-else class="question-list-collapsed">
      <span class="collapsed-question-count">
        {{ questions.filter((q) => q.isAnswered).length }} / {{ questions.length }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, watch } from 'vue'

const props = defineProps({
  isCollapsed: Boolean, // MainLayout에서 전달되는 사이드바 접힘 상태
  questions: {
    type: Array,
    default: () => [],
  },
  currentQuestionId: {
    type: [Number, String, null], // 현재 문제 ID (숫자 또는 문자열, null 가능)
    default: null,
  },
})

const emit = defineEmits(['selectQuestion'])

const selectQuestion = (questionId) => {
  emit('selectQuestion', questionId)
}

watch(
  () => props.questions,
  (newVal) => {
    console.log('TraineeTestSideBar: questions updated', newVal)
  },
  { deep: true },
)

watch(
  () => props.currentQuestionId,
  (newVal) => {
    console.log('TraineeTestSideBar: currentQuestionId updated', newVal)
  },
)
</script>

<style scoped>
/*
  MainLayout의 .sidebar-container가 이미 기본 너비와 배경색을 가지고 있으므로,
  여기서는 이 컴포넌트의 최상위 div인 .trainee-test-sidebar-content에 맞춰 조정되어야 합니다.
  MainLayout의 .sidebar-container가 이미 기본값을 제공하므로
  여기는 이 콘텐츠만의 고유한 스타일을 넣는 데 집중합니다.
*/

.trainee-test-sidebar-content {
  width: 100%; /* 부모 컨테이너(sidebar-container)에 꽉 차도록 */
  height: 100%; /* 부모 컨테이너에 꽉 차도록 */
  padding: 0 10px 20px 0px; /* MainLayout의 sidebar-content-slot에서 패딩을 받으므로, 이 컴포넌트의 자체 상단 패딩 제거 */
  box-sizing: border-box;
  overflow-y: auto; /* 내용이 넘칠 경우 스크롤바 생성 */
  transition: all 0.3s ease-in-out; /* 접힘/펼침 애니메이션 */
  display: flex;
  flex-direction: column;
}

.trainee-test-sidebar-content.is-collapsed {
  padding: 10px 0; /* 접혔을 때 패딩 조정 */
  align-items: center; /* 아이템들을 중앙 정렬 */
}

/* 문제 목록 섹션 */
.question-list-wrapper {
  flex-grow: 1; /* 남은 공간을 차지 */
  display: flex; /* Flexbox로 변경 */
  flex-direction: column; /* 세로로 정렬 */
  gap: 3px; /* 1. 문제 번호 간 세로 간격 줄임 */
  margin-top: 10px; /* 이제 상단에 구분선이 없으므로 margin-top 유지 또는 조정 */
}

.question-item-sidebar {
  display: flex;
  align-items: center; /* 가로 중앙 정렬 */
  justify-content: space-between; /* 번호와 상태 표시기 양 끝 정렬 */
  padding: 8px 12px; /* 패딩 조정 */
  border-radius: 6px;
  cursor: pointer;
  background-color: transparent; /* 기본 배경색 제거 */
  transition: all 0.2s ease;
  color: #333; /* 기본 텍스트 색상 */
  border-left: 3px solid transparent; /* 2. 왼쪽에 색깔 라인 추가 (기본은 투명) */
}

.question-item-sidebar:hover {
  background-color: #191d5a; /* 3. 호버 시 배경색 적용 */
  color: white; /* 3. 호버 시 글자색 하얀색 */
  border-left-color: #191d5a; /* 3. 호버 시 왼쪽 라인 색상 적용 */
}

.question-item-sidebar.active {
  background-color: #191d5a; /* 2. 활성 상태 배경색 */
  color: white; /* 2. 활성 상태 텍스트 색상 */
  font-weight: 600;
  border-left-color: #191d5a; /* 2. 활성 상태 시 왼쪽 라인 색상 적용 */
}

.question-item-sidebar.active .status-indicator {
  background-color: white; /* 2. 활성 상태 시 상태 표시기 배경색 하얀색 */
  border-color: white; /* 2. 활성 상태 시 상태 표시기 테두리 하얀색 */
}

.question-item-sidebar.active .status-indicator.answered {
  background-color: #28a745; /* 활성 상태 & 답변 완료 시 색상 (기존 초록색 유지) */
  border-color: #28a745;
}

.question-id {
  font-size: 15px; /* 글꼴 크기 약간 키움 */
  font-weight: 500; /* 볼드하게 */
  margin-right: 10px; /* 번호와 상태 표시기 간격 */
  white-space: nowrap; /* 텍스트 줄바꿈 방지 */
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 활성 상태 및 호버 시 question-id의 텍스트 색상이 부모의 white를 따르도록 제거 */
/* .question-item-sidebar.active .question-id {
  color: white;
} */
/* .question-item-sidebar:hover .question-id {
  color: white;
} */

.status-indicator {
  width: 10px; /* 원 크기 */
  height: 10px; /* 원 크기 */
  border-radius: 50%;
  background-color: #bbb; /* 미답변 기본 색상 */
  border: 1px solid #bbb;
  flex-shrink: 0; /* 크기 줄어들지 않도록 */
  transition: all 0.2s ease; /* 상태 표시기도 색상 변경 시 애니메이션 적용 */
}

.status-indicator.answered {
  background-color: #28a745; /* 답변 완료 색상 (초록색) */
  border-color: #28a745;
}

/* 호버 시 상태 표시기 색상 변경 */
.question-item-sidebar:hover .status-indicator {
  background-color: white; /* 호버 시 상태 표시기 배경색 하얀색 */
  border-color: white; /* 호버 시 상태 표시기 테두리 하얀색 */
}

.question-item-sidebar:hover .status-indicator.answered {
  background-color: #28a745; /* 호버 시 답변 완료 상태는 초록색 유지 */
  border-color: #28a745;
}

.question-list-collapsed {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 14px;
  color: #777;
  padding: 10px 0;
  text-align: center;
}

.collapsed-question-count {
  font-weight: bold;
}
</style>
