<template>
  <SideBar>
    <div class="trainee-sidebar-inner-content">
      <div class="search-container">
        <svg-icon type="mdi" :path="mdiMagnify" class="search-icon" />
        <input
          type="text"
          :value="searchQuery"
          @input="updateSearchQuery"
          placeholder="테스트 이름을 검색하세요..."
          class="search-input"
        />
        <svg-icon type="mdi" :path="mdiRefresh" class="refresh-icon" @click="resetFilters" />
      </div>

      <hr class="divider" />

      <div class="filter-section">
        <div class="filter-title">응시 여부</div>
        <label><input type="checkbox" :checked="statusFilters.done" @change="updateStatusFilter('done', $event)" /> 응시 완료</label>
        <label><input type="checkbox" :checked="statusFilters.retry" @change="updateStatusFilter('retry', $event)" /> 재응시 가능</label>
      </div>

      <div class="filter-section">
        <div class="filter-title">결과</div>
        <label><input type="checkbox" :checked="resultFilters.pass" @change="updateResultFilter('pass', $event)" /> PASS</label>
        <label><input type="checkbox" :checked="resultFilters.fail" @change="updateResultFilter('fail', $event)" /> FAIL</label>
      </div>
    </div>
  </SideBar>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import SvgIcon from '@jamescoyle/vue-icon';
import { mdiMagnify, mdiRefresh } from '@mdi/js';
import SideBar from '@/components/layouts/SideBar.vue';

// Props 정의: TraineeMain.vue로부터 값을 받음
const props = defineProps<{
  searchQuery: string;
  // statusFilters에 'retry' 다시 추가
  statusFilters: { done: boolean; retry: boolean };
  resultFilters: { pass: boolean; fail: boolean };
}>();

// Emits 정의: TraineeMain.vue로 변경 사항을 알림
const emit = defineEmits<{
  (e: 'update:searchQuery', value: string): void;
  // update:statusFilters에 'retry' 다시 추가
  (e: 'update:statusFilters', value: { done: boolean; retry: boolean }): void;
  (e: 'update:resultFilters', value: { pass: boolean; fail: boolean }): void;
  (e: 'reset-filters'): void; // 필터 초기화 이벤트
}>();

// 검색 쿼리 업데이트
const updateSearchQuery = (event: Event) => {
  emit('update:searchQuery', (event.target as HTMLInputElement).value);
};

// 응시 여부 필터 업데이트
const updateStatusFilter = (key: 'done' | 'retry', event: Event) => { // key 타입 다시 명확화
  const newStatusFilters = { ...props.statusFilters, [key]: (event.target as HTMLInputElement).checked };
  emit('update:statusFilters', newStatusFilters);
};

// 결과 필터 업데이트
const updateResultFilter = (key: keyof typeof props.resultFilters, event: Event) => {
  const newResultFilters = { ...props.resultFilters, [key]: (event.target as HTMLInputElement).checked };
  emit('update:resultFilters', newResultFilters);
};

// 필터 초기화
const resetFilters = () => {
  emit('reset-filters');
};
</script>

<style scoped>
/*
  SideBar.vue에서 기본 레이아웃 스타일을 제공하므로,
  여기서는 TraineeMainSideBar 고유의 스타일만 정의합니다.
  너비와 패딩 등 SideBar.vue의 기본값을 오버라이드할 수 있습니다.
*/

/* SideBar.vue의 .sidebar 스타일을 오버라이드하는 경우 */
/* 이 부분은 SideBar.vue의 구현에 따라 필요할 수도 아닐 수도 있습니다.
    만약 TraineeMainSideBar의 너비를 이 컴포넌트에서 강제한다면 유용합니다. */
.sidebar {
  width: 180px; /* TraineeMainSideBar에 필요한 너비로 오버라이드 */
  padding: 16px; /* TraineeMainSideBar에 필요한 패딩으로 오버라이드 */
  border-top-right-radius: 40px; /* 사이드바 상단 오른쪽 둥근 모서리 */
  min-width: 140px; /* 최소 너비 */
  min-height: calc(100vh - 60px); /* 최소 높이 */
}

/* SideBar.vue의 .sidebar-content 스타일을 오버라이드하는 경우 */
/* 이 부분도 SideBar.vue의 구현에 따라 달라질 수 있습니다. */
.sidebar-content {
  font-size: 13px; /* TraineeMainSideBar에 필요한 글꼴 크기 */
  /* 필요에 따라 추가적인 오버라이드 스타일 */
}

/* 기존 TraineeSideBar 고유의 스타일은 유지 */
.trainee-sidebar-inner-content {
  /* SideBar 컴포넌트의 슬롯으로 들어가는 컨텐츠의 자체적인 여백 조절이 필요한 경우 여기에 추가 */
  width: 100%;
}

.search-container {
  position: relative;
  display: flex;
  align-items: center;
  margin-bottom: 12px; /* 이전 12px에서 늘림 */
  margin-top: 8px;
  padding: 8px; /* 내부 여백 추가 */
  width: 80%; /* 너비를 약간 줄여 좌우 여백 확보 */
  height: 6%;
  margin-left: 2px;
  margin-right: auto;
  border-radius: 4px;
  background-color: #ffffff; /* 배경색 유지 */
}

.search-icon {
  position: absolute;
  left: 5px; /* 왼쪽 여백 증가 */
  color: #888;
  height: 18px;
  z-index: 2;
}

.refresh-icon {
  position: absolute;
  right: 10px; /* 오른쪽 여백 증가 */
  color: #ccc;
  height: 18px;
  cursor: pointer;
  transition: transform 0.3s ease;
  z-index: 2;
}
.refresh-icon:hover {
  transform: rotate(180deg);
  color: rgb(153, 153, 153);
}

.search-input {
  width: 100%; /* 부모 컨테이너에 꽉 채우도록 설정 */
  padding: 5px 25px; /* 좌우 패딩 증가시켜 아이콘과 텍스트 간 간격 확보 */
  border: none;
  outline: none;
  font-size: 14px; /* 폰트 크기 약간 증가 */
  background-color: transparent; /* search-container 배경색 사용 */
}

.divider {
  border: 0;
  border-top: 1px solid #aaa;
  margin: 15px 0; /* 위아래 간격 늘림 */
}

.filter-section {
  margin-top: 15px; /* 위 간격 늘림 */
  display: flex;
  flex-direction: column;
  gap: 8px; /* 내부 요소 간 간격 늘림 */
}

.filter-title {
  font-weight: bold;
  font-size: 16px; /* 폰트 크기 약간 증가 */
  margin-bottom: 6px; /* 아래 간격 늘림 */
}

/* 체크박스 스타일 */
.filter-section label {
  display: flex;
  align-items: center;
  gap: 8px;
  color: white;
  font-size: 13px;
  cursor: pointer;
}

.filter-section input[type="checkbox"] {
  /* 기본 체크박스 숨기기 또는 스타일 초기화 */
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border: 1px solid #bbb; /* 테두리 색상 */
  border-radius: 3px;
  background-color: #f0f0f0; /* 배경색 */
  cursor: pointer;
  position: relative;
  outline: none;
}

.filter-section input[type="checkbox"]:checked {
  background-color: #007bff; /* 체크 시 파란색 배경 */
  border-color: #007bff;
}

.filter-section input[type="checkbox"]:checked::after {
  content: '✔'; /* 체크 표시 */
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 12px;
  line-height: 1;
}
</style>