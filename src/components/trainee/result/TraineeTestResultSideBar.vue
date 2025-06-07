<!-- <template>
  <SideBar class="trainee-test-result-sidebar-wrapper">
    <div class="sidebar-header">
      <div class="sidebar-title">문제</div>
    </div>

    <ul class="question-list">
      <li
        v-for="(item, idx) in questions"
        :key="idx"
        class="question-item"
        :class="{ active: idx === currentIndex }"
        @click="goTo(idx)"
      >
        <span class="question-label">Q{{ String(idx + 1).padStart(2, '0') }}</span>
        <span class="status" :class="item.correct ? 'correct' : 'wrong'">
          {{ item.correct ? 'O' : 'X' }}
        </span>
      </li>
    </ul>
  </SideBar>
</template>

<script setup>
import SideBar from '@/components/layouts/SideBar.vue'; // 가정: SideBar.vue 경로

const props = defineProps({
  questions: Array,
  currentIndex: Number,
});

const emit = defineEmits(['select']);

const goTo = (index) => {
  emit('select', index);
};
</script>

<style scoped>
/* 이 컴포넌트에서 사용되는 SideBar 인스턴스에만 적용될 스타일 */
.trainee-test-result-sidebar-wrapper {
  width: 250px;
  min-width: 140px;
  min-height: calc(100vh - 60px); /* 헤더 높이 등을 고려한 최소 높이 */
  padding: 0; /* 내부 패딩은 하위 요소에서 관리 */
  border-top-right-radius: 40px;
  background-color: #1e2251; /* 진한 남색 배경 */
  color: white;
  box-sizing: border-box; /* 패딩, 보더 포함 너비 계산 */
  display: flex; /* 내부 콘텐츠 정렬을 위해 추가 */
  flex-direction: column; /* 내부 콘텐츠 세로 정렬 */
  overflow-y: auto; /* 내용이 넘칠 경우 스크롤 */
}

/* SideBar 컴포넌트의 내부 콘텐츠 슬롯에 직접 적용될 스타일 (필요시) */
.trainee-test-result-sidebar-wrapper :deep(.sidebar-content) {
  font-size: 13px;
  padding: 0; /* SideBar 내부 콘텐츠의 기본 패딩 재정의 */
  flex: 1; /* 남은 공간 차지 */
  display: flex;
  flex-direction: column;
}

/* 사이드바 헤더 */
.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 48px;
  padding: 10px 4px 10px 8px;
  background-color: #1e2251;
  color: white;
  font-weight: bold;
  font-size: 24px;
  position: sticky; /* 스크롤 시 상단 고정 */
  top: 0;
  z-index: 10;
  border-bottom: none; /* 하단 라인 제거 */
}

.sidebar-header::after {
  content: '';
  position: absolute;
  bottom: -7px; /* 실제 위치 조정 */
  left: 0;
  right: 0;
  height: 1px;
  background-color: rgba(255, 255, 255, 0.2); /* 구분선 */
}

.sidebar-title {
  padding-left: 8px;
}

/* 문제 목록 */
.question-list {
  flex: 1; /* 남은 공간 차지 */
  overflow-y: auto; /* 목록 내용이 넘칠 경우 스크롤 */
  padding: 8px 0;
  margin: 0;
  list-style: none; /* 기본 리스트 스타일 제거 */
  width: 100%;
}

.question-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  font-size: 14px;
  border-radius: 8px;
  margin: 4px 8px;
  cursor: pointer;
  color: white;
  transition: background-color 0.2s;
}

.question-item.active {
  background-color: rgba(255, 255, 255, 0.15); /* 선택된 항목 배경색 */
}

.question-item:hover {
  background-color: rgba(255, 255, 255, 0.1); /* 호버 시 배경색 */
}

.status {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: 20px;
  height: 20px;
  font-size: 12px;
  border-radius: 50%;
  font-weight: bold;
  line-height: 1;
}

.correct {
  background-color: #8aff8a; /* 초록색 */
  color: #000;
}

.wrong {
  background-color: #ff8a8a; /* 빨간색 */
  color: #000;
}

.question-label {
  flex: 1; /* 텍스트가 남은 공간을 차지 */
}
</style> -->