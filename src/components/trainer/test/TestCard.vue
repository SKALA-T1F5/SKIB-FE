<template>
  <v-card class="test-card-trainer" elevation="0">
    <div class="test-card-header">
      <h3 class="test-title">{{ test.name }}</h3>
      <v-icon size="18" color="#191d5a" @click.stop="copyLink(test.id)">mdi-link-variant</v-icon>
    </div>

    <p class="test-description">
      난이도: <span class="difficulty-level">{{ test.difficulty }}</span>
    </p>
    <p class="test-description">제한 시간: {{ test.timeLimit }}분</p>
    <p class="test-description">합격 기준 점수: {{ test.passingScore }}점</p>
    <p class="test-description">생성일: {{ formattedCreatedAt }}</p>
    <p class="test-description">재응시 여부: {{ test.retakeable ? '가능' : '불가능' }}</p>

    <div class="statistics-visual-section">
      <div class="visual-item">
        <div class="progress-bar-label">
          <span class="visual-label">합격률</span>
          <span class="visual-value"
            >{{ test.passCount }}명 / {{ test.totalApplicants }}명 ({{ passRatePercentage }}%)</span
          >
        </div>
        <div class="progress-bar-container">
          <div class="progress-bar primary-bar" :style="{ width: passRatePercentage + '%' }"></div>
        </div>
      </div>
      <div class="visual-item">
        <div class="progress-bar-label">
          <span class="visual-label">평균 점수</span>
          <span class="visual-value">{{ test.averageScore }}점</span>
        </div>
        <div class="progress-bar-container">
          <div class="progress-bar primary-bar" :style="{ width: test.averageScore + '%' }"></div>
        </div>
      </div>
    </div>

    <div class="test-footer-trainer">
      <button class="action-button-trainer primary-button" @click="goToQuestions(test.id)">
        <v-icon size="18" class="mr-1">mdi-format-list-bulleted</v-icon> 문제목록
      </button>
      <button class="action-button-trainer primary-button" @click="goToDashboard(test.id)">
        <v-icon size="18" class="mr-1">mdi-chart-line</v-icon> 응시현황
      </button>
      <button class="action-button-trainer delete-button" @click="confirmDelete(test.id)">
        <v-icon size="18" class="mr-1">mdi-delete</v-icon> 삭제
      </button>
    </div>
  </v-card>
</template>

<script setup>
import { defineProps, defineEmits, computed } from 'vue'

const props = defineProps({
  test: {
    type: Object,
    required: true,
    default: () => ({
      id: null,
      name: '새 테스트',
      difficulty: 'NORMAL', // EASY, NORMAL, HARD 중 하나
      timeLimit: 0,
      passingScore: 0,
      createdAt: 'yyyy-mm-dd', // 이 형식으로 들어올 것을 가정합니다.
      retakeable: false,
      passCount: 0,
      totalApplicants: 0,
      averageScore: 0,
      token: null, // testLinkToken 추가
    }),
  },
})

// 'delete-test' 이벤트 추가
const emit = defineEmits(['copy-link', 'go-to-questions', 'go-to-dashboard', 'delete-test'])

// testId만 전달하도록 변경 (상위 컴포넌트에서 API 호출)
const copyLink = (id) => {
  emit('copy-link', id)
}

const goToQuestions = (id) => {
  emit('go-to-questions', id)
}

const goToDashboard = (id) => {
  emit('go-to-dashboard', id)
}

// 삭제 확인 및 이벤트 발생 함수
const confirmDelete = (id) => {
  if (confirm('정말로 이 테스트를 삭제하시겠습니까? 관련 데이터도 함께 삭제됩니다.')) {
    emit('delete-test', id)
  }
}

// 합격률 계산
const passRatePercentage = computed(() => {
  if (props.test.totalApplicants === 0) return 0
  return ((props.test.passCount / props.test.totalApplicants) * 100).toFixed(0)
})

// formattedCreatedAt computed 속성 추가
const formattedCreatedAt = computed(() => {
  if (!props.test.createdAt) {
    return '' // test.createdAt이 없을 경우 빈 문자열 반환
  }
  const dateParts = props.test.createdAt.split('-') // "YYYY-MM-DD"를 "-" 기준으로 분리
  if (dateParts.length === 3) {
    const year = dateParts[0]
    const month = dateParts[1]
    const day = dateParts[2]
    return `${year}년 ${month}월 ${day}일`
  }
  return props.test.createdAt // 형식이 맞지 않을 경우 원본 반환
})
</script>

