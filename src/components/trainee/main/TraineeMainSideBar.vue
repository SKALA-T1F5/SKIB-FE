<template>
  <SideBar class="trainee-main-specific-sidebar">
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
  statusFilters: { done: boolean; retry: boolean };
  resultFilters: { pass: boolean; fail: boolean };
}>();

// Emits 정의: TraineeMain.vue로 변경 사항을 알림
const emit = defineEmits<{
  (e: 'update:searchQuery', value: string): void;
  (e: 'update:statusFilters', value: { done: boolean; retry: boolean }): void;
  (e: 'update:resultFilters', value: { pass: boolean; fail: boolean }): void;
  (e: 'reset-filters'): void; // 필터 초기화 이벤트
}>();

// 검색 쿼리 업데이트
const updateSearchQuery = (event: Event) => {
  emit('update:searchQuery', (event.target as HTMLInputElement).value);
};

// 응시 여부 필터 업데이트
const updateStatusFilter = (key: 'done' | 'retry', event: Event) => {
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
  SideBar 컴포넌트 자체의 스타일을 오버라이드하지 않고,
  이 컴포넌트가 렌더링될 때 적용될 스타일을 정의합니다.
*/

/* SideBar 컴포넌트에 직접 적용되는 클래스 */
.trainee-main-specific-sidebar {
  /* TraineeMainSideBar에 필요한 너비와 패딩을 여기에 정의합니다. */
  /* SideBar 컴포넌트의 props나 슬롯을 통해 스타일을 제어하는 것이 더 좋습니다. */
  /* 예: <SideBar :width="180px" :padding="16px"> */
  width: 180px; /* TraineeMainSideBar에 필요한 너비 */
  padding: 16px; /* TraineeMainSideBar에 필요한 패딩 */
  border-top-right-radius: 40px; /* 사이드바 상단 오른쪽 둥근 모서리 */
  min-width: 140px; /* 최소 너비 */
  min-height: calc(100vh - 60px); /* 최소 높이 */
  font-size: 14px; /* TraineeMainSideBar에 필요한 글꼴 크기 */
}

/* 기존 TraineeSideBar 고유의 스타일은 유지 */
.trainee-sidebar-inner-content {
  width: 100%;
}

.search-container {
  position: relative;
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  margin-top: 8px;
  padding: 8px;
  width: 80%;
  height: 6%;
  margin-left: 2px;
  margin-right: auto;
  border-radius: 4px;
  background-color: #ffffff;
}

.search-icon {
  position: absolute;
  left: 5px;
  color: #888;
  height: 18px;
  z-index: 2;
}

.refresh-icon {
  position: absolute;
  right: 10px;
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
  width: 100%;
  padding: 5px 25px;
  border: none;
  outline: none;
  font-size: 14px;
  background-color: transparent;
}

.divider {
  border: 0;
  border-top: 1px solid #aaa;
  margin: 15px 0;
}

.filter-section {
  margin-top: 15px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-title {
  font-weight: bold;
  font-size: 16px;
  margin-bottom: 6px;
}

.filter-section label {
  display: flex;
  align-items: center;
  gap: 8px;
  color: white;
  font-size: 13px;
  cursor: pointer;
}

.filter-section input[type="checkbox"] {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border: 1px solid #bbb;
  border-radius: 3px;
  background-color: #f0f0f0;
  cursor: pointer;
  position: relative;
  outline: none;
}

.filter-section input[type="checkbox"]:checked {
  background-color: #007bff;
  border-color: #007bff;
}

.filter-section input[type="checkbox"]:checked::after {
  content: '✔';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 12px;
  line-height: 1;
}
</style>