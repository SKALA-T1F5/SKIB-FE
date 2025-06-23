<template>
  <div class="trainer-main-sidebar-content">
    <hr v-if="!isCollapsed" class="divider" />
  </div>
</template>

<script setup>
import { ref, watch, defineProps, defineEmits } from 'vue'

const props = defineProps({
  searchQuery: String,
  // Project는 Status 속성을 가지고 있지 않으므로 statusFilters props 제거
  // statusFilters: Object,
  isCollapsed: Boolean,
})

// Project는 Status 속성을 가지고 있지 않으므로 'update:statusFilters' emit 제거
const emit = defineEmits(['update:searchQuery', 'reset-filters'])

const internalSearchQuery = ref(props.searchQuery)
// Project는 Status 속성을 가지고 있지 않으므로 internalStatusFilters 제거
// const internalStatusFilters = ref({ ...props.statusFilters })

watch(internalSearchQuery, (newValue) => {
  emit('update:searchQuery', newValue)
})

// Project는 Status 속성을 가지고 있지 않으므로 watch(internalStatusFilters...) 제거
// watch(
//   internalStatusFilters,
//   (newValue) => {
//     emit('update:statusFilters', newValue)
//   },
//   { deep: true },
// )

watch(
  () => props.searchQuery,
  (newValue) => {
    internalSearchQuery.value = newValue
  },
)

// Project는 Status 속성을 가지고 있지 않으므로 watch(() => props.statusFilters...) 제거
// watch(
//   () => props.statusFilters,
//   (newValue) => {
//     internalStatusFilters.value = { ...newValue }
//   },
//   { deep: true },
// )

// Project는 Status 속성을 가지고 있지 않으므로 updateStatusFilter 함수 제거
// const updateStatusFilter = (key, event) => {
//   const newStatusFilters = { ...props.statusFilters, [key]: event.target.checked }
//   emit('update:statusFilters', newStatusFilters)
// }

// Note: The resetFilters function is triggered from TrainerMain.vue
// via the @reset-filters event, not directly from this component.
// It's conceptually part of the sidebar's functionality but handled
// at the parent component level to reset all filters.
</script>

<style scoped>
.trainer-main-sidebar-content {
  width: 100%;
  height: 100%;
  padding: 5px; /* Consistent with TraineeMainSideBar.vue */
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  font-size: 14px;
}

/* 필터 섹션 위의 구분선 */
.divider {
  border: 0;
  border-top: 1px solid #e0e0e0;
  margin: -10px 0;
}

/* Project는 Status 속성을 가지고 있지 않으므로 필터 섹션 관련 스타일 제거 */
/*
.filter-section {
  margin-top: 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-self: flex-start;
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
*/
</style>
