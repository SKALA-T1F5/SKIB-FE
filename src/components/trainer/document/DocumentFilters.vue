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

    <v-col cols="12" md="3">
      <v-select
        :model-value="filterType"
        @update:model-value="updateFilterType"
        label="파일 유형"
        :items="fileTypes"
        density="comfortable"
        hide-details
        variant="outlined"
        class="rounded-input"
        prepend-inner-icon="mdi-filter-variant"
        clearable
      />
    </v-col>

    <v-col cols="12" md="3" class="d-flex justify-end">
      <v-btn-toggle
        :model-value="viewMode"
        @update:model-value="updateViewMode"
        density="comfortable"
        class="view-toggle"
        rounded
        color="primary"
      >
        <v-btn value="grid" icon :aria-label="'그리드 보기'">
          <v-icon>mdi-view-grid</v-icon>
        </v-btn>
        <v-btn value="list" icon :aria-label="'리스트 보기'">
          <v-icon>mdi-format-list-bulleted</v-icon>
        </v-btn>
      </v-btn-toggle>
    </v-col>
  </v-row>
</template>

<script setup>
const props = defineProps({
  searchQuery: String,
  filterType: String,
  viewMode: String,
})

const emit = defineEmits(['update:searchQuery', 'update:filterType', 'update:viewMode'])

const fileTypes = ['PDF', 'DOC', 'DOCX', 'TXT', 'PNG', 'JPG']

const updateSearchQuery = (value) => {
  emit('update:searchQuery', value)
}

const updateFilterType = (value) => {
  emit('update:filterType', value)
}

const updateViewMode = (value) => {
  emit('update:viewMode', value)
}
</script>

<style scoped>
/* Vuetify의 기본 gutter를 사용하기 위해 no-gutters 제거 */
.filters-row {
  margin-bottom: 12px;
  /* gap 대신 Vuetify 그리드 시스템의 패딩을 활용 */
}

/* md 이상에서 필터 요소 사이 간격 조정 */
@media (min-width: 960px) {
  .filters-row .v-col:nth-child(2) {
    margin-left: 8px; /* 파일 유형 필터 왼쪽 마진 */
  }
  .filters-row .v-col:nth-child(3) {
    margin-left: auto; /* 보기모드 전환 버튼을 오른쪽으로 밀기 */
  }
}

.rounded-input :deep(.v-input__control) {
  border-radius: 8px !important;
}

.view-toggle {
  background: #f4f4f4;
  border-radius: 8px;
  box-shadow: none;
}
</style>
