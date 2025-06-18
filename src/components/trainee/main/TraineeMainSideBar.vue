<template>
  <div class="trainee-main-sidebar-content">
    <hr v-if="!isCollapsed" class="divider" />

    <div v-if="!isCollapsed" class="filter-section">
      <div class="filter-title">응시 여부</div>
      <label>
        <input
          type="checkbox"
          :checked="statusFilters.done"
          @change="updateStatusFilter('done', $event)"
        />
        응시 완료
      </label>
      <label>
        <input
          type="checkbox"
          :checked="statusFilters.retry"
          @change="updateStatusFilter('retry', $event)"
        />
        재응시 가능
      </label>
    </div>

    <div v-if="!isCollapsed" class="filter-section">
      <div class="filter-title">결과</div>
      <label>
        <input
          type="checkbox"
          :checked="resultFilters.pass"
          @change="updateResultFilter('pass', $event)"
        />
        PASS
      </label>
      <label>
        <input
          type="checkbox"
          :checked="resultFilters.fail"
          @change="updateResultFilter('fail', $event)"
        />
        FAIL
      </label>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
// SvgIcon과 mdiMagnify, mdiRefresh는 SearchInput.vue로 옮겨졌으므로 여기서는 필요 없습니다.
// import SvgIcon from '@jamescoyle/vue-icon';
// import { mdiMagnify, mdiRefresh } from '@mdi/js';

const props = defineProps({
  searchQuery: String,
  statusFilters: Object,
  resultFilters: Object,
  isCollapsed: Boolean, // MainLayout에서 전달받은 isSidebarCollapsed 상태
})

const emit = defineEmits([
  'update:searchQuery', // searchQuery 관련 emit은 SearchInput.vue로 옮겨졌지만, props로 받으므로 유지
  'update:statusFilters',
  'update:resultFilters',
  'reset-filters', // SearchInput.vue에서 직접 emit하지만, TraineeMain.vue에서 핸들링하므로 여기도 유지
])

const updateStatusFilter = (key, event) => {
  const newStatusFilters = { ...props.statusFilters, [key]: event.target.checked }
  emit('update:statusFilters', newStatusFilters)
}

const updateResultFilter = (key, event) => {
  const newResultFilters = { ...props.resultFilters, [key]: event.target.checked }
  emit('update:resultFilters', newResultFilters)
}

// 검색어 및 필터 초기화 함수 (TraineeMain에서 호출)
// 이 함수는 TraineeMain.vue에서 @reset-filters를 통해 직접 호출됩니다.
// TraineeMainSideBar는 이 함수를 직접 호출하지 않습니다.
const resetFilters = () => {
  emit('reset-filters')
}

// SearchInputComponent는 이제 별도의 파일로 분리되었으므로,
// defineExpose({ SearchInputComponent }) 부분은 여기에서 제거합니다.
</script>

<style scoped>
.trainee-main-sidebar-content {
  width: 100%;
  height: 100%;
  padding: 5px; /* padding을 MainLayout의 sidebar-content-slot에서 제어합니다. */
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  font-size: 14px;
}

/* 검색 컨테이너 스타일 (SearchInput.vue로 이동) */
/* .search-container { ... } */

/* 필터 섹션 위의 구분선 */
.divider {
  border: 0;
  border-top: 1px solid #e0e0e0;
  margin: -10px 0;
}

/* 필터 섹션 */
.filter-section {
  margin-top: 14px; /* 구분선 아래 간격 */
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-self: flex-start; /* 이 섹션도 왼쪽으로 정렬 */
}

.filter-title {
  font-weight: bold;
  font-size: 16px;
  margin-bottom: 2px;
  color: #444;
}

.filter-section label {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #444;
  font-size: 13px;
  cursor: pointer;
}

/* 커스텀 체크박스 스타일 */
.filter-section input[type='checkbox'] {
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
  flex-shrink: 0;
}

.filter-section input[type='checkbox']:checked {
  background-color: #191d5a;
  border-color: #191d5a;
}

.filter-section input[type='checkbox']:checked::after {
  content: '✔';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 10px;
  line-height: 1;
}
</style>
