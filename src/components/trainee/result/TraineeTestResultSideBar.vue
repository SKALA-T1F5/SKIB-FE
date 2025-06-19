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
          :class="[
            'status-indicator',
            {
              'status-correct': question.isCorrect === true,
              'status-wrong': question.isCorrect === false,
              'status-unanswered': question.isCorrect === undefined || question.isCorrect === null, // isCorrect가 정의되지 않았거나 null일 경우 (아직 채점되지 않거나 답변 안된 경우)
            },
          ]"
          :title="getIndicatorTitle(question)"
        >
        </span>
      </div>
    </div>
    <div v-else class="question-list-collapsed">
      <span class="collapsed-question-count">
        정답: {{ correctCount }} / 오답: {{ wrongCount }} / 총: {{ questions.length }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, computed, watch } from 'vue'

const props = defineProps({
  isCollapsed: Boolean, // MainLayout에서 전달되는 사이드바 접힘 상태
  questions: {
    type: Array,
    default: () => [],
    // isCorrect 속성을 포함하는 question 객체를 예상합니다.
    // 예시: [{ id: 'Q01', isCorrect: true }, { id: 'Q02', isCorrect: false }, ...]
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

// 정답인 문제 수 계산
const correctCount = computed(() => {
  return props.questions.filter((q) => q.isCorrect === true).length
})

// 틀린 문제 수 계산
const wrongCount = computed(() => {
  return props.questions.filter((q) => q.isCorrect === false).length
})

// 상태 표시기 툴팁 텍스트 반환
const getIndicatorTitle = (question) => {
  if (question.isCorrect === true) {
    return '정답'
  } else if (question.isCorrect === false) {
    return '오답'
  } else {
    return '미채점 또는 미답변' // isCorrect가 없거나 null/undefined인 경우
  }
}

watch(
  () => props.questions,
  (newVal) => {
    console.log('TraineeTestResultSideBar: questions updated', newVal)
  },
  { deep: true },
)

watch(
  () => props.currentQuestionId,
  (newVal) => {
    console.log('TraineeTestResultSideBar: currentQuestionId updated', newVal)
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

.question-item-sidebar.active .status-indicator {
  background-color: white; /* 활성 상태 시 상태 표시기 배경색 하얀색 */
  border-color: white; /* 활성 상태 시 상태 표시기 테두리 하얀색 */
}

/* 활성 상태에서 정답/오답 색상을 유지하도록 추가 */
.question-item-sidebar.active .status-indicator.status-correct {
  background-color: #28a745; /* 활성 & 정답 */
  border-color: #28a745;
}
.question-item-sidebar.active .status-indicator.status-wrong {
  background-color: #dc3545; /* 활성 & 오답 */
  border-color: #dc3545;
}
.question-item-sidebar.active .status-indicator.status-unanswered {
  background-color: #bbb; /* 활성 & 미채점 */
  border-color: #bbb;
}

.question-id {
  font-size: 15px;
  font-weight: 500;
  margin-right: 10px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.status-indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 1px solid; /* 테두리도 색상에 따라 변경될 수 있도록 */
  flex-shrink: 0;
  transition: all 0.2s ease;
}

/* 새로운 상태 클래스: 정답 (초록색) */
.status-indicator.status-correct {
  background-color: #28a745; /* 초록색 */
  border-color: #28a745;
}

/* 새로운 상태 클래스: 오답 (빨간색) */
.status-indicator.status-wrong {
  background-color: #dc3545; /* 빨간색 */
  border-color: #dc3545;
}

/* 새로운 상태 클래스: 미채점 또는 미답변 (회색) */
.status-indicator.status-unanswered {
  background-color: #bbb; /* 회색 */
  border-color: #bbb;
}

/* 호버 시 상태 표시기 색상 변경 (기존 로직 유지) */
.question-item-sidebar:hover .status-indicator {
  background-color: white; /* 호버 시 상태 표시기 배경색 하얀색 */
  border-color: white; /* 호버 시 상태 표시기 테두리 하얀색 */
}

/* 호버 시 정답/오답/미채점 상태는 해당 색상을 유지하도록 추가 */
.question-item-sidebar:hover .status-indicator.status-correct {
  background-color: #28a745;
  border-color: #28a745;
}
.question-item-sidebar:hover .status-indicator.status-wrong {
  background-color: #dc3545;
  border-color: #dc3545;
}
.question-item-sidebar:hover .status-indicator.status-unanswered {
  background-color: #bbb;
  border-color: #bbb;
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
