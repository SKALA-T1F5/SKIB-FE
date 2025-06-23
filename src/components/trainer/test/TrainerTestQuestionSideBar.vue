<template>
  <div :class="['trainer-test-sidebar-content', { 'is-collapsed': isCollapsed }]">
    <div class="question-list-wrapper" v-if="!isCollapsed">
      <div
        v-for="question in questions"
        :key="question.id"
        :class="['question-item-sidebar', { active: question.id === currentQuestionId }]"
        @click="selectQuestion(question.id)"
      >
        <span class="question-id">{{ question.id }}</span>
      </div>
    </div>
    <div v-else class="question-list-collapsed">
      <span class="collapsed-question-count"> 총: {{ questions.length }} 문제 </span>
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
    // question 객체는 id 속성을 포함합니다.
    // 예시: [{ id: 'Q01' }, { id: 'Q02' }, ...]
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

// 개발 편의를 위한 watch (실제 배포 시에는 제거해도 무방)
watch(
  () => props.questions,
  (newVal) => {
    console.log('TrainerTestQuestionSideBar: questions updated', newVal)
  },
  { deep: true },
)

watch(
  () => props.currentQuestionId,
  (newVal) => {
    console.log('TrainerTestQuestionSideBar: currentQuestionId updated', newVal)
  },
)
</script>

<style scoped>
/* TraineeTestResultSideBar.vue의 스타일을 기반으로 수정 */
.trainer-test-sidebar-content {
  width: 100%; /* 부모 컨테이너(sidebar-container)에 꽉 차도록 */
  height: 100%; /* 부모 컨테이너에 꽉 차도록 */
  padding: 0 10px 20px 0px; /* MainLayout의 sidebar-content-slot에서 패딩을 받으므로, 이 컴포넌트의 자체 상단 패딩 제거 */
  box-sizing: border-box;
  overflow-y: auto; /* 내용이 넘칠 경우 스크롤바 생성 */
  transition: all 0.3s ease-in-out; /* 접힘/펼침 애니메이션 */
  display: flex;
  flex-direction: column;
}

.trainer-test-sidebar-content.is-collapsed {
  padding: 10px 0; /* 접혔을 때 패딩 조정 */
  align-items: center; /* 아이템들을 중앙 정렬 */
}

/* 문제 목록 섹션 */
.question-list-wrapper {
  flex-grow: 1; /* 남은 공간을 차지 */
  display: flex; /* Flexbox로 변경 */
  flex-direction: column; /* 세로로 정렬 */
  gap: 3px; /* 문제 번호 간 세로 간격 줄임 */
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
  border-left: 3px solid transparent; /* 왼쪽에 색깔 라인 추가 (기본은 투명) */
}

.question-item-sidebar:hover {
  background-color: #191d5a; /* 호버 시 배경색 적용 */
  color: white; /* 호버 시 글자색 하얀색 */
  border-left-color: #191d5a; /* 호버 시 왼쪽 라인 색상 적용 */
}

.question-item-sidebar.active {
  background-color: #191d5a; /* 활성 상태 배경색 */
  color: white; /* 활성 상태 텍스트 색상 */
  font-weight: 600;
  border-left-color: #191d5a; /* 활성 상태 시 왼쪽 라인 색상 적용 */
}

.question-id {
  font-size: 15px;
  font-weight: 500;
  margin-right: 10px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.question-list-collapsed {
  display: flex;
  flex-direction: column; /* 세로로 배치 */
  justify-content: center;
  align-items: center;
  font-size: 14px;
  color: #777;
  padding: 10px 0;
  text-align: center;
  gap: 5px; /* 각 통계 항목 사이 간격 */
}

.collapsed-question-count {
  font-weight: bold;
}
</style>