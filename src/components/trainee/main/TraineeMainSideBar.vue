<template>
  <div class="trainee-main-sidebar-content">
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
</template>

<script setup>
import { ref, watch } from 'vue';
import SvgIcon from '@jamescoyle/vue-icon';
import { mdiMagnify, mdiRefresh } from '@mdi/js';
// SideBar 컴포넌트를 이곳에서 임포트할 필요가 없습니다. MainLayout이 이미 레이아웃을 제공합니다.
// import SideBar from '@/components/layouts/SideBar.vue'; // <-- 이 줄은 제거해야 합니다.

// Props 정의: TraineeMain.vue로부터 값을 받음
const props = defineProps({
  searchQuery: String,
  statusFilters: Object,
  resultFilters: Object,
});

// Emits 정의: TraineeMain.vue로 변경 사항을 알림
const emit = defineEmits([
  'update:searchQuery',
  'update:statusFilters',
  'update:resultFilters',
  'reset-filters',
]);

// 검색 쿼리 업데이트
const updateSearchQuery = (event) => {
  emit('update:searchQuery', event.target.value);
};

// 응시 여부 필터 업데이트
const updateStatusFilter = (key, event) => {
  const newStatusFilters = { ...props.statusFilters, [key]: event.target.checked };
  emit('update:statusFilters', newStatusFilters);
};

// 결과 필터 업데이트
const updateResultFilter = (key, event) => {
  const newResultFilters = { ...props.resultFilters, [key]: event.target.checked };
  emit('update:resultFilters', newResultFilters);
};

// 필터 초기화
const resetFilters = () => {
  emit('reset-filters');
};
</script>

<style scoped>
/*
  MainLayout.vue의 .sidebar-container가 공통적인 사이드바 레이아웃(너비, 배경색, border-radius 등)을 제공합니다.
  따라서 이곳에서는 이 사이드바 '콘텐츠' 자체에 필요한 스타일만 정의합니다.
  `.trainee-main-specific-sidebar` 클래스는 더 이상 SideBar 컴포넌트 자체에 적용되지 않으므로 제거합니다.
  대신, `trainee-main-sidebar-content`와 같은 클래스로 내부 콘텐츠의 스타일을 조정합니다.
*/

.trainee-main-sidebar-content {
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

/* 기존 TraineeMainSideBar 고유의 스타일은 유지 */
.search-container {
  position: relative;
  display: flex;
  align-items: center;
  margin-bottom: 6px;
  margin-top: 6px;
  width: 90%;
  height: 5%;
  min-height: 32px;
  margin-left: 2px;
  margin-right: auto;
  border-radius: 4px;
  background-color: #ffffff;
}

.search-icon {
  position: absolute;
  left: 2px;
  color: #888;
  height: 18px;
  z-index: 2;
}

.refresh-icon {
  position: absolute;
  right: 2px;
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
  height: 32px; /* 불필요하게 크지 않도록 고정된 픽셀 값으로 변경 */
  padding: 5px 30px 5px 30px; /* 상하 5px, 좌우 30px 패딩 (아이콘 공간 확보) */
  border: none;
  outline: none;
  font-size: 12px;
  background-color: transparent;
  box-sizing: border-box; /* 패딩이 너비에 포함되도록 box-sizing 추가 */
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