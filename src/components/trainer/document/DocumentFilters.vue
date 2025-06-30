<template>
  <v-row class="filters-row" align="center" justify="space-between">
    <v-col cols="12" md="4">
      <v-text-field
        :model-value="searchQuery"
        @update:model-value="updateSearchQuery"
        label="문서 검색"
        prepend-inner-icon="mdi-magnify"
        density="comfortable"
        hide-details
        variant="outlined"
        class="rounded-input"
      />
    </v-col>
  </v-row>
</template>

<script setup>
const props = defineProps({
  searchQuery: String,
  // filterType: String, // 제거
  // viewMode: String, // 제거
})

const emit = defineEmits([
  'update:searchQuery',
  // 'update:filterType', // 제거
  // 'update:viewMode', // 제거
])

// fileTypes 정의 제거
// const fileTypes = ['PDF', 'DOC', 'DOCX', 'TXT', 'PNG', 'JPG']

const updateSearchQuery = (value) => {
  emit('update:searchQuery', value)
}

// updateFilterType 제거
// const updateFilterType = (value) => {
//   emit('update:filterType', value)
// }

// updateViewMode 제거
// const updateViewMode = (value) => {
//   emit('update:viewMode', value)
// }
</script>

<style scoped>
.filters-row {
  margin-bottom: 12px;
}

@media (min-width: 960px) {
  /* 필터 요소 간격 조정은 이제 검색 필드만 남았으므로 필요 없을 수 있음 */
  /* .filters-row .v-col:nth-child(2) {
    margin-left: 8px;
  }
  .filters-row .v-col:nth-child(3) {
    margin-left: auto;
  } */
}

.rounded-input :deep(.v-input__control) {
  border-radius: 8px !important;
}

/* view-toggle 스타일 제거 */
/* .view-toggle {
  background: #f4f4f4;
  border-radius: 8px;
  box-shadow: none;
} */
</style>