<style scoped>
/* 기존 스타일 유지 */
.test-card-trainer {
  background-color: #f8f8f8;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 25px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 100%; /* 카드가 부모 컨테이너의 전체 너비를 사용하도록 설정 */
  height: 100%;
  min-height: 380px;
  flex-grow: 1;
  flex-shrink: 1;
  flex-basis: auto;
}

.test-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.test-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin: 0;
  white-space: nowrap; /* 제목이 한 줄로 유지되도록 */
  overflow: hidden; /* 넘치는 부분 숨김 */
  text-overflow: ellipsis; /* 숨겨진 부분은 말줄임표로 표시 */
  max-width: calc(100% - 30px); /* 아이콘을 위한 공간 확보 */
}

.test-description {
  font-size: 14px;
  color: #555;
  margin-bottom: 4px;
  white-space: normal; /* 설명 텍스트는 길이가 길어지면 자동으로 줄바꿈되도록 */
  word-break: break-word; /* 긴 단어가 잘릴 경우 강제로 줄바꿈 */
}

.difficulty-level {
  font-weight: bold;
  color: #191d5a;
}

.statistics-visual-section {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 15px;
  padding: 15px;
  background-color: #eef2f7;
  border-radius: 6px;
  margin-top: 15px;
  margin-bottom: 20px;
}

.visual-item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  gap: 8px;
}

.progress-bar-label {
  display: flex;
  justify-content: space-between;
  width: 100%;
  align-items: flex-end;
  /* 텍스트가 너무 길어 한 줄에 다 안 들어갈 경우 자동으로 줄바꿈 */
  flex-wrap: wrap; /* 추가: 레이블과 값 사이 공간 부족 시 줄바꿈 허용 */
}

.visual-label {
  font-size: 13px;
  color: #777;
  margin-bottom: 0;
  /* 길이에 따라 레이블이 너무 작아지지 않도록 최소 너비 설정 (선택 사항) */
  /* min-width: 50px; */
}

.visual-value {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  /* 값이 너무 길어 한 줄에 안 들어갈 경우 줄바꿈 허용 */
  white-space: normal;
  word-break: break-all; /* 긴 숫자나 단어가 잘릴 경우 강제로 줄바꿈 */
}

.progress-bar-container {
  width: 100%;
  height: 8px;
  background-color: #ddd;
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  border-radius: 4px;
  transition: width 0.5s ease-out;
}

.progress-bar.primary-bar {
  background-color: #191d5a;
}

.test-footer-trainer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  gap: 8px;
  flex-wrap: wrap; /* 버튼들이 공간 부족 시 다음 줄로 이동 */
}

.action-button-trainer {
  /* flex-basis를 auto로 설정하여 콘텐츠 크기(텍스트 길이)에 따라 기본 너비 결정. */
  /* flex-grow와 flex-shrink는 여전히 작동하여 남는 공간을 채우거나 줄어들 수 있음. */
  flex: 1 1 auto;
  min-width: 100px; /* 버튼의 최소 너비. 텍스트가 아무리 짧아도 이보다 작아지지 않음 */
  max-width: 100%; /* 버튼이 너무 넓어지는 것을 방지 */
  background-color: #e0e0e0;
  color: #555;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 8px 10px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap; /* 버튼 내부 텍스트는 한 줄로 유지 (베트남어가 길 경우 문제가 될 수 있음) */
}

/* 화면 너비가 600px 이하일 때 버튼이 두 개씩 한 줄에 배치되도록 조정 */
@media (max-width: 600px) {
  .action-button-trainer {
    /* 50%에서 gap의 절반을 빼주는 calc. 8px gap의 경우 4px */
    flex-basis: calc(50% - 4px);
    max-width: calc(50% - 4px); /* 50% 이상 늘어나지 않도록 명시적 설정 */
  }
}

/* 화면 너비가 400px 이하일 때 버튼이 한 줄에 하나씩 배치되도록 조정 */
@media (max-width: 400px) {
  .action-button-trainer {
    flex-basis: 100%; /* 각 버튼이 한 줄을 전부 차지 */
    max-width: 100%;
  }
}

.action-button-trainer:hover {
  background-color: #d0d0d0;
  border-color: #b0b0b0;
}

.action-button-trainer.primary-button {
  background-color: #191d5a;
  color: white;
  border-color: #191d5a;
}

.action-button-trainer.primary-button:hover {
  background-color: #0c0f3c;
  border-color: #0c0f3c;
}

.action-button-trainer.delete-button {
  background-color: #adadad;
  color: white;
  border-color: #adadad;
}

.action-button-trainer.delete-button:hover {
  background-color: #c62828;
  border-color: #c62828;
}

.action-button-trainer .v-icon {
  margin-right: 5px;
}
</style>
